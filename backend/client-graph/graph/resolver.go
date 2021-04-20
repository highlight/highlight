package graph

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/mssola/user_agent"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
	"gorm.io/gorm"
)

// This file will not be regenerated automatically.
//
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB *gorm.DB
}

type Location struct {
	City      string      `json:"city"`
	Postal    string      `json:"postal"`
	Latitude  interface{} `json:"latitude"`
	Longitude interface{} `json:"longitude"`
	State     string      `json:"state"`
}

type DeviceDetails struct {
	IsBot          bool   `json:"is_bot"`
	OSName         string `json:"os_name"`
	OSVersion      string `json:"os_version"`
	BrowserName    string `json:"browser_name"`
	BrowserVersion string `json:"browser_version"`
}

type Property string

var PropertyType = struct {
	USER    Property
	SESSION Property
	TRACK   Property
}{
	USER:    "user",
	SESSION: "session",
	TRACK:   "track",
}

type ErrorMetaData struct {
	Timestamp  time.Time `json:"timestamp"`
	ErrorID    int       `json:"error_id"`
	SessionID  int       `json:"session_id"`
	Browser    string    `json:"browser"`
	OS         string    `json:"os"`
	VisitedURL string    `json:"visited_url"`
}

type FieldData struct {
	Name  string
	Value string
}

//Change to AppendProperties(sessionId,properties,type)
func (r *Resolver) AppendProperties(sessionID int, properties map[string]string, propType Property) error {
	session := &model.Session{}
	res := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session)
	if err := res.Error; err != nil || errors.Is(err, gorm.ErrRecordNotFound) {
		return e.Wrap(err, "error receiving session")
	}

	modelFields := []*model.Field{}
	for k, fv := range properties {
		modelFields = append(modelFields, &model.Field{OrganizationID: session.OrganizationID, Name: k, Value: fv, Type: string(propType)})
	}

	err := r.AppendFields(modelFields, session)
	if err != nil {
		return e.Wrap(err, "error appending fields")
	}

	return nil
}

func (r *Resolver) AppendFields(fields []*model.Field, session *model.Session) error {
	fieldsToAppend := []*model.Field{}
	var newFieldGroup []FieldData
	exists := false
	if session.FieldGroup != nil {
		if err := json.Unmarshal([]byte(*session.FieldGroup), &newFieldGroup); err != nil {
			return e.Wrap(err, "error decoding session field group")
		}
	}
	for _, f := range fields {
		field := &model.Field{}
		res := r.DB.Where(f).First(&field)
		// If the field doesn't exist, we create it.
		if err := res.Error; err != nil || errors.Is(err, gorm.ErrRecordNotFound) {
			if err := r.DB.Create(f).Error; err != nil {
				return e.Wrap(err, "error creating field")
			}
			fieldsToAppend = append(fieldsToAppend, f)
			newFieldGroup = append(newFieldGroup, FieldData{
				Name:  f.Name,
				Value: f.Value,
			})
		} else {
			exists = false
			for _, existing := range newFieldGroup {
				if field.Name == existing.Name && field.Value == existing.Value {
					exists = true
				}
			}
			fieldsToAppend = append(fieldsToAppend, field)
			if !exists {
				newFieldGroup = append(newFieldGroup, FieldData{
					Name:  field.Name,
					Value: field.Value,
				})
			}
		}
	}
	fieldBytes, err := json.Marshal(newFieldGroup)
	if err != nil {
		return e.Wrap(err, "Error marshalling session field group")
	}
	fieldString := string(fieldBytes)

	if err := r.DB.Model(session).Updates(&model.Session{FieldGroup: &fieldString}).Error; errors.Is(err, gorm.ErrRecordNotFound) || err != nil {
		return e.Wrap(err, "Error updating session field group")
	}
	// We append to this session in the join table regardless.
	if err := r.DB.Model(session).Association("Fields").Append(fieldsToAppend); err != nil {
		return e.Wrap(err, "error updating fields")
	}
	return nil
}

func (r *Resolver) HandleErrorAndGroup(errorObj *model.ErrorObject, frames []interface{}, fields []*model.ErrorField) (*model.ErrorGroup, error) {
	firstFrameBytes, err := json.Marshal(frames)
	if err != nil {
		return nil, e.Wrap(err, "Error marshalling first frame")
	}
	frameString := string(firstFrameBytes)

	errorGroup := &model.ErrorGroup{}

	// Query the DB for errors w/ 1) the same events string and 2) the same trace string.
	// If it doesn't exist, we create a new error group.
	if res := r.DB.Where(&model.ErrorGroup{
		OrganizationID: errorObj.OrganizationID,
		Event:          errorObj.Event,
		Trace:          frameString,
		Type:           errorObj.Type,
	}).First(&errorGroup); errors.Is(err, gorm.ErrRecordNotFound) || res.Error != nil {
		newErrorGroup := &model.ErrorGroup{
			OrganizationID: errorObj.OrganizationID,
			Event:          errorObj.Event,
			Trace:          frameString,
			Type:           errorObj.Type,
			Resolved:       &model.F,
		}
		if err := r.DB.Create(newErrorGroup).Error; err != nil {
			return nil, e.Wrap(err, "Error creating new error group")
		}
		errorGroup = newErrorGroup
	}
	errorObj.ErrorGroupID = errorGroup.ID
	if err := r.DB.Create(errorObj).Error; err != nil {
		return nil, e.Wrap(err, "Error performing error insert for error")
	}

	var newMetadataLog []ErrorMetaData
	if errorGroup.MetadataLog != nil {
		if err := json.Unmarshal([]byte(*errorGroup.MetadataLog), &newMetadataLog); err != nil {
			return nil, e.Wrap(err, "error decoding time log data")
		}
	}

	newMetadataLog = append(newMetadataLog, ErrorMetaData{
		Timestamp:  errorObj.CreatedAt,
		ErrorID:    errorObj.ID,
		SessionID:  errorObj.SessionID,
		OS:         errorObj.OS,
		Browser:    errorObj.Browser,
		VisitedURL: errorObj.URL,
	})

	logBytes, err := json.Marshal(newMetadataLog)
	if err != nil {
		return nil, e.Wrap(err, "Error marshalling metadata log")
	}
	logString := string(logBytes)

	if res := r.DB.Model(errorGroup).Updates(&model.ErrorGroup{MetadataLog: &logString}); errors.Is(err, gorm.ErrRecordNotFound) || res.Error != nil {
		return nil, e.Wrap(err, "Error updating error group metadata log")
	}

	err = r.AppendErrorFields(fields, errorGroup)
	if err != nil {
		return nil, e.Wrap(err, "error appending error fields")
	}

	return errorGroup, nil
}

func (r *Resolver) AppendErrorFields(fields []*model.ErrorField, errorGroup *model.ErrorGroup) error {
	fieldsToAppend := []*model.ErrorField{}
	var newFieldGroup []FieldData
	exists := false
	if errorGroup.FieldGroup != nil {
		if err := json.Unmarshal([]byte(*errorGroup.FieldGroup), &newFieldGroup); err != nil {
			return e.Wrap(err, "error decoding error group field group data")
		}
	}
	for _, f := range fields {
		field := &model.ErrorField{}
		res := r.DB.Where(f).First(&field)
		// If the field doesn't exist, we create it.
		if err := res.Error; err != nil || errors.Is(err, gorm.ErrRecordNotFound) {
			if err := r.DB.Create(f).Error; err != nil {
				return e.Wrap(err, "error creating error field")
			}
			fieldsToAppend = append(fieldsToAppend, f)
			newFieldGroup = append(newFieldGroup, FieldData{
				Name:  f.Name,
				Value: f.Value,
			})
		} else {
			exists = false
			for _, existing := range newFieldGroup {
				if field.Name == existing.Name && field.Value == existing.Value {
					exists = true
				}
			}
			fieldsToAppend = append(fieldsToAppend, field)
			if !exists {
				newFieldGroup = append(newFieldGroup, FieldData{
					Name:  field.Name,
					Value: field.Value,
				})
			}
		}
	}
	fieldBytes, err := json.Marshal(newFieldGroup)
	if err != nil {
		return e.Wrap(err, "Error marshalling error group field group")
	}
	fieldString := string(fieldBytes)

	if res := r.DB.Model(errorGroup).Updates(&model.ErrorGroup{FieldGroup: &fieldString}); errors.Is(err, gorm.ErrRecordNotFound) || res.Error != nil {
		return e.Wrap(err, "Error updating error group field group")
	}
	// We append to this session in the join table regardless.
	if err := r.DB.Model(errorGroup).Association("Fields").Append(fieldsToAppend); err != nil {
		return e.Wrap(err, "error updating error fields")
	}
	return nil
}

func (r *Resolver) SendSlackErrorMessage(group *model.ErrorGroup, org_id int, session_id int, user_identifier string, url string) error {
	organization := &model.Organization{}
	res := r.DB.Where("id = ?", org_id).First(&organization)
	if err := res.Error; err != nil {
		return e.Wrap(err, "error messaging organization")
	}
	if organization.SlackWebhookURL == nil || group == nil {
		return nil
	}
	shortEvent := group.Event
	if len(group.Event) > 50 {
		shortEvent = group.Event[:50] + "..."
	}
	errorLink := fmt.Sprintf("<https://app.highlight.run/%d/errors/%d/>", org_id, group.ID)
	sessionLink := fmt.Sprintf("<https://app.highlight.run/%d/sessions/%d/>", org_id, session_id)
	msg := slack.WebhookMessage{
		Text: group.Event,
		Blocks: &slack.Blocks{
			BlockSet: []slack.Block{
				slack.NewSectionBlock(
					slack.NewTextBlockObject(slack.MarkdownType, "*Highlight Error:*\n\n"+shortEvent+"\n"+errorLink, false, false),
					[]*slack.TextBlockObject{
						slack.NewTextBlockObject(slack.MarkdownType, "*Organization:*\n"+fmt.Sprintf("%d", org_id), false, false),
						slack.NewTextBlockObject(slack.MarkdownType, "*User:*\n"+user_identifier, false, false),
						slack.NewTextBlockObject(slack.MarkdownType, "*Session:*\n"+sessionLink, false, false),
						slack.NewTextBlockObject(slack.MarkdownType, "*Visited Url:*\n"+url, false, false),
					},
					nil,
				),
				slack.NewDividerBlock(),
				slack.NewActionBlock(
					"",
					slack.NewButtonBlockElement(
						"",
						"click",
						slack.NewTextBlockObject(
							slack.PlainTextType,
							"Resolve...",
							false,
							false,
						),
					),
				),
			},
		},
	}
	err := slack.PostWebhook(
		*organization.SlackWebhookURL,
		&msg,
	)
	if err != nil {
		return e.Wrap(err, "error sending slack msg")
	}
	return nil
}

func GetLocationFromIP(ip string) (location *Location, err error) {
	url := fmt.Sprintf("http://geolocation-db.com/json/%s", ip)
	method := "GET"

	client := &http.Client{}
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return nil, err
	}

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(body, &location)
	if err != nil {
		return nil, err
	}

	// long and lat should be float
	switch location.Longitude.(type) {
	case float64:
	default:
		location.Longitude = nil
	}
	switch location.Latitude.(type) {
	case float64:
	default:
		location.Latitude = nil
	}

	return location, nil
}

func GetDeviceDetails(userAgentString string) (deviceDetails DeviceDetails) {
	userAgent := user_agent.New(userAgentString)
	deviceDetails.IsBot = userAgent.Bot()
	deviceDetails.OSName = userAgent.OSInfo().Name
	deviceDetails.OSVersion = userAgent.OSInfo().Version
	deviceDetails.BrowserName, deviceDetails.BrowserVersion = userAgent.Browser()
	return deviceDetails
}

func InitializeSessionImplementation(r *mutationResolver, ctx context.Context, organizationVerboseID string, enableStrictPrivacy bool) (*model.Session, error) {
	organizationID := model.FromVerboseID(organizationVerboseID)
	organization := &model.Organization{}
	if err := r.DB.Where(&model.Organization{Model: model.Model{ID: organizationID}}).First(&organization).Error; err != nil {
		return nil, e.Wrap(err, "org doesn't exist")
	}

	uid, ok := ctx.Value("uid").(int)
	if !ok {
		return nil, e.New("error unwrapping uid in context")
	}

	// Get the current user to check whether the org_id is set.
	user := &model.User{}
	if err := r.DB.Where(&model.User{Model: model.Model{ID: uid}}).First(&user).Error; err != nil {
		return nil, e.Wrap(err, "user doesn't exist")
	}
	// If not, set it.
	if user.OrganizationID != organizationID {
		if err := r.DB.Model(user).Updates(model.User{OrganizationID: organizationID}).Error; err != nil {
			return nil, e.Wrap(err, "error updating user")
		}
	}

	// Get the user's ip, get geolocation data
	location := &Location{
		City:      "",
		Postal:    "",
		Latitude:  0.0,
		Longitude: 0.0,
		State:     "",
	}
	ip, ok := ctx.Value("ip").(string)
	if ok {
		fetchedLocation, err := GetLocationFromIP(ip)
		if err != nil || fetchedLocation == nil {
			log.Errorf("error getting user's location: %v", err)
		} else {
			location = fetchedLocation
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
