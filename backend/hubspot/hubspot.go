package hubspot

import (
	"context"
	"fmt"
	"github.com/openlyinc/pointy"
	"math"
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
}

func NewHubspotAPI(client hubspot.Client) *HubspotApi {
	h := &HubspotApi{}
	h.hubspotClient = client
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

type CompaniesResponse struct {
	PortalID  int `json:"portalId"`
	CompanyID int `json:"companyId"`
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

func (h *HubspotApi) getCompany(name string) (contactId *int, err error) {
	r := CompaniesResponse{}
	if getErr := h.hubspotClient.Contacts().Client.Request("GET", fmt.Sprintf("companies/v2/companies/%s", name), nil, &r); getErr != nil {
		errr := e.Wrap(err, e.Wrap(getErr, "error getting hubspot company data by email").Error())
		return nil, errr
	} else {
		return pointy.Int(r.CompanyID), nil
	}
}

func (h *HubspotApi) CreateCompanyForWorkspace(ctx context.Context, workspaceID int, adminEmail string, name string, db *gorm.DB) (companyID *int, err error) {
	if h.BackendCreationDisabled() {
		return h.getCompany(name)
	}

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
