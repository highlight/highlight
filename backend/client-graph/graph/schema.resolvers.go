package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jay-khatri/fullstory/backend/client-graph/graph/generated"
	customModels "github.com/jay-khatri/fullstory/backend/client-graph/graph/model"
	"github.com/jay-khatri/fullstory/backend/event-parse"
	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jinzhu/gorm"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

func (r *mutationResolver) InitializeSession(ctx context.Context, organizationVerboseID string, enableStrictPrivacy bool) (*model.Session, error) {
	organizationID := model.FromVerboseID(organizationVerboseID)
	organization := &model.Organization{}
	res := r.DB.Where(&model.Organization{Model: model.Model{ID: organizationID}}).First(&organization)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "org doesn't exist")
	}
	if organizationID == 110 || organizationID == 128 {
		if check, err := r.CanRecordSession(organizationID); !check || err != nil {
			if !check && err == nil {
				return nil, nil
			} else {
				return nil, e.Wrap(err, "org session quota reached")
			}
		}
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

	// Parse the user-agent string
	var deviceDetails DeviceDetails
	if userAgentString, ok := ctx.Value("userAgent").(string); ok {
		deviceDetails = GetDeviceDetails(userAgentString)
	}

	// Get the language from the request header
	acceptLanguageString := ctx.Value("acceptLanguage").(string)
	n := time.Now()
	session := &model.Session{
		UserID:              user.ID,
		OrganizationID:      organizationID,
		City:                location.City,
		State:               location.State,
		Postal:              location.Postal,
		Latitude:            location.Latitude.(float64),
		Longitude:           location.Longitude.(float64),
		OSName:              deviceDetails.OSName,
		OSVersion:           deviceDetails.OSVersion,
		BrowserName:         deviceDetails.BrowserName,
		BrowserVersion:      deviceDetails.BrowserVersion,
		Language:            acceptLanguageString,
		Processed:           &model.F,
		PayloadUpdatedAt:    &n,
		EnableStrictPrivacy: &enableStrictPrivacy,
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

	session := &model.Session{}
	if err := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session).Error; err != nil {
		return nil, e.Wrap(err, "error querying session by sessionID")
	}

	// Check if there is a session created by this user.
	firstTime := &model.F
	if err := r.DB.Where(&model.Session{Identifier: userIdentifier, OrganizationID: session.OrganizationID}).Take(&model.Session{}).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			firstTime = &model.T
		} else {
			return nil, e.Wrap(err, "error querying session with past identifier")
		}
	}

	session.FirstTime = firstTime
	session.Identifier = userIdentifier

	if err := r.DB.Save(&session).Error; err != nil {
		return nil, e.Wrap(err, "failed to update session")
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

func (r *mutationResolver) PushPayload(ctx context.Context, sessionID int, events customModels.ReplayEventsInput, messages string, resources string, errors []*customModels.ErrorObjectInput) (*int, error) {
	sessionObj := &model.Session{}
	res := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&sessionObj)
	if res.Error != nil {
		return nil, fmt.Errorf("error reading from session: %v", res.Error)
	}
	organizationID := sessionObj.OrganizationID
	if evs := events.Events; len(evs) > 0 {
		// TODO: this isn't very performant, as marshaling the whole event obj to a string is expensive;
		// should fix at some point.
		eventBytes, err := json.Marshal(events)
		if err != nil {
			return nil, e.Wrap(err, "error marshaling events from schema interfaces")
		}
		parsedEvents, err := parse.EventsFromString(string(eventBytes))
		if err != nil {
			return nil, e.Wrap(err, "error parsing events from schema interfaces")
		}

		// If we see a snapshot event, attempt to inject CORS stylesheets.
		for _, e := range parsedEvents.Events {
			if e.Type == parse.FullSnapshot {
				d, err := parse.InjectStylesheets(e.Data)
				if err != nil {
					continue
				}
				e.Data = d
			}
		}

		// Re-format as a string to write to the db.
		b, err := json.Marshal(parsedEvents)
		if err != nil {
			return nil, e.Wrap(err, "error marshaling events from schema interfaces")
		}
		obj := &model.EventsObject{SessionID: sessionID, Events: string(b)}
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
	// put errors in db
	for _, v := range errors {
		traceBytes, err := json.Marshal(v.Trace)
		if err != nil {
			log.Errorf("Error marshaling trace: %v", v.Trace)
			continue
		}
		traceString := string(traceBytes)

		errorToInsert := &model.ErrorObject{
			OrganizationID: organizationID,
			SessionID:      sessionID,
			Event:          v.Event,
			Type:           v.Type,
			URL:            v.URL,
			Source:         v.Source,
			LineNumber:     v.LineNumber,
			ColumnNumber:   v.ColumnNumber,
			OS:             sessionObj.OSName,
			Browser:        sessionObj.BrowserName,
			Trace:          &traceString,
			Timestamp:      v.Timestamp,
		}

		//create error fields array
		metaFields := []*model.ErrorField{}
		metaFields = append(metaFields, &model.ErrorField{OrganizationID: organizationID, Name: "browser", Value: sessionObj.BrowserName})
		metaFields = append(metaFields, &model.ErrorField{OrganizationID: organizationID, Name: "os_name", Value: sessionObj.OSName})
		metaFields = append(metaFields, &model.ErrorField{OrganizationID: organizationID, Name: "visited_url", Value: errorToInsert.URL})
		metaFields = append(metaFields, &model.ErrorField{OrganizationID: organizationID, Name: "event", Value: errorToInsert.Event})
		group, err := r.HandleErrorAndGroup(errorToInsert, v.Trace, metaFields)
		if err != nil {
			log.Errorf("Error updating error group: %v", errorToInsert)
			continue
		}
		// Send a slack message if we're not on localhost.
		if !strings.Contains(errorToInsert.URL, "localhost") {
			if err := r.SendSlackErrorMessage(group, organizationID, sessionID, sessionObj.Identifier, errorToInsert.URL); err != nil {
				log.Errorf("Error sending slack error message: %v", err)
				continue
			}
		}
		// TODO: We need to do a batch insert which is supported by the new gorm lib.
	}
	now := time.Now()
	res = r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).Updates(&model.Session{PayloadUpdatedAt: &now})
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "error updating session payload time")
	}
	return &sessionID, nil
}

func (r *queryResolver) Ignore(ctx context.Context, id int) (interface{}, error) {
	return nil, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
