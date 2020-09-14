package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jay-khatri/fullstory/backend/main-graph/graph/generated"
	"github.com/jay-khatri/fullstory/backend/model"

	e "github.com/pkg/errors"
)

func (r *mutationResolver) CreateOrganization(ctx context.Context, name string) (*model.Organization, error) {
	org := &model.Organization{
		Name: &name,
	}
	if err := r.DB.Create(org).Error; err != nil {
		return nil, e.Wrap(err, "error creating org")
	}
	return org, nil
}

func (r *queryResolver) Session(ctx context.Context, id int) (*model.Session, error) {
	session, err := r.isAdminSessionOwner(ctx, id)
	if err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	return session, nil
}

func (r *queryResolver) Events(ctx context.Context, sessionID int) ([]interface{}, error) {
	if _, err := r.isAdminSessionOwner(ctx, sessionID); err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	eventObjs := []*model.EventsObject{}
	if res := r.DB.Order("created_at desc").Where(&model.EventsObject{SessionID: sessionID}).Find(&eventObjs); res.Error != nil {
		return nil, fmt.Errorf("error reading from events: %v", res.Error)
	}
	allEvents := make(map[string][]interface{})
	for _, eventObj := range eventObjs {
		subEvents := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(eventObj.Events), &subEvents); err != nil {
			return nil, fmt.Errorf("error decoding event data: %v", err)
		}
		allEvents["events"] = append(subEvents["events"], allEvents["events"]...)
	}
	return allEvents["events"], nil
}

func (r *queryResolver) Sessions(ctx context.Context, organizationID int) ([]*model.Session, error) {
	if _, err := r.isAdminInOrganization(ctx, organizationID); err != nil {
		return nil, e.Wrap(err, "admin not found in org")
	}
	sessions := []*model.Session{}
	res := r.DB.Where(&model.Session{OrganizationID: organizationID}).Order("created_at desc").Find(&sessions)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "no sessions found")
	}
	return sessions, nil
}

func (r *queryResolver) Organizations(ctx context.Context) ([]*model.Organization, error) {
	admin, err := r.Query().Admin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error retrieiving user")
	}
	orgs := []*model.Organization{}
	if err := r.DB.Model(&admin).Association("Organizations").Find(&orgs).Error; err != nil {
		return nil, e.Wrap(err, "error getting associated organizations")
	}
	return orgs, nil
}

func (r *queryResolver) Admin(ctx context.Context) (*model.Admin, error) {
	uid := fmt.Sprintf("%v", ctx.Value("uid"))
	admin := &model.Admin{UID: &uid}
	res := r.DB.Where(&model.Admin{UID: &uid}).First(&admin)
	if err := res.Error; err != nil || res.RecordNotFound() {
		// If the user doesn't exist yet, we create
		// one along with their own org.
		fbuser, err := AuthClient.GetUser(context.Background(), uid)
		if err != nil {
			return nil, e.Wrap(err, "error retrieiving user from firebase api")
		}
		newOrg, err := r.Mutation().CreateOrganization(ctx, fbuser.DisplayName)
		if err != nil {
			return nil, e.Wrap(err, "error creating new organization")
		}
		newAdmin := &model.Admin{
			UID:           &uid,
			Name:          &fbuser.DisplayName,
			Email:         &fbuser.Email,
			Organizations: []model.Organization{*newOrg},
		}
		if err := r.DB.Create(newAdmin).Error; err != nil {
			return nil, e.Wrap(err, "error creating new admin")
		}
		admin = newAdmin
	}
	return admin, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
