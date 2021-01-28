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

func (r *mutationResolver) InitializeSession(ctx context.Context, organizationVerboseID string) (*model.Session, error) {
	organizationID := model.FromVerboseID(organizationVerboseID)
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

	sessionProperties := map[string]string{
		"os_name":         deviceDetails.OSName,
		"os_version":      deviceDetails.OSVersion,
		"browser_name":    deviceDetails.BrowserName,
		"browser_version": deviceDetails.BrowserVersion,
	}
	if err := r.AppendProperties(session.ID, sessionProperties, PropertyType.SESSION); err != nil {
		return nil, e.Wrap(err, "error adding set of properites to db")
	}
	return session, nil
}

func (r *mutationResolver) IdentifySession(ctx context.Context, sessionID int, userIdentifier string, userObject interface{}) (*int, error) {
	obj, ok := userObject.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("error converting userObject interface type")
	}

	userProperties := map[string]string{
		"identifier": userIdentifier,
	}
	for k, v := range obj {
		userProperties[k] = fmt.Sprintf("%v", v)
	}
	if err := r.AppendProperties(sessionID, userProperties, PropertyType.USER); err != nil {
		return nil, e.Wrap(err, "error adding set of properites to db")
	}
	res := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).Updates(&model.Session{Identifier: userIdentifier})
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "error adding user identifier to session")
	}
	return &sessionID, nil
}

func (r *mutationResolver) AddTrackProperties(ctx context.Context, sessionID int, propertiesObject interface{}) (*int, error) {
	obj, ok := propertiesObject.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("error converting userObject interface type")
	}
	fields := map[string]string{}
	for k, v := range obj {
		fields[k] = fmt.Sprintf("%v", v)
	}
	err := r.AppendProperties(sessionID, fields, PropertyType.TRACK)
	if err != nil {
		return nil, e.Wrap(err, "error adding set of properites to db")
	}
	return &sessionID, nil
}

func (r *mutationResolver) AddSessionProperties(ctx context.Context, sessionID int, propertiesObject interface{}) (*int, error) {
	obj, ok := propertiesObject.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("error converting userObject interface type")
	}
	fields := map[string]string{}
	for k, v := range obj {
		fields[k] = fmt.Sprintf("%v", v)
	}
	err := r.AppendProperties(sessionID, fields, PropertyType.SESSION)
	if err != nil {
		return nil, e.Wrap(err, "error adding set of properites to db")
	}
	return &sessionID, nil
}

<<<<<<< HEAD
func (r *mutationResolver) PushPayload(ctx context.Context, organizationID int, sessionID int, events string, messages string, resources string, errors string) (*int, error) {
=======
func (r *mutationResolver) PushPayload(ctx context.Context, sessionID int, events string, messages string, resources string) (*int, error) {
>>>>>>> master
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
	// unmarshal error
	errorsParsed := make(map[string][]interface{})
	if err := json.Unmarshal([]byte(errors), &errorsParsed); err != nil {
		return nil, fmt.Errorf("error decoding resource data: %v", err)
	}
	if len(errorsParsed["errors"]) > 0 {
		for _, v := range errorsParsed["errors"] {
			var source string = ""
			var line_no float64 = -1
			var column_no float64 = -1
			var trace string = ""
			if v.(map[string]interface{})["source"] != nil {
				source = v.(map[string]interface{})["source"].(string)
			}
			if v.(map[string]interface{})["lineno"] != nil {
				line_no = v.(map[string]interface{})["lineno"].(float64)
			}
			if v.(map[string]interface{})["colno"] != nil {
				column_no = v.(map[string]interface{})["colno"].(float64)
			}
			if v.(map[string]interface{})["trace"] != nil {
				traceBytes, err := json.Marshal(v.(map[string]interface{})["trace"])
				if err != nil {
					return nil, fmt.Errorf("error decoding trace data: %v", err)
				}
				trace = string(traceBytes)
			}
			obj := &model.ErrorObject{
				OrganizationID: organizationID,
				SessionID:      sessionID,
				Event:          v.(map[string]interface{})["event"].(string),
				Type:           v.(map[string]interface{})["type"].(string),
				Source:         source,
				LineNo:         line_no,
				ColumnNo:       column_no,
				Trace:          trace,
			}
			if err := r.DB.Create(obj).Error; err != nil {
				return nil, e.Wrap(err, "error creating resources object")
			}
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
