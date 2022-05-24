package hubspot

import (
	"strings"

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

func (h *HubspotApi) CreateContactForAdmin(adminID int, email string, userDefinedRole string, userDefinedPersona string, first string, last string, phone string) error {
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
		},
	}); err != nil {
		if getResp, getErr := h.hubspotClient.Contacts().GetByEmail(email); err != nil {
			return e.Wrap(err, e.Wrap(getErr, "error pushing hubspot contact data").Error())
		} else {
			hubspotContactId = getResp.Vid
		}
	} else {
		hubspotContactId = resp.Vid
	}
	log.Infof("succesfully created a hubspot contact with id: %v", resp.Vid)
	if err := h.db.Model(&model.Admin{Model: model.Model{ID: adminID}}).
		Updates(&model.Admin{HubspotContactID: &resp.Vid}).Error; err != nil {
		return e.Wrap(err, "error updating workspace HubspotContactID")
	}
	return nil
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

func (h *HubspotApi) CreateCompanyForWorkspace(workspaceID int, adminEmail string, name string) error {
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
		return e.Wrap(err, "error creating company in hubspot")
	}
	log.Infof("succesfully created a hubspot company with id: %v", resp.CompanyID)
	if err := h.db.Model(&model.Workspace{Model: model.Model{ID: workspaceID}}).
		Updates(&model.Workspace{HubspotCompanyID: &resp.CompanyID}).Error; err != nil {
		return e.Wrap(err, "error updating workspace HubspotCompanyID")
	}
	return nil
}
