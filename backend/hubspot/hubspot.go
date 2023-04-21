package hubspot

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"
	"io"
	"math"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/aws/smithy-go/ptr"
	"github.com/goware/emailproviders"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/leonelquinteros/hubspot"
	e "github.com/pkg/errors"

	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const RETRIES = 5

func retry[T *int](fn func() (T, error)) (ret T, err error) {
	for i := 0; i < RETRIES; i++ {
		ret, err = fn()
		if err == nil {
			return
		}
		time.Sleep(16 * time.Millisecond * time.Duration(math.Pow(2, float64(i))))
	}
	return
}

type HubspotApi struct {
	hubspotClient hubspot.Client
	redisClient   *redis.Client
}

func NewHubspotAPI(client hubspot.Client, redisClient *redis.Client) *HubspotApi {
	h := &HubspotApi{}
	h.hubspotClient = client
	h.redisClient = redisClient
	return h
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

func (h *HubspotApi) BackendCreationDisabled() bool {
	// backend hubspot company and contact creation is disabled to see how the
	// frontend javascript tracking snippet performs.
	return true
}

func (h *HubspotApi) getContactForAdmin(email string) (contactId *int, err error) {
	r := CustomContactsResponse{}
	if getErr := h.hubspotClient.Contacts().Client.Request("GET", "/contacts/v1/contact/email/"+email+"/profile", nil, &r); getErr != nil {
		errr := e.Wrap(err, e.Wrap(getErr, "error getting hubspot contact data by email").Error())
		return nil, errr
	} else {
		return pointy.Int(r.Vid), nil
	}
}

func (h *HubspotApi) createContactForAdmin(ctx context.Context, adminID int, email string, userDefinedRole string, userDefinedPersona string, first string, last string, phone string, referral string) (contactId *int, err error) {
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

func (h *HubspotApi) CreateContactForAdmin(ctx context.Context, adminID int, email string, userDefinedRole string, userDefinedPersona string, first string, last string, phone string, referral string) (contactId *int, err error) {
	if h.BackendCreationDisabled() {
		return h.getContactForAdmin(email)
	}

	return retry(func() (*int, error) {
		return h.createContactForAdmin(ctx, adminID, email, userDefinedRole, userDefinedPersona, first, last, phone, referral)
	})
}

func (h *HubspotApi) CreateContactCompanyAssociation(ctx context.Context, adminID int, workspaceID int, db *gorm.DB) error {
	if h.BackendCreationDisabled() {
		return nil
	}
	admin := &model.Admin{}
	if err := db.Model(&model.Admin{}).Where("id = ?", adminID).First(&admin).Error; err != nil {
		return e.Wrap(err, "error retrieving admin details")
	}
	workspace := &model.Workspace{}
	if err := db.Model(&model.Workspace{}).Where("id = ?", workspaceID).First(&workspace).Error; err != nil {
		return e.Wrap(err, "error retrieving workspace details")
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
		return e.Wrap(err, "error creating company to contact association")
	} else {
		log.WithContext(ctx).Info("success creating company to contact association")
	}
	if err := h.hubspotClient.CRMAssociations().Create(hubspot.CRMAssociationsRequest{
		DefinitionID: hubspot.CRMAssociationContactToCompany,
		FromObjectID: *admin.HubspotContactID,
		ToObjectID:   *workspace.HubspotCompanyID,
	}); err != nil {
		return e.Wrap(err, "error creating contact to copmany association")
	} else {
		log.WithContext(ctx).Info("success creating contact to company association")
	}
	return nil
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
				return data.Value == name
			}
		}
		return false
	}); !ok {
		return nil, e.New(fmt.Sprintf("failed to find company with name %s", name))
	} else {
		return pointy.Int(company.CompanyID), nil
	}
}

func (h *HubspotApi) CreateCompanyForWorkspace(ctx context.Context, workspaceID int, adminEmail string, name string, db *gorm.DB) (companyID *int, err error) {
	// Don't create for Demo account
	if workspaceID == 0 {
		return
	}

	if h.BackendCreationDisabled() {
		return h.getCompany(ctx, name)
	}

	if emailproviders.Exists(adminEmail) {
		adminEmail = ""
	}
	components := strings.Split(adminEmail, "@")
	var domain string
	if len(components) > 1 {
		domain = components[1]
	}
	resp, err := h.hubspotClient.Companies().Create(hubspot.CompaniesRequest{
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
		},
	})
	if err != nil {
		return nil, e.Wrap(err, "error creating company in hubspot")
	}
	log.WithContext(ctx).Infof("succesfully created a hubspot company with id: %v", resp.CompanyID)
	if err := db.Model(&model.Workspace{Model: model.Model{ID: workspaceID}}).
		Updates(&model.Workspace{HubspotCompanyID: &resp.CompanyID}).Error; err != nil {
		return &resp.CompanyID, e.Wrap(err, "error updating workspace HubspotCompanyID")
	}
	return &resp.CompanyID, nil
}

func (h *HubspotApi) UpdateContactProperty(ctx context.Context, adminID int, properties []hubspot.Property, db *gorm.DB) error {
	admin := &model.Admin{}
	if err := db.Model(&model.Admin{}).Where("id = ?", adminID).First(&admin).Error; err != nil {
		return e.Wrap(err, "error retrieving admin details")
	}
	hubspotContactID := admin.HubspotContactID
	if hubspotContactID == nil {
		id, err := h.CreateContactForAdmin(
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
			return e.Wrap(err, "error creating contact when trying to update contact property")
		}
		hubspotContactID = id
	}
	if err := h.hubspotClient.Contacts().Update(ptr.ToInt(hubspotContactID), hubspot.ContactsRequest{
		Properties: properties,
	}); err != nil {
		return e.Wrap(err, "error updating contact property")
	}
	return nil
}

func (h *HubspotApi) UpdateCompanyProperty(ctx context.Context, workspaceID int, properties []hubspot.Property, db *gorm.DB) error {
	workspace := &model.Workspace{}
	if err := db.Model(&model.Workspace{}).Where("id = ?", workspaceID).First(&workspace).Error; err != nil {
		return e.Wrap(err, "error retrieving workspace details")
	}
	hubspotWorkspaceID := workspace.HubspotCompanyID
	if hubspotWorkspaceID == nil && workspace.ID != 0 {
		id, err := h.CreateCompanyForWorkspace(
			ctx,
			workspaceID,
			"", ptr.ToString(workspace.Name),
			db,
		)
		if err != nil {
			return e.Wrap(err, "error creating work when trying to update contact property")
		}
		hubspotWorkspaceID = id
	}
	if _, err := h.hubspotClient.Companies().Update(ptr.ToInt(hubspotWorkspaceID), hubspot.CompaniesRequest{
		Properties: properties,
	}); err != nil {
		return e.Wrap(err, "error updating company property")
	}
	return nil
}
