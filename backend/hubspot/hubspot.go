package hubspot

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"

	"github.com/aws/smithy-go/ptr"
	"github.com/goware/emailproviders"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/leonelquinteros/hubspot"
	e "github.com/pkg/errors"

	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const Retries = 5

// ClientSideCreationTimeout is the time we will wait for the object to be created by the hubspot client-side snippet
const ClientSideCreationTimeout = 3 * time.Minute
const ClientSideCreationPollInterval = 5 * time.Second

func retry[T *int](fn func() (T, error)) (ret T, err error) {
	for i := 0; i < Retries; i++ {
		ret, err = fn()
		if err == nil {
			return
		}
		time.Sleep(16 * time.Millisecond * time.Duration(math.Pow(2, float64(i))))
	}
	return
}

func pollHubspot[T *int](fn func() (T, error)) (result T, err error) {
	start := time.Now()
	ticker := time.NewTicker(ClientSideCreationPollInterval)
	defer ticker.Stop()
	for t := range ticker.C {
		result, err = fn()
		if result != nil {
			return
		}
		if t.Sub(start) > ClientSideCreationTimeout {
			break
		}
	}
	return
}

type HubspotApi struct {
	db            *gorm.DB
	hubspotClient hubspot.Client
	redisClient   *redis.Client
	kafkaProducer *kafka_queue.Queue
}

func NewHubspotAPI(client hubspot.Client, db *gorm.DB, redisClient *redis.Client, kafkaProducer *kafka_queue.Queue) *HubspotApi {
	return &HubspotApi{
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
	Results []*CompanyResponse `json:"results"`
	HasMore bool               `json:"hasMore"`
	Offset  int                `json:"offset"`
	Total   int                `json:"total"`
}

func (h *HubspotApi) doRequest(url string, result interface{}, params map[string]string) error {
	req, _ := http.NewRequest("GET", fmt.Sprintf("https://api.hubapi.com%s", url), nil)
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+os.Getenv("HUBSPOT_OAUTH_TOKEN"))
	q := req.URL.Query()
	q.Add("hapikey", os.Getenv("HUBSPOT_API_KEY"))
	for k, v := range params {
		q.Add(k, v)
	}
	req.URL.RawQuery = q.Encode()

	httpClient := &http.Client{}
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

	err = json.Unmarshal(body, &result)
	if err != nil {
		return err
	}

	if resp.StatusCode != 200 && resp.StatusCode != 204 {
		return fmt.Errorf("HubSpot API error: %d - %s \n%s", resp.StatusCode, resp.Status, string(body))
	}

	return nil
}

func (h *HubspotApi) getAllCompanies(ctx context.Context) (companies []*CompanyResponse, err error) {
	if h.redisClient != nil {
		err = h.redisClient.GetHubspotCompanies(ctx, &companies)
		if err == nil && len(companies) > 0 {
			return companies, nil
		}
	}
	offset := 0
	for {
		r := CompaniesResponse{}
		if err = h.doRequest("/companies/v2/companies/recent/created", &r, map[string]string{
			"count": "100", "offset": strconv.Itoa(offset),
		}); err != nil {
			return
		} else {
			companies = append(companies, r.Results...)
			if !r.HasMore {
				break
			}
			offset = r.Offset
		}
	}
	if h.redisClient != nil {
		_ = h.redisClient.SetHubspotCompanies(ctx, &companies)
	}
	return
}

func (h *HubspotApi) getCompany(ctx context.Context, name string) (*int, error) {
	companies, err := h.getAllCompanies(ctx)
	if err != nil {
		return nil, err
	}
	if company, ok := lo.Find(companies, func(response *CompanyResponse) bool {
		for prop, data := range response.Properties {
			if prop == "name" {
				return strings.EqualFold(data.Value, name)
			}
		}
		return false
	}); !ok {
		return nil, e.New(fmt.Sprintf("failed to find company with name %s", name))
	} else {
		return pointy.Int(company.CompanyID), nil
	}
}

func (h *HubspotApi) getContactForAdmin(email string) (contactId *int, err error) {
	r := CustomContactsResponse{}
	if err := h.hubspotClient.Contacts().Client.Request("GET", "/contacts/v1/contact/email/"+email+"/profile", nil, &r); err != nil {
		return nil, err
	} else {
		return pointy.Int(r.Vid), nil
	}
}

func (h *HubspotApi) createContactForAdmin(ctx context.Context, email string, userDefinedRole string, userDefinedPersona string, first string, last string, phone string, referral string) (contactId *int, err error) {
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
		if contact, err := h.getContactForAdmin(email); err == nil {
			return contact, nil
		}
	} else {
		hubspotContactId = resp.Vid
	}
	log.WithContext(ctx).Infof("succesfully created a hubspot contact with id: %v", hubspotContactId)

	return &hubspotContactId, nil
}

func (h *HubspotApi) CreateContactCompanyAssociation(ctx context.Context, adminID int, workspaceID int) error {
	admin := &model.Admin{}
	if err := h.db.Model(&model.Admin{}).Where("id = ?", adminID).First(&admin).Error; err != nil {
		return err
	}
	workspace := &model.Workspace{}
	if err := h.db.Model(&model.Workspace{}).Where("id = ?", workspaceID).First(&workspace).Error; err != nil {
		return err
	}
	if workspace.HubspotCompanyID == nil {
		return e.New("hubspot company id is empty")
	} else if admin.HubspotContactID == nil {
		return e.New("hubspot contact id is empty")
	}
	if err := h.hubspotClient.CRMAssociations().Create(hubspot.CRMAssociationsRequest{
		DefinitionID: hubspot.CRMAssociationCompanyToContact,
		FromObjectID: *workspace.HubspotCompanyID,
		ToObjectID:   *admin.HubspotContactID,
	}); err != nil {
		return err
	} else {
		log.WithContext(ctx).Info("success creating company to contact association")
	}
	if err := h.hubspotClient.CRMAssociations().Create(hubspot.CRMAssociationsRequest{
		DefinitionID: hubspot.CRMAssociationContactToCompany,
		FromObjectID: *admin.HubspotContactID,
		ToObjectID:   *workspace.HubspotCompanyID,
	}); err != nil {
		return err
	} else {
		log.WithContext(ctx).Info("success creating contact to company association")
	}
	return nil
}

func (h *HubspotApi) CreateContactForAdmin(ctx context.Context, adminID int, email string, userDefinedRole string, userDefinedPersona string, first string, last string, phone string, referral string) error {
	return h.kafkaProducer.Submit(ctx, &kafka_queue.Message{
		Type: kafka_queue.HubSpotCreateContactForAdmin,
		HubSpotCreateContactForAdmin: &kafka_queue.HubSpotCreateContactForAdminArgs{
			AdminID:            adminID,
			Email:              email,
			UserDefinedRole:    userDefinedRole,
			UserDefinedPersona: userDefinedPersona,
			First:              first,
			Last:               last,
			Phone:              phone,
			Referral:           referral,
		},
	}, "")
}

func (h *HubspotApi) CreateContactForAdminImpl(ctx context.Context, adminID int, email string, userDefinedRole string, userDefinedPersona string, first string, last string, phone string, referral string) (contactId *int, err error) {
	if contactId, err = pollHubspot(func() (*int, error) {
		return h.getContactForAdmin(email)
	}); contactId != nil {
		return
	}

	log.WithContext(ctx).
		WithField("email", email).
		Warnf("failed to get client-side hubspot contact. creating")
	contactId, err = retry(func() (*int, error) {
		return h.createContactForAdmin(ctx, email, userDefinedRole, userDefinedPersona, first, last, phone, referral)
	})

	if err != nil || contactId == nil {
		return nil, err
	}
	log.WithContext(ctx).Infof("succesfully created a hubspot contact with id: %v", contactId)
	if err := h.db.Model(&model.Admin{Model: model.Model{ID: adminID}}).
		Updates(&model.Admin{HubspotContactID: contactId}).Error; err != nil {
		return nil, err
	}
	return
}

func (h *HubspotApi) CreateCompanyForWorkspace(ctx context.Context, workspaceID int, adminEmail string, name string) error {
	return h.kafkaProducer.Submit(ctx, &kafka_queue.Message{
		Type: kafka_queue.HubSpotCreateCompanyForWorkspace,
		HubSpotCreateCompanyForWorkspace: &kafka_queue.HubSpotCreateCompanyForWorkspaceArgs{
			WorkspaceID: workspaceID,
			AdminEmail:  adminEmail,
			Name:        name,
		},
	}, "")
}

func (h *HubspotApi) CreateCompanyForWorkspaceImpl(ctx context.Context, workspaceID int, adminEmail string, name string) (companyID *int, err error) {
	// Don't create for Demo account
	if workspaceID == 0 {
		return
	}

	if emailproviders.Exists(adminEmail) {
		adminEmail = ""
	}
	components := strings.Split(adminEmail, "@")
	var domain string
	if len(components) > 1 {
		domain = components[1]
	}
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

	if companyID, err = pollHubspot(func() (*int, error) {
		id, err := h.getCompany(ctx, name)
		if err != nil {
			return nil, err
		}

		log.WithContext(ctx).
			WithField("name", name).
			Warnf("company already exists in Hubspot. updating")

		if id != nil {
			_, err := h.hubspotClient.Companies().Update(*id, companyProperties)
			if err != nil {
				return nil, err
			}
		}

		return id, nil
	}); companyID != nil {
		return
	}

	log.WithContext(ctx).
		WithField("name", name).
		Warnf("failed to get client-side hubspot company. creating")

	resp, err := h.hubspotClient.Companies().Create(companyProperties)
	if err != nil {
		return nil, err
	}
	log.WithContext(ctx).Infof("succesfully created a hubspot company with id: %v", resp.CompanyID)
	if err := h.db.Model(&model.Workspace{Model: model.Model{ID: workspaceID}}).
		Updates(&model.Workspace{HubspotCompanyID: &resp.CompanyID}).Error; err != nil {
		return &resp.CompanyID, err
	}
	return &resp.CompanyID, nil
}

func (h *HubspotApi) UpdateContactProperty(ctx context.Context, adminID int, properties []hubspot.Property) error {
	return h.kafkaProducer.Submit(ctx, &kafka_queue.Message{
		Type: kafka_queue.HubSpotUpdateContactProperty,
		HubSpotUpdateContactProperty: &kafka_queue.HubSpotUpdateContactPropertyArgs{
			AdminID:    adminID,
			Properties: properties,
		},
	}, "")
}

func (h *HubspotApi) UpdateContactPropertyImpl(ctx context.Context, adminID int, properties []hubspot.Property) error {
	admin := &model.Admin{}
	if err := h.db.Model(&model.Admin{}).Where("id = ?", adminID).First(&admin).Error; err != nil {
		return err
	}
	hubspotContactID := admin.HubspotContactID
	if hubspotContactID == nil {
		id, err := h.CreateContactForAdminImpl(
			ctx,
			adminID,
			ptr.ToString(admin.Email),
			ptr.ToString(admin.UserDefinedRole),
			ptr.ToString(admin.UserDefinedPersona),
			ptr.ToString(admin.FirstName),
			ptr.ToString(admin.LastName),
			ptr.ToString(admin.Phone),
			ptr.ToString(admin.Referral),
		)
		if err != nil {
			return err
		}
		hubspotContactID = id
	}
	if err := h.hubspotClient.Contacts().Update(ptr.ToInt(hubspotContactID), hubspot.ContactsRequest{
		Properties: properties,
	}); err != nil {
		return err
	}
	return nil
}

func (h *HubspotApi) UpdateCompanyProperty(ctx context.Context, workspaceID int, properties []hubspot.Property) error {
	return h.kafkaProducer.Submit(ctx, &kafka_queue.Message{
		Type: kafka_queue.HubSpotUpdateCompanyProperty,
		HubSpotUpdateCompanyProperty: &kafka_queue.HubSpotUpdateCompanyPropertyArgs{
			WorkspaceID: workspaceID,
			Properties:  properties,
		},
	}, "")
}

func (h *HubspotApi) UpdateCompanyPropertyImpl(ctx context.Context, workspaceID int, properties []hubspot.Property) error {
	workspace := &model.Workspace{}
	if err := h.db.Model(&model.Workspace{}).Where("id = ?", workspaceID).First(&workspace).Error; err != nil {
		return err
	}
	hubspotWorkspaceID := workspace.HubspotCompanyID
	if hubspotWorkspaceID == nil && workspace.ID != 0 {
		id, err := h.CreateCompanyForWorkspaceImpl(
			ctx,
			workspaceID,
			"", ptr.ToString(workspace.Name),
		)
		if err != nil {
			return err
		}
		hubspotWorkspaceID = id
	}
	if _, err := h.hubspotClient.Companies().Update(ptr.ToInt(hubspotWorkspaceID), hubspot.CompaniesRequest{
		Properties: properties,
	}); err != nil {
		return err
	}
	return nil
}
