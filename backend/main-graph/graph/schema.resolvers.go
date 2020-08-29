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
	session := &model.Session{}
	res := r.DB.Where(&model.Session{Model: model.Model{ID: id}}).First(&session)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "session doesn't exist")
	}
	return session, nil
}

func (r *queryResolver) Events(ctx context.Context, sessionID int) ([]interface{}, error) {
	eventObjs := []*model.EventsObject{}
	if res := r.DB.Order("created_at desc").Where(&model.EventsObject{SessionID: sessionID}).Find(&eventObjs); res.Error != nil {
		return nil, fmt.Errorf("error reading from events: %v", res.Error)
	}
	allEvents := make(map[string][]interface{})
	for _, eventObj := range eventObjs {
		subEvents := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(eventObj.Events), subEvents); err != nil {
			return nil, fmt.Errorf("error decoding event data: %v", err)
		}
		allEvents["events"] = append(subEvents["events"], allEvents["events"]...)
	}
	return allEvents["events"], nil
}

func (r *sessionResolver) Details(ctx context.Context, obj *model.Session) (interface{}, error) {
	panic(fmt.Errorf("not implemented"))
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
