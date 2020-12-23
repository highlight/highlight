package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jay-khatri/fullstory/backend/client-graph/graph/generated"
	"github.com/jay-khatri/fullstory/backend/model"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

func (r *mutationResolver) InitializeSession(ctx context.Context, organizationID int) (*model.Session, error) {
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

	// Get the user's ip, get geolocation data
	location := &Location{}
	var err error
	ip, ok := ctx.Value("ip").(string)
	if ok {
		location, err = GetLocationFromIP(ip)
		if err != nil {
			log.Errorf("error getting user's location: %v", err)
		}
	}

	log.Infof("user: %v in org: %v has ip address: %v \n", user.ID, user.OrganizationID, ip)

	// Parse the user-agent string
	var deviceDetails DeviceDetails
	if userAgentString, ok := ctx.Value("userAgent").(string); ok {
		deviceDetails = GetDeviceDetails(userAgentString)
	}

	session := &model.Session{
		UserID:         user.ID,
		OrganizationID: organizationID,
		City:           location.City,
		State:          location.State,
		Postal:         location.Postal,
		Latitude:       location.Latitude.(float64),
		Longitude:      location.Longitude.(float64),
		OSName:         deviceDetails.OSName,
		OSVersion:      deviceDetails.OSVersion,
		BrowserName:    deviceDetails.BrowserName,
		BrowserVersion: deviceDetails.BrowserVersion,
	}
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

	// Parse the user-agent string
	var deviceDetails DeviceDetails
	var err error
	if userAgentString, ok := ctx.Value("userAgent").(string); ok {
		deviceDetails = GetDeviceDetails(userAgentString)
	}

	fields := map[string]string{
		"identifier":      userIdentifier,
		"os_name":         deviceDetails.OSName,
		"os_version":      deviceDetails.OSVersion,
		"browser_name":    deviceDetails.BrowserName,
		"browser_version": deviceDetails.BrowserVersion,
	}
	for k, v := range obj {
		fields[k] = fmt.Sprintf("%v", v)
	}
	err = r.AppendProperties(sessionID, fields)
	if err != nil {
		return nil, e.Wrap(err, "error adding set of properites to db")
	}
	res := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).Updates(&model.Session{Identifier: userIdentifier})
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "error adding user identifier to session")
	}
	return &sessionID, nil
}

func (r *mutationResolver) AddProperties(ctx context.Context, sessionID int, propertiesObject interface{}) (*int, error) {
	obj, ok := propertiesObject.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("error converting userObject interface type")
	}
	fields := map[string]string{}
	for k, v := range obj {
		fields[k] = fmt.Sprintf("%v", v)
	}
	err := r.AppendProperties(sessionID, fields)
	if err != nil {
		return nil, e.Wrap(err, "error adding set of properites to db")
	}
	return &sessionID, nil
}

func (r *mutationResolver) PushPayload(ctx context.Context, sessionID int, events string, messages string, resources string) (*int, error) {
	eventsParsed := make(map[string][]interface{})
	// unmarshal events
	if err := json.Unmarshal([]byte(events), &eventsParsed); err != nil {
		return nil, fmt.Errorf("error decoding event data: %v", err)
	}
	if len(eventsParsed["events"]) > 0 {
		obj := &model.EventsObject{SessionID: sessionID, Events: events}
		if err := r.DB.Create(obj).Error; err != nil {
			return nil, e.Wrap(err, "error creating events object")
		}
	}
	// unmarshal messages
	messagesParsed := make(map[string][]interface{})
	if err := json.Unmarshal([]byte(messages), &messagesParsed); err != nil {
		return nil, fmt.Errorf("error decoding message data: %v", err)
	}
	if len(messagesParsed["messages"]) > 0 {
		obj := &model.MessagesObject{SessionID: sessionID, Messages: messages}
		if err := r.DB.Create(obj).Error; err != nil {
			return nil, e.Wrap(err, "error creating messages object")
		}
	}
	// unmarshal resources
	resourcesParsed := make(map[string][]interface{})
	if err := json.Unmarshal([]byte(resources), &resourcesParsed); err != nil {
		return nil, fmt.Errorf("error decoding resource data: %v", err)
	}
	if len(resourcesParsed["resources"]) > 0 {
		obj := &model.ResourcesObject{SessionID: sessionID, Resources: resources}
		if err := r.DB.Create(obj).Error; err != nil {
			return nil, e.Wrap(err, "error creating resources object")
		}
	}
	now := time.Now()
	res := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).Updates(&model.Session{PayloadUpdatedAt: &now})
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "error updating session payload time")
	}
	return &sessionID, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

type mutationResolver struct{ *Resolver }
