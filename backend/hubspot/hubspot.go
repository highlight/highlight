package hubspot

import (
	"strings"

	"github.com/aws/smithy-go/ptr"
	"github.com/goware/emailproviders"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/leonelquinteros/hubspot"
	e "github.com/pkg/errors"

	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type HubspotApi struct {
	hubspotClient hubspot.Client
	db            *gorm.DB
}

func NewHubspotAPI(client hubspot.Client, db *gorm.DB) *HubspotApi {
	h := &HubspotApi{}
	h.hubspotClient = client
	h.db = db
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

func (h *HubspotApi) CreateContactForAdmin(adminID int, email string, userDefinedRole string, userDefinedPersona string, first string, last string, phone string, referral string) (contactId *int, err error) {
	var hubspotContactId int
	if emailproviders.Exists(email) {
		email = ""
	}
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
				Property: "referral",
				Name:     "referral",
				Value:    phone,
			},
		},
	}); err != nil {
		// If there's an error creating the contact, assume its a conflict and try to get the existing user.
		r := CustomContactsResponse{}
		if getErr := h.hubspotClient.Contacts().Client.Request("GET", "/contacts/v1/contact/email/"+email+"/profile", nil, &r); getErr != nil {
			errr := e.Wrap(err, e.Wrap(getErr, "error getting hubspot contact data by email").Error())
			return nil, errr
		} else {
			hubspotContactId = r.Vid
		}
	} else {
		hubspotContactId = resp.Vid
	}
	log.Infof("succesfully created a hubspot contact with id: %v", hubspotContactId)
	if err := h.db.Model(&model.Admin{Model: model.Model{ID: adminID}}).
		Updates(&model.Admin{HubspotContactID: &hubspotContactId}).Error; err != nil {
		return nil, e.Wrap(err, "error updating workspace HubspotContactID")
	}
	return &hubspotContactId, nil
}

func (h *HubspotApi) CreateContactCompanyAssociation(adminID int, workspaceID int) error {
	admin := &model.Admin{}
	if err := h.db.Model(&model.Admin{}).Where("id = ?", adminID).First(&admin).Error; err != nil {
		return e.Wrap(err, "error retrieving admin details")
	}
	workspace := &model.Workspace{}
	if err := h.db.Model(&model.Workspace{}).Where("id = ?", workspaceID).First(&workspace).Error; err != nil {
		return e.Wrap(err, "error retrieving workspace details")
	}
	if workspace.HubspotCompanyID == nil {
		return e.New("hubspot company id is empy")
	} else if admin.HubspotContactID == nil {
		return e.New("hubspot contact id is empy")
	}
	if err := h.hubspotClient.CRMAssociations().Create(hubspot.CRMAssociationsRequest{
		DefinitionID: hubspot.CRMAssociationCompanyToContact,
		FromObjectID: *workspace.HubspotCompanyID,
		ToObjectID:   *admin.HubspotContactID,
	}); err != nil {
		return e.Wrap(err, "error creating company to contact association")
	} else {
		log.Info("success creating company to contact association")
	}
	if err := h.hubspotClient.CRMAssociations().Create(hubspot.CRMAssociationsRequest{
		DefinitionID: hubspot.CRMAssociationContactToCompany,
		FromObjectID: *admin.HubspotContactID,
		ToObjectID:   *workspace.HubspotCompanyID,
	}); err != nil {
		return e.Wrap(err, "error creating contact to copmany association")
	} else {
		log.Info("success creating contact to company association")
	}
	return nil
}

func (h *HubspotApi) CreateCompanyForWorkspace(workspaceID int, adminEmail string, name string) (companyID *int, err error) {
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
	log.Infof("succesfully created a hubspot company with id: %v", resp.CompanyID)
	if err := h.db.Model(&model.Workspace{Model: model.Model{ID: workspaceID}}).
		Updates(&model.Workspace{HubspotCompanyID: &resp.CompanyID}).Error; err != nil {
		return &resp.CompanyID, e.Wrap(err, "error updating workspace HubspotCompanyID")
	}
	return &resp.CompanyID, nil
}

func (h *HubspotApi) UpdateContactProperty(adminID int, properties []hubspot.Property) error {
	admin := &model.Admin{}
	if err := h.db.Model(&model.Admin{}).Where("id = ?", adminID).First(&admin).Error; err != nil {
		return e.Wrap(err, "error retrieving admin details")
	}
	hubspotContactID := admin.HubspotContactID
	if hubspotContactID == nil {
		id, err := h.CreateContactForAdmin(
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

func (h *HubspotApi) UpdateCompanyProperty(workspaceID int, properties []hubspot.Property) error {
	workspace := &model.Workspace{}
	if err := h.db.Model(&model.Workspace{}).Where("id = ?", workspaceID).First(&workspace).Error; err != nil {
		return e.Wrap(err, "error retrieving workspace details")
	}
	hubspotWorkspaceID := workspace.HubspotCompanyID
	if hubspotWorkspaceID == nil && workspace.ID != 0 {
		id, err := h.CreateCompanyForWorkspace(
			workspaceID,
			"", ptr.ToString(workspace.Name),
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
