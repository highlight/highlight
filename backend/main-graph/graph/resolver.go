package graph

import (
	"context"
	"fmt"

	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jinzhu/gorm"

	e "github.com/pkg/errors"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

var whitelistedUID = "GoDjf1dw7GVLJQrCHht03NsCdWb2"

type Resolver struct {
	DB *gorm.DB
}

// These are authentication methods used to make sure that data is secured.
// This'll probably get expensive at some point; they can probably be cached.
func (r *Resolver) isAdminInOrganization(ctx context.Context, org_id int) (*model.Organization, error) {
	uid := fmt.Sprintf("%v", ctx.Value("uid"))
	// If the user is me (jaykhatrimail@gmail.com) or is the getmosaic.io account, whitelist.
	if uid == whitelistedUID || org_id == 15 {
		org := &model.Organization{}
		res := r.DB.Where(&model.Organization{Model: model.Model{ID: org_id}}).First(&org)
		if err := res.Error; err != nil || res.RecordNotFound() {
			return nil, e.Wrap(err, "error querying org")
		}
		return org, nil
	}
	orgs, err := r.Query().Organizations(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error querying orgs")
	}
	for _, o := range orgs {
		if o.ID == org_id {
			return o, nil
		}
	}
	return nil, e.New("admin doesn't exist in organization")
}

func (r *Resolver) isAdminSessionOwner(ctx context.Context, session_id int) (*model.Session, error) {
	session := &model.Session{}
	res := r.DB.Where(&model.Session{Model: model.Model{ID: session_id}}).First(&session)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "error querying session")
	}
	_, err := r.isAdminInOrganization(ctx, session.OrganizationID)
	if err != nil {
		return nil, e.Wrap(err, "error validating admin in organization")
	}
	return session, nil
}
