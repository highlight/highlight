package apolloio

import (
	"encoding/json"
	"fmt"
	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/pkg/errors"

	"github.com/highlight-run/highlight/backend/util"
)

var apiKey = env.Config.ApolloIoAPIKey
var emailSenderAccountID = env.Config.ApolloIoSenderID

func Enrich(email string) (short *string, long *string, err error) {
	type MatchRequest struct {
		ApiKey string `json:"api_key"`
		Email  string `json:"email"`
	}
	type MatchResponse struct {
		Person map[string]interface{} `json:"person"`
	}

	matchRequest := &MatchRequest{ApiKey: apiKey, Email: email}
	matchResponse := &MatchResponse{}
	err = util.RestRequest("https://api.apollo.io/v1/people/match", "POST", matchRequest, matchResponse)
	if err != nil {
		return nil, nil, errors.Wrap(err, "error sending match request")
	}

	contactBytes, err := json.MarshalIndent(matchResponse.Person, "", "  ")
	if err == nil {
		long = ptr.String(string(contactBytes))
	} else {
		return nil, nil, errors.Wrap(err, "error marshaling")
	}

	shortContactMap := make(map[string]string)
	for key, val := range matchResponse.Person {
		if valString, ok := val.(string); ok {
			shortContactMap[key] = valString
		}
	}
	contactBytesShort, err := json.MarshalIndent(shortContactMap, "", "  ")
	if err == nil {
		short = ptr.String(string(contactBytesShort))
	} else {
		return nil, nil, errors.Wrap(err, "error marshaling short")
	}
	return short, long, nil
}

type Contact struct {
	ID string `json:"id"`
}
type ContactsResponse struct {
	Contact Contact `json:"contact"`
}

func CreateContact(email string) (*Contact, error) {
	type ContactsRequest struct {
		ApiKey string `json:"api_key"`
		Email  string `json:"email"`
	}
	contactsRequest := &ContactsRequest{ApiKey: apiKey, Email: email}
	contactsResponse := &ContactsResponse{}
	err := util.RestRequest("https://api.apollo.io/v1/contacts", "POST", contactsRequest, contactsResponse)
	if err != nil {
		return nil, errors.Wrap(err, "error sending contacts request")
	}
	return &contactsResponse.Contact, nil
}

func AddToSequence(contactID string, sequenceID string) error {
	type SequenceRequest struct {
		ApiKey                      string   `json:"api_key"`
		ContactIDs                  []string `json:"contact_ids"`
		EmailerCampaignID           string   `json:"emailer_campaign_id"`
		SendEmailFromEmailAccountID string   `json:"send_email_from_email_account_id"`
	}
	type SequenceResponse struct {
		Contacts json.RawMessage `json:"contacts"`
	}
	sequenceRequest := &SequenceRequest{
		ApiKey:                      apiKey,
		ContactIDs:                  []string{contactID},
		EmailerCampaignID:           sequenceID,           // Represents the sequence ID for "Landing Page Signups"
		SendEmailFromEmailAccountID: emailSenderAccountID, // Respresents the ID for Jay's email account (jay@highlight.run)
	}
	sequenceResponse := &SequenceResponse{}
	url := fmt.Sprintf("https://api.apollo.io/v1/emailer_campaigns/%v/add_contact_ids", sequenceRequest.EmailerCampaignID)
	err := util.RestRequest(url, "POST", sequenceRequest, sequenceResponse)
	if err != nil {
		return errors.Wrap(err, "error adding contact")
	}
	return nil
}
