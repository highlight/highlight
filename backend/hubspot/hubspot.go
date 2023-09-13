package hubspot

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/aws/smithy-go/ptr"
	"github.com/goware/emailproviders"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/leonelquinteros/hubspot"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const PartitionKey = "hubspot"

// ClientSideContactCreationTimeout is the time we will wait for the object to be created by the hubspot client-side snippet
const ClientSideContactCreationTimeout = time.Minute

// ClientSideCompanyCreationTimeout is double the contact creation time because we expect contact creation to create a company.
// The company creation backend task can be kicked off at the same time that contact creation is kicked off,
// but because the two are queued in the same partition, they will always happen one after the other.
const ClientSideCompanyCreationTimeout = ClientSideContactCreationTimeout

const ClientSideCreationPollInterval = 5 * time.Second

var (
	OAuthToken = os.Getenv("HUBSPOT_OAUTH_TOKEN")
	APIKey     = os.Getenv("HUBSPOT_API_KEY")
	// CookieString and CSRFToken are reverse engineered from the frontend request flow.
	// they only need to be set for the doppelgänger functionality.
	CookieString = os.Getenv("HUBSPOT_COOKIE_STRING")
	CSRFToken    = os.Getenv("HUBSPOT_CSRF_TOKEN")
)

func pollHubspot[T any](fn func() (*T, error), timeout time.Duration) (result *T, err error) {
	span := tracer.StartSpan("pollHubspot", tracer.ResourceName("hubspot"), tracer.Tag("timeout", timeout))
	defer span.Finish()
	start := time.Now()
	ticker := time.NewTicker(ClientSideCreationPollInterval)
	defer ticker.Stop()
	for t := range ticker.C {
		result, err = fn()
		if result != nil {
			return
		}
		if t.Sub(start) > timeout {
			break
		}
	}
	return
}

func getDomain(adminEmail string) (domain string) {
	if !emailproviders.Exists(adminEmail) {
		components := strings.Split(adminEmail, "@")
		if len(components) > 1 {
			domain = components[1]
		}
	}
	return
}

type Api interface {
	CreateContactForAdmin(ctx context.Context, adminID int, email string, userDefinedRole, userDefinedPersona, userDefinedTeamSize string, first, last string, phone, referral string) error
	CreateCompanyForWorkspace(ctx context.Context, workspaceID int, adminEmail string, name string) error
	CreateContactCompanyAssociation(ctx context.Context, adminID int, workspaceID int) error
	UpdateContactProperty(ctx context.Context, adminID int, properties []hubspot.Property) error
	UpdateCompanyProperty(ctx context.Context, workspaceID int, properties []hubspot.Property) error
}

type Client struct {
	db            *gorm.DB
	hubspotClient hubspot.Client
	redisClient   *redis.Client
	kafkaProducer *kafka_queue.Queue
}

func NewHubspotAPI(client hubspot.Client, db *gorm.DB, redisClient *redis.Client, kafkaProducer *kafka_queue.Queue) *Client {
	return &Client{
		db:            db,
		hubspotClient: client,
		redisClient:   redisClient,
		kafkaProducer: kafkaProducer,
	}
}

// this is taken/edits from https://sourcegraph.com/github.com/leonelquinteros/hubspot/-/blob/contacts.go, but I got rid of 'AssociatedCompany' because of errors.
type CustomContactsResponse struct {
	PortalID     int    `json:"portal-id"`
	Vid          int    `json:"vid"`
	CanonicalVid int    `json:"canonical-vid"`
	MergeVids    []int  `json:"merge-vids"`
	IsContact    bool   `json:"is-contact"`
	ProfileToken string `json:"profile-token"`
	ProfileURL   string `json:"profile-url"`
}

type CompanyProperty struct {
	Value     string `json:"value"`
	Timestamp int64  `json:"timestamp"`
}

type CompanyResponse struct {
	PortalID   int                         `json:"portalId"`
	CompanyID  int                         `json:"companyId"`
	Properties map[string]*CompanyProperty `json:"properties"`
}

type CompaniesResponse struct {
	Companies []*CompanyResponse `json:"companies"`
	HasMore   bool               `json:"has-more"`
	Offset    int                `json:"offset"`
}

type DoppelgangersPropertyVersion struct {
	Name      string `json:"name"`
	Source    string `json:"source"`
	SourceID  string `json:"sourceId"`
	SourceVid any    `json:"sourceVid"`
	Timestamp int    `json:"timestamp"`
	Value     string `json:"value"`
}

type DoppelgangersProperty struct {
	PersistenceTimestamp *int                            `json:"persistenceTimestamp"`
	Source               string                          `json:"source"`
	SourceID             string                          `json:"sourceId"`
	Timestamp            *int                            `json:"timestamp"`
	UpdatedByUserID      *int                            `json:"updatedByUserId"`
	Value                *string                         `json:"value"`
	Versions             []*DoppelgangersPropertyVersion `json:"versions"`
}

type DoppelgangersObject struct {
	ObjectType string                            `json:"objectType"`
	ObjectID   int                               `json:"objectId"`
	PortalID   int                               `json:"portalId"`
	Properties map[string]*DoppelgangersProperty `json:"properties"`
}

type DoppelgangersResult struct {
	FeedbackID      string  `json:"feedbackId"`
	ID1             int     `json:"id1"`
	ID2             int     `json:"id2"`
	SimilarityScore float64 `json:"similarityScore"`
}

type DoppelgangersUserSavedPropertyOption struct {
	DisplayOrder int    `json:"displayOrder"`
	Hidden       bool   `json:"hidden"`
	Label        string `json:"label"`
	ReadOnly     bool   `json:"readOnly"`
	Value        string `json:"value"`
}

type DoppelgangersUserSavedProperty struct {
	ExternalOptionsReferenceType *string                                 `json:"externalOptionsReferenceType"`
	FieldType                    string                                  `json:"fieldType"`
	Hidden                       bool                                    `json:"hidden"`
	HubspotDefined               bool                                    `json:"hubspotDefined"`
	Label                        string                                  `json:"label"`
	Name                         string                                  `json:"name"`
	Type                         string                                  `json:"type"`
	Options                      []*DoppelgangersUserSavedPropertyOption `json:"options"`
}

type DoppelgangersResponse struct {
	Results             []*DoppelgangersResult            `json:"results"`
	Objects             map[int]*DoppelgangersObject      `json:"objects"`
	UserSavedProperties []*DoppelgangersUserSavedProperty `json:"userSavedProperties"`
	HasMore             bool                              `json:"hasMore"`
	Offset              int                               `json:"offset"`
	Total               int                               `json:"total"`
	LastScoredTimestamp int64                             `json:"lastScoredTimestamp"`
}

type QSParam struct {
	key   string
	value string
}

func (h *Client) doRequest(ctx context.Context, url string, result interface{}, params []QSParam, method string, b io.Reader) error {
	for {
		req, _ := http.NewRequest(method, fmt.Sprintf("https://api.hubapi.com%s", url), b)
		req.Header.Add("Accept", "application/json")
		req.Header.Add("Content-Type", "application/json")
		req.Header.Add("Authorization", "Bearer "+OAuthToken)
		q := req.URL.Query()
		q.Add("hapikey", APIKey)
		for _, p := range params {
			q.Add(p.key, p.value)
		}
		// for doppelgänger requests
		if CookieString != "" {
			for _, s := range strings.Split(CookieString, "; ") {
				val := strings.Split(s, "=")
				k, v := val[0], val[1]
				req.AddCookie(&http.Cookie{Name: k, Value: v})
			}
		}
		// for doppelgänger requests
		if CSRFToken != "" {
			req.Header.Add("X-Hubspot-Csrf-Hubspotapi", CSRFToken)
		}
		req.URL.RawQuery = q.Encode()

		httpClient := http.Client{}
		resp, err := httpClient.Do(req)
		if err != nil {
			return err
		}
		defer func(Body io.ReadCloser) {
			_ = Body.Close()
		}(resp.Body)

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}

		if result != nil {
			err = json.Unmarshal(body, &result)
			if err != nil {
				return err
			}
		}

		if resp.StatusCode != 200 && resp.StatusCode != 204 {
			if resp.StatusCode == 429 && strings.Contains(string(body), "RATE_LIMIT") {
				log.WithContext(ctx).WithField("body", string(body)).Warn("hit hubspot rate limit")
				time.Sleep(10 * time.Second)
				continue
			}
			return fmt.Errorf("HubSpot API error: %d - %s \n%s", resp.StatusCode, resp.Status, string(body))
		}
		return nil
	}
}

func (h *Client) getDoppelgangers(ctx context.Context) (results []*DoppelgangersResult, objects map[int]*DoppelgangersObject, err error) {
	objects = make(map[int]*DoppelgangersObject)
	for {
		r := DoppelgangersResponse{}
		if err = h.doRequest(ctx, "/doppelganger/v1/similar/company/resultPage", &r, []QSParam{
			{key: "pageSize", value: "50"},
			{key: "offset", value: strconv.Itoa(len(results))},
			{key: "properties", value: "name"},
			{key: "properties", value: "domain"},
			{key: "properties", value: "hs_num_child_companies"},
			{key: "properties", value: "hs_parent_company_id"},
			{key: "properties", value: "hs_last_sales_activity_timestamp"},
			{key: "properties", value: "createdate"},
			{key: "properties", value: "hs_lastmodifieddate"},
			{key: "portalId", value: "20473940"},
		}, "GET", nil); err != nil {
			return
		} else {
			for k, v := range r.Objects {
				objects[k] = v
			}
			results = append(results, r.Results...)
			if !r.HasMore {
				break
			}
		}
	}

	for {
		r := DoppelgangersResponse{}
		if err = h.doRequest(ctx, "/doppelganger/v1/similar/contact/resultPage", &r, []QSParam{
			{key: "pageSize", value: "50"},
			{key: "offset", value: strconv.Itoa(len(results))},
			{key: "properties", value: "firstname"},
			{key: "properties", value: "lastname"},
			{key: "properties", value: "email"},
			{key: "properties", value: "jobtitle"},
			{key: "properties", value: "hs_sequences_is_enrolled"},
			{key: "properties", value: "hs_last_sales_activity_timestamp"},
			{key: "properties", value: "createdate"},
			{key: "properties", value: "lastmodifieddate"},
			{key: "portalId", value: "20473940"},
		}, "GET", nil); err != nil {
			return
		} else {
			for k, v := range r.Objects {
				objects[k] = v
			}
			results = append(results, r.Results...)
			if !r.HasMore {
				break
			}
		}
	}
	return
}

func (h *Client) mergeCompanies(keepID, mergeID int) error {
	return h.doRequest(context.TODO(), fmt.Sprintf("/companies/v2/companies/%d/merge", keepID), nil, []QSParam{
		{key: "portalId", value: "20473940"},
	}, "PUT", strings.NewReader(fmt.Sprintf(`{"companyIdToMerge":%d}`, mergeID)))
}

func (h *Client) mergeContacts(keepID, mergeID int) error {
	return h.doRequest(context.TODO(), fmt.Sprintf("/contacts/v1/contact/%d/merge", keepID), nil, []QSParam{
		{key: "portalId", value: "20473940"},
	}, "POST", strings.NewReader(fmt.Sprintf(`{"vidToMerge":%d}`, mergeID)))
}

func (h *Client) getAllCompanies(ctx context.Context) (companies []*CompanyResponse, err error) {
	span := tracer.StartSpan("getAllCompanies", tracer.ResourceName("hubspot"))
	defer span.Finish(tracer.WithError(err))
	if h.redisClient != nil {
		err = h.redisClient.GetHubspotCompanies(ctx, &companies)
		if err == nil && len(companies) > 0 {
			return companies, nil
		}
	}
	offset := 0
	for {
		r := CompaniesResponse{}
		if err = h.doRequest(ctx, "/companies/v2/companies/paged", &r, []QSParam{
			{key: "pageSize", value: "100"},
			{key: "offset", value: strconv.Itoa(offset)},
			{key: "properties", value: "name"},
			{key: "properties", value: "website"},
			{key: "portalId", value: "20473940"},
		}, "GET", nil); err != nil {
			return
		} else {
			offset = r.Offset
			companies = append(companies, r.Companies...)
			if !r.HasMore {
				break
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
	if h.redisClient != nil {
		_ = h.redisClient.SetHubspotCompanies(ctx, &companies)
	}
	return
}

func (h *Client) getCompany(ctx context.Context, name, domain string) (*int, error) {
	span := tracer.StartSpan("getCompany", tracer.ResourceName("hubspot"))
	defer span.Finish()
	return redis.CachedEval(ctx, h.redisClient, fmt.Sprintf("hubspot-company-%s-%s", name, domain), time.Second, ClientSideContactCreationTimeout/4, func() (*int, error) {
		r := struct {
			Results []struct {
				CompanyId int `json:"companyId"`
			} `json:"results"`
		}{}
		body, _ := json.Marshal(struct {
			Limit          int `json:"limit"`
			RequestOptions struct {
				Properties []string `json:"properties"`
			} `json:"requestOptions"`
		}{100, struct {
			Properties []string `json:"properties"`
		}{[]string{"domain", "name", "createdate", "hs_lastmodifieddate"}}})
		err := h.doRequest(ctx, fmt.Sprintf("/companies/v2/domains/%s/companies", domain), &r, nil, "POST", bytes.NewReader(body))
		if err == nil && len(r.Results) > 0 {
			return pointy.Int(r.Results[0].CompanyId), nil
		}

		if name == "" {
			return nil, e.New(fmt.Sprintf("failed to find company based on domain alone %s", domain))
		}

		companies, err := h.getAllCompanies(ctx)
		if err != nil {
			return nil, err
		}
		var nameCompany *CompanyResponse
		for _, company := range companies {
			for prop, data := range company.Properties {
				if prop == "name" || prop == "website" {
					if strings.EqualFold(data.Value, name) {
						nameCompany = company
					}
				}
			}
		}
		if nameCompany != nil {
			log.WithContext(ctx).WithField("name", name).WithField("domain", "domain").WithField("company_id", nameCompany.CompanyID).Info("hubspot found company based on name")
			return pointy.Int(nameCompany.CompanyID), nil
		} else {
			return nil, e.New(fmt.Sprintf("failed to find company with name %s domain %s", name, domain))
		}
	})
}

func (h *Client) getContactForAdmin(ctx context.Context, email string) (contactId *int, err error) {
	span := tracer.StartSpan("getContactForAdmin", tracer.ResourceName("hubspot"))
	defer span.Finish(tracer.WithError(err))
	return redis.CachedEval(ctx, h.redisClient, fmt.Sprintf("hubspot-email-%s", email), time.Second, ClientSideContactCreationTimeout/4, func() (*int, error) {
		r := CustomContactsResponse{}
		if err = h.hubspotClient.Contacts().Client.Request("GET", "/contacts/v1/contact/email/"+email+"/profile", nil, &r); err != nil {
			return nil, err
		} else {
			return pointy.Int(r.Vid), nil
		}
	})
}

func (h *Client) createContactForAdmin(ctx context.Context, email string, userDefinedRole, userDefinedPersona, userDefinedTeamSize string, first string, last string, phone string, referral string) (contactId *int, err error) {
	var hubspotContactId int
	if resp, err := h.hubspotClient.Contacts().Create(hubspot.ContactsRequest{
		Properties: []hubspot.Property{
			{
				Property: "email",
				Name:     "email",
				Value:    email,
			},
			{
				Property: "user_defined_role",
				Name:     "user_defined_role",
				Value:    userDefinedRole,
			},
			{
				Property: "user_defined_persona",
				Name:     "user_defined_persona",
				Value:    userDefinedPersona,
			},
			{
				Property: "user_defined_team_size",
				Name:     "user_defined_team_size",
				Value:    userDefinedTeamSize,
			},
			{
				Property: "firstname",
				Name:     "firstname",
				Value:    first,
			},
			{
				Property: "lastname",
				Name:     "lastname",
				Value:    last,
			},
			{
				Property: "phone",
				Name:     "phone",
				Value:    phone,
			},
			{
				Property: "referral_url",
				Name:     "referral_url",
				Value:    referral,
			},
		},
	}); err != nil {
		// If there's an error creating the contact, assume its a conflict and try to get the existing user.
		if contact, err := h.getContactForAdmin(ctx, email); err == nil {
			return contact, nil
		}
	} else {
		hubspotContactId = resp.Vid
	}
	log.WithContext(ctx).Infof("succesfully created a hubspot contact with id: %v", hubspotContactId)

	return &hubspotContactId, nil
}

func (h *Client) updateAdminHubspotContactID(ctx context.Context, admin *model.Admin, fn func(hubspotContactID *int) error) error {
	hubspotContactID := admin.HubspotContactID
	if ptr.ToInt(hubspotContactID) == 0 {
		var err error
		hubspotContactID, err = h.getContactForAdmin(ctx, ptr.ToString(admin.Email))
		if err != nil {
			return err
		}
		err = h.db.Model(&model.Admin{Model: model.Model{ID: admin.ID}}).Updates(&model.Admin{HubspotContactID: hubspotContactID}).Error
		if err != nil {
			return err
		}
	}
	admin.HubspotContactID = hubspotContactID
	err := fn(admin.HubspotContactID)
	// clear the admin hubspot contact id if it is not correct
	if err != nil {
		h.db.Model(&model.Admin{Model: model.Model{ID: admin.ID}}).Select("hubspot_contact_id").Updates(&model.Admin{})
		admin.HubspotContactID = nil
		return err
	}
	return err
}

func (h *Client) updateWorkspaceHubspotCompanyID(ctx context.Context, workspace *model.Workspace, fn func(hubspotCompanyID *int) error) error {
	hubspotCompanyId := workspace.HubspotCompanyID
	if ptr.ToInt(hubspotCompanyId) == 0 {
		var err error
		var domain string
		if len(workspace.Admins) > 0 {
			domain = getDomain(ptr.ToString(workspace.Admins[0].Email))
		}
		hubspotCompanyId, err = h.getCompany(ctx, ptr.ToString(workspace.Name), domain)
		if err != nil {
			return err
		}
		err = h.db.Model(&model.Workspace{Model: model.Model{ID: workspace.ID}}).Updates(&model.Workspace{HubspotCompanyID: hubspotCompanyId}).Error
		if err != nil {
			return err
		}
	}
	workspace.HubspotCompanyID = hubspotCompanyId
	err := fn(workspace.HubspotCompanyID)
	// clear the workspace hubspot company id if it is not correct
	if err != nil {
		h.db.Model(&model.Workspace{Model: model.Model{ID: workspace.ID}}).Select("hubspot_company_id").Updates(&model.Workspace{})
		workspace.HubspotCompanyID = nil
		return err
	}
	return err
}

func (h *Client) CreateContactCompanyAssociation(ctx context.Context, adminID int, workspaceID int) error {
	return h.kafkaProducer.Submit(ctx, PartitionKey, &kafka_queue.Message{
		Type: kafka_queue.HubSpotCreateContactCompanyAssociation,
		HubSpotCreateContactCompanyAssociation: &kafka_queue.HubSpotCreateContactCompanyAssociationArgs{
			AdminID:     adminID,
			WorkspaceID: workspaceID,
		},
	})
}

func (h *Client) CreateContactCompanyAssociationImpl(ctx context.Context, adminID int, workspaceID int) error {
	admin := &model.Admin{}
	if err := h.db.Model(&model.Admin{}).Where("id = ?", adminID).Take(&admin).Error; err != nil {
		return err
	}

	if err := h.updateAdminHubspotContactID(ctx, admin, func(hubspotContactID *int) error {
		return h.db.Model(&model.Admin{Model: model.Model{ID: adminID}}).Updates(&model.Admin{HubspotContactID: hubspotContactID}).Error
	}); err != nil {
		return err
	}

	workspace := &model.Workspace{}
	if err := h.db.Model(&model.Workspace{}).Where("id = ?", workspaceID).Take(&workspace).Error; err != nil {
		return err
	}

	if err := h.updateWorkspaceHubspotCompanyID(ctx, workspace, func(hubspotCompanyID *int) error {
		return h.db.Model(&model.Workspace{Model: model.Model{ID: workspaceID}}).Updates(&model.Workspace{HubspotCompanyID: hubspotCompanyID}).Error
	}); err != nil {
		return err
	}

	if workspace.HubspotCompanyID == nil {
		return e.New("hubspot company id is empty")
	} else if admin.HubspotContactID == nil {
		return e.New("hubspot contact id is empty")
	}

	data := &struct{ companyID, contactID int }{*workspace.HubspotCompanyID, *admin.HubspotContactID}
	if err := h.hubspotClient.CRMAssociations().Create(hubspot.CRMAssociationsRequest{
		DefinitionID: hubspot.CRMAssociationCompanyToContact,
		FromObjectID: data.companyID,
		ToObjectID:   data.contactID,
	}); err != nil {
		return err
	} else {
		log.WithContext(ctx).WithField("adminID", adminID).WithField("workspaceID", workspaceID).WithField("company_id", data.companyID).WithField("contact_id", data.contactID).Info("success creating company to contact association")
	}
	if err := h.hubspotClient.CRMAssociations().Create(hubspot.CRMAssociationsRequest{
		DefinitionID: hubspot.CRMAssociationContactToCompany,
		FromObjectID: data.contactID,
		ToObjectID:   data.companyID,
	}); err != nil {
		return err
	} else {
		log.WithContext(ctx).WithField("adminID", adminID).WithField("workspaceID", workspaceID).WithField("company_id", data.companyID).WithField("contact_id", data.contactID).Info("success creating contact to company association")
	}
	return nil
}

func (h *Client) CreateContactForAdmin(ctx context.Context, adminID int, email string, userDefinedRole, userDefinedPersona, userDefinedTeamSize string, first string, last string, phone string, referral string) error {
	return h.kafkaProducer.Submit(ctx, PartitionKey, &kafka_queue.Message{
		Type: kafka_queue.HubSpotCreateContactForAdmin,
		HubSpotCreateContactForAdmin: &kafka_queue.HubSpotCreateContactForAdminArgs{
			AdminID:             adminID,
			Email:               email,
			UserDefinedRole:     userDefinedRole,
			UserDefinedPersona:  userDefinedPersona,
			UserDefinedTeamSize: userDefinedTeamSize,
			First:               first,
			Last:                last,
			Phone:               phone,
			Referral:            referral,
		},
	})
}

func (h *Client) CreateContactForAdminImpl(ctx context.Context, adminID int, email string, userDefinedRole, userDefinedPersona, userDefinedTeamSize string, first string, last string, phone string, referral string) (contactId *int, err error) {
	if contactId, err = pollHubspot(func() (*int, error) {
		return h.getContactForAdmin(ctx, email)
	}, ClientSideContactCreationTimeout); contactId == nil {
		log.WithContext(ctx).
			WithField("email", email).
			Warnf("failed to get client-side hubspot contact. creating")
		contactId, err = h.createContactForAdmin(ctx, email, userDefinedRole, userDefinedPersona, userDefinedTeamSize, first, last, phone, referral)
		if err != nil || contactId == nil {
			return nil, err
		}
		log.WithContext(ctx).Infof("succesfully created a hubspot contact with id: %v", *contactId)
	}

	if err := h.db.Model(&model.Admin{Model: model.Model{ID: adminID}}).
		Updates(&model.Admin{HubspotContactID: contactId}).Error; err != nil {
		return nil, err
	}
	return
}

func (h *Client) CreateCompanyForWorkspace(ctx context.Context, workspaceID int, adminEmail string, name string) error {
	return h.kafkaProducer.Submit(ctx, PartitionKey, &kafka_queue.Message{
		Type: kafka_queue.HubSpotCreateCompanyForWorkspace,
		HubSpotCreateCompanyForWorkspace: &kafka_queue.HubSpotCreateCompanyForWorkspaceArgs{
			WorkspaceID: workspaceID,
			AdminEmail:  adminEmail,
			Name:        name,
		},
	})
}

func (h *Client) CreateCompanyForWorkspaceImpl(ctx context.Context, workspaceID int, adminEmail, name string) (companyID *int, err error) {
	// Don't create for Demo account
	if workspaceID == 0 {
		return
	}

	workspace := &model.Workspace{}
	if err := h.db.Model(&model.Workspace{}).Where("id = ?", workspaceID).Take(&workspace).Error; err != nil {
		return nil, err
	}

	domain := getDomain(adminEmail)
	hexLink := fmt.Sprintf("https://workspace-details.highlight.io?_workspace_id=%v", workspaceID)
	companyProperties := hubspot.CompaniesRequest{
		Properties: []hubspot.Property{
			{
				Property: "name",
				Name:     "name",
				Value:    name,
			},
			{
				Property: "domain",
				Name:     "domain",
				Value:    domain,
			},
			{
				Property: "hex_link",
				Name:     "hex_link",
				Value:    hexLink,
			},
		},
	}

	if companyID, _ = pollHubspot(func() (*int, error) {
		return h.getCompany(ctx, name, domain)
	}, ClientSideCompanyCreationTimeout); companyID != nil {
		log.WithContext(ctx).
			WithField("name", name).
			WithField("domain", domain).
			Infof("company already exists in Hubspot. updating")

		if _, err := h.hubspotClient.Companies().Update(*companyID, companyProperties); err != nil {
			return nil, err
		}
	} else {
		log.WithContext(ctx).
			WithField("name", name).
			Warnf("failed to get client-side hubspot company. creating")

		resp, err := h.hubspotClient.Companies().Create(companyProperties)
		if err != nil {
			return nil, err
		}
		companyID = &resp.CompanyID
		log.WithContext(ctx).Infof("succesfully created a hubspot company with id: %v", resp.CompanyID)
	}

	err = h.db.Model(&model.Workspace{Model: model.Model{ID: workspaceID}}).Updates(&model.Workspace{HubspotCompanyID: companyID}).Error
	return
}

func (h *Client) UpdateContactProperty(ctx context.Context, adminID int, properties []hubspot.Property) error {
	return h.kafkaProducer.Submit(ctx, PartitionKey, &kafka_queue.Message{
		Type: kafka_queue.HubSpotUpdateContactProperty,
		HubSpotUpdateContactProperty: &kafka_queue.HubSpotUpdateContactPropertyArgs{
			AdminID:    adminID,
			Properties: properties,
		},
	})
}

func (h *Client) UpdateContactPropertyImpl(ctx context.Context, adminID int, properties []hubspot.Property) error {
	admin := &model.Admin{}
	if err := h.db.Model(&model.Admin{}).Where("id = ?", adminID).Take(&admin).Error; err != nil {
		return err
	}

	return h.updateAdminHubspotContactID(ctx, admin, func(hubspotContactID *int) error {
		return h.hubspotClient.Contacts().Update(ptr.ToInt(hubspotContactID), hubspot.ContactsRequest{
			Properties: properties,
		})
	})
}

func (h *Client) UpdateCompanyProperty(ctx context.Context, workspaceID int, properties []hubspot.Property) error {
	return h.kafkaProducer.Submit(ctx, PartitionKey, &kafka_queue.Message{
		Type: kafka_queue.HubSpotUpdateCompanyProperty,
		HubSpotUpdateCompanyProperty: &kafka_queue.HubSpotUpdateCompanyPropertyArgs{
			WorkspaceID: workspaceID,
			Properties:  properties,
		},
	})
}

func (h *Client) UpdateCompanyPropertyImpl(ctx context.Context, workspaceID int, properties []hubspot.Property) error {
	workspace := &model.Workspace{}
	if err := h.db.Model(&model.Workspace{}).Preload("Admins").Where("id = ?", workspaceID).Take(&workspace).Error; err != nil {
		return err
	}
	return h.updateWorkspaceHubspotCompanyID(ctx, workspace, func(hubspotCompanyID *int) error {
		_, err := h.hubspotClient.Companies().Update(ptr.ToInt(hubspotCompanyID), hubspot.CompaniesRequest{
			Properties: properties,
		})
		return err
	})
}
