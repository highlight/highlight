package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/jay-khatri/fullstory/backend/main-graph/graph/generated"
	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/k0kubun/pp"
	"github.com/slack-go/slack"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
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

func (r *queryResolver) Sessions(ctx context.Context, organizationID int, params []interface{}) ([]*model.Session, error) {
	if _, err := r.isAdminInOrganization(ctx, organizationID); err != nil {
		return nil, e.Wrap(err, "admin not found in org")
	}
	sessions := []*model.Session{}
	query := r.DB.Where(&model.Session{OrganizationID: organizationID, Processed: true}).Where("length > ?", 1000).Order("created_at desc")
	ps, err := model.DecodeAndValidateParams(params)
	if err != nil {
		return nil, e.Wrap(err, "error decoding params")
	}
	for _, p := range ps {
		switch key := p.Key; key {
		case "more than":
			d, err := toDuration(p.Value.Value)
			if err != nil {
				return nil, e.Wrap(err, "error convering duration to int")
			}
			query = query.Where("length > ?", d.Milliseconds())
		case "less than":
			d, err := toDuration(p.Value.Value)
			if err != nil {
				return nil, e.Wrap(err, "error convering duration to int")
			}
			query = query.Where("length < ?", d.Milliseconds())
		case "last":
			d, err := toDuration(p.Value.Value)
			if err != nil {
				return nil, e.Wrap(err, "error convering duration to int")
			}
			query = query.Where("created_at > ?", time.Now().Add(-d))
		case "identifier":
			query = query.Where("identifier = ?", p.Value.Value)
		}
	}
	res := query.Find(&sessions)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "no sessions found")
	}
	return sessions, nil
}

func (r *queryResolver) FieldSuggestion(ctx context.Context, organizationID int, field string, query string) ([]*string, error) {
	pp.Println(field)
	pp.Println(organizationID)
	pp.Println(query)
	fields := []model.Field{}
	res := r.DB.Where(&model.Field{OrganizationID: organizationID, Name: field}).
		Find(&fields)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "error querying field suggestion")
	}
	pp.Println(fields)
	fieldStrings := []*string{}
	for _, f := range fields {
		fieldStrings = append(fieldStrings, &f.Value)
	}
	return fieldStrings, nil
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

		msg := slack.WebhookMessage{Text: fmt.Sprintf("```NEW USER \nid: %v\nname: %v\nemail: %v```", newAdmin.ID, *newAdmin.Name, *newAdmin.Email)}
		err = slack.PostWebhook("https://hooks.slack.com/services/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", &msg)
		if err != nil {
			log.Errorf("error sending slack hook: %v", err)
		}
	}
	return admin, nil
}

func (r *sessionResolver) UserObject(ctx context.Context, obj *model.Session) (interface{}, error) {
	return obj.UserObject, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// Session returns generated.SessionResolver implementation.
func (r *Resolver) Session() generated.SessionResolver { return &sessionResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type sessionResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//  - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//    it when you're done.
//  - You have helper methods in this file. Move them out to keep these resolver files clean.
func toDuration(duration string) (time.Duration, error) {
	d, err := strconv.ParseInt(duration, 10, 64)
	if err != nil || d <= 0 {
		return time.Duration(0), e.Wrap(err, "error parsing duration integer")
	}
	return time.Duration(int64(time.Millisecond) * d), nil
}
