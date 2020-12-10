package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/jay-khatri/fullstory/backend/client-graph/graph/generated"
	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/mssola/user_agent"
	e "github.com/pkg/errors"
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
	var locationString string
	if ip, ok := ctx.Value("ip").(string); ok {
		ip, _, _ = net.SplitHostPort(ip)
		ipStr := net.ParseIP(ip).String()
		if os.Getenv("DOPPLER_ENCLAVE_ENVIRONMENT") == "dev" {
			ipStr = "99.98.244.156"
		}
		url := fmt.Sprintf("https://geolocation-db.com/json/%s", ipStr)
		method := "GET"

		client := &http.Client{}
		req, err := http.NewRequest(method, url, nil)
		if err != nil {
			fmt.Println(err)
		}

		res, err := client.Do(req)
		if err != nil {
			fmt.Println(err)
		}

		defer res.Body.Close()

		body, err := ioutil.ReadAll(res.Body)
		if err != nil {
			fmt.Println(err)
		}

		var location struct {
			CountryCode *string      `json:"country_code,omitempty"`
			CountryName *string      `json:"country_name,omitempty"`
			City        *string      `json:"city,omitempty"`
			Postal      *string      `json:"postal,omitempty"`
			Latitude    *interface{} `json:"latitude,omitempty"`
			Longitude   *interface{} `json:"longitude,omitempty"`
			IPv4        *string      `json:"IPv4,omitempty"`
			State       *string      `json:"state,omitempty"`
		}
		err = json.Unmarshal(body, &location)
		if err != nil {
			fmt.Println(err)
		}
		if *location.Longitude == "Not found" {
			location.CountryCode = nil
			location.CountryName = nil
			location.City = nil
			location.Postal = nil
			location.Latitude = nil
			location.Longitude = nil
			location.IPv4 = nil
			location.State = nil
		}

		locationByte, err := json.Marshal(location)
		if err != nil {
			fmt.Println(err)
		}

		locationString = string(locationByte)
	}

	var os string
	var browser string
	// Parse the user-agent string
	if userAgentString, ok := ctx.Value("userAgent").(string); ok {
		ua := user_agent.New(userAgentString)
		os = ua.OSInfo().Name
		browser, _ = ua.Browser()
	}

	session := &model.Session{UserID: user.ID, OrganizationID: organizationID, Location: locationString, OS: os, Browser: browser}
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
	var os string
	var browser string
	// Parse the user-agent string
	if userAgentString, ok := ctx.Value("userAgent").(string); ok {
		ua := user_agent.New(userAgentString)
		os = ua.OSInfo().Name
		browser, _ = ua.Browser()
	}

	// TODO Cameron: Add more fields from user agent/location here
	fields := map[string]string{
		"identifier": userIdentifier,
		"os":         os,
		"browser":    browser,
	}
	for k, v := range obj {
		fields[k] = fmt.Sprintf("%v", v)
	}
	err := r.AppendProperties(sessionID, fields)
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
	if len(eventsParsed["events"]) >= 0 {
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
	if len(messagesParsed["messages"]) >= 0 {
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
	if len(resourcesParsed["resources"]) >= 0 {
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
