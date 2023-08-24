package main

import (
	"context"
	hubspotApi "github.com/highlight-run/highlight/backend/hubspot"
	"github.com/highlight-run/highlight/backend/model"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
	"github.com/leonelquinteros/hubspot"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"os"
	"sync"
)

const BatchSize = 64

func main() {
	ctx := context.Background()
	log.WithContext(ctx).Info("setting up db")
	db, err := model.SetupDB(ctx, os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	r := public.Resolver{
		DB:         db,
		HubspotApi: hubspotApi.NewHubspotAPI(hubspot.NewClient(hubspot.NewClientConfig()), db, nil, nil),
	}

	var admins []model.Admin

	wg := sync.WaitGroup{}
	inner := func(tx *gorm.DB, batch int) error {
		wg.Add(1)
		func() {
			for _, admin := range admins {
				if admin.Email == nil || admin.UserDefinedRole == nil || admin.UserDefinedPersona == nil || admin.UserDefinedTeamSize == nil || admin.FirstName == nil || admin.LastName == nil || admin.Phone == nil || admin.Referral == nil {
					log.WithContext(ctx).WithField("AdminID", admin.ID).Error("admin is not filled out")
					continue
				}
				hubspotContactId, err := r.HubspotApi.CreateContactForAdminImpl(
					ctx,
					admin.ID,
					*admin.Email,
					*admin.UserDefinedRole,
					*admin.UserDefinedPersona,
					*admin.UserDefinedTeamSize,
					*admin.FirstName,
					*admin.LastName,
					*admin.Phone,
					*admin.Referral,
				)
				if err != nil {
					log.WithContext(ctx).WithError(err).WithField("AdminID", admin.ID).Error("error creating hubspot contact")
				}
				if hubspotContactId != nil {
					admin.HubspotContactID = hubspotContactId
				}
				for _, workspace := range admin.Workspaces {
					if workspace.Name == nil {
						log.WithContext(ctx).WithField("WorkspaceID", workspace.ID).Error("workspace is not filled out")
						continue
					}
					hubspotCompanyId, err := r.HubspotApi.CreateCompanyForWorkspaceImpl(ctx, workspace.ID, *admin.Email, *workspace.Name)
					if hubspotCompanyId != nil {
						workspace.HubspotCompanyID = hubspotCompanyId
					} else {
						log.WithContext(ctx).WithError(err).WithField("WorkspaceID", workspace.ID).Error("error creating hubspot company")
					}

					if err := r.HubspotApi.CreateContactCompanyAssociation(ctx, admin.ID, workspace.ID); err != nil {
						log.WithContext(ctx).WithError(err).WithField("AdminID", admin.ID).WithField("WorkspaceID", workspace.ID).Error("error creating hubspot association")
					}

					if err := r.DB.Model(&admin).Update("HubspotContactID", admin.HubspotContactID).Error; err != nil {
						log.WithContext(ctx).WithError(err).WithField("AdminID", admin.ID).Error("error updating admin")
					}

					if err := r.DB.Model(&workspace).Update("HubspotCompanyID", workspace.HubspotCompanyID).Error; err != nil {
						log.WithContext(ctx).WithError(err).WithField("WorkspaceID", workspace.ID).Error("error updating contact")
					}
				}

				log.WithContext(ctx).Infof("updated admin %d", admin.ID)
			}
			wg.Done()
		}()
		return nil
	}

	if err := db.Debug().Preload("Workspaces").Model(&model.Admin{}).Where("hubspot_contact_id is null").FindInBatches(&admins, BatchSize, inner).Error; err != nil {
		log.WithContext(ctx).Fatalf("error getting admins: %v", err)
	}

	wg.Wait()
}
