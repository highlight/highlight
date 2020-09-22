package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"time"

	redis "github.com/go-redis/redis/v8"
	"github.com/jay-khatri/fullstory/backend/client-graph/graph/generated"
	"github.com/jay-khatri/fullstory/backend/model"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

func (r *mutationResolver) InitializeSession(ctx context.Context, organizationID int, details string) (*model.Session, error) {
	organization := &model.Organization{}
	res := r.DB.Where(&model.Organization{Model: model.Model{ID: organizationID}}).First(&organization)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "org doesn't exist")
	}

	uid, ok := ctx.Value("uid").(int)
	if !ok {
		return nil, e.New("error unwrapping uid in context")
	}

	// Get the current user to check whether the org_id is set.
	user := &model.User{}
	res = r.DB.Where(&model.User{Model: model.Model{ID: uid}}).First(&user)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "user doesn't exist")
	}
	// If not, set it.
	if user.OrganizationID != organizationID {
		res := r.DB.Model(user).Updates(model.User{OrganizationID: organizationID})
		if err := res.Error; err != nil || res.RecordNotFound() {
			return nil, e.Wrap(err, "error updating user")
		}
	}
	session := &model.Session{UserID: user.ID, OrganizationID: organizationID, Details: details}
	if err := r.DB.Create(session).Error; err != nil {
		return nil, e.Wrap(err, "error creating session")
	}
	return session, nil
}

func (r *mutationResolver) IdentifySession(ctx context.Context, sessionID int, userIdentifier string, userObject interface{}) (*int, error) {
	obj, ok := userObject.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("error converting userObject interface type")
	}
	res := r.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: sessionID}},
	).Updates(
		&model.Session{Identifier: userIdentifier, UserObject: obj},
	)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "error updating user identifier")
	}
	return &sessionID, nil
}

func (r *mutationResolver) AddEvents(ctx context.Context, sessionID int, events string) (*int, error) {
	obj := &model.EventsObject{SessionID: sessionID, Events: events}
	if err := r.DB.Create(obj).Error; err != nil {
		return nil, e.Wrap(err, "error creating events object")
	}
	now := float64(time.Now().UTC().Unix())
	member := &redis.Z{Score: now, Member: sessionID}
	if err := r.Redis.ZAdd(ctx, "sessions", member).Err(); err != nil {
		return nil, err
	}
	id := obj.ID
	log.Infof("updating session '%v' with score `%f`", sessionID, now)
	return &id, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

type mutationResolver struct{ *Resolver }
