package graph

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jinzhu/gorm"
	"github.com/mssola/user_agent"
	e "github.com/pkg/errors"
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
	Timestamp time.Time `json:"timestamp"`
	ErrorID   int       `json:"error_id"`
	SessionID int       `json:"session_id"`
}

//Change to AppendProperties(sessionId,properties,type)
func (r *Resolver) AppendProperties(sessionID int, properties map[string]string, propType Property) error {
	session := &model.Session{}
	res := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session)
	if err := res.Error; err != nil || res.RecordNotFound() {
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
	for _, f := range fields {
		field := &model.Field{}
		res := r.DB.Where(f).First(&field)
		// If the field doesn't exist, we create it.
		if err := res.Error; err != nil || res.RecordNotFound() {
			if err := r.DB.Create(f).Error; err != nil {
				return e.Wrap(err, "error creating field")
			}
			fieldsToAppend = append(fieldsToAppend, f)
		} else {
			fieldsToAppend = append(fieldsToAppend, field)
		}
	}
	// We append to this session in the join table regardless.
	re := r.DB.Model(session).Association("Fields").Append(fieldsToAppend)
	if err := re.Error; err != nil {
		return e.Wrap(err, "error updating fields")
	}
	return nil
}

func (r *Resolver) UpdateErrorGroup(errorObj model.ErrorObject, firstFrame interface{}, fields []*model.ErrorField) error {
	firstFrameBytes, err := json.Marshal(firstFrame)
	if err != nil {
		return e.Wrap(err, "Error marshalling first frame")
	}
	frameString := string(firstFrameBytes)

	errorGroup := &model.ErrorGroup{}

	if res := r.DB.Where(&model.ErrorGroup{
		OrganizationID: errorObj.OrganizationID,
		Event:          errorObj.Event,
		Trace:          frameString,
	}).First(&errorGroup); res.RecordNotFound() || res.Error != nil {
		newErrorGroup := &model.ErrorGroup{
			OrganizationID: errorObj.OrganizationID,
			Event:          errorObj.Event,
			Trace:          frameString,
		}
		if err := r.DB.Create(newErrorGroup).Error; err != nil {
			return e.Wrap(err, "Error creating new error group")
		}
		errorGroup = newErrorGroup
	}

	var newMetadataLog []ErrorMetaData
	if errorGroup.MetadataLog != nil {
		if err := json.Unmarshal([]byte(*errorGroup.MetadataLog), &newMetadataLog); err != nil {
			return e.Wrap(err, "error decoding time log data")
		}
	}

	newMetadataLog = append(newMetadataLog, ErrorMetaData{
		Timestamp: errorObj.CreatedAt,
		ErrorID:   errorObj.ID,
		SessionID: errorObj.SessionID,
	})

	logBytes, err := json.Marshal(newMetadataLog)
	if err != nil {
		return e.Wrap(err, "Error marshalling metadata log")
	}
	logString := string(logBytes)

	if res := r.DB.Model(errorGroup).Updates(&model.ErrorGroup{MetadataLog: &logString}); res.RecordNotFound() || res.Error != nil {
		return e.Wrap(err, "Error updating error group metadata log")
	}

	err = r.AppendErrorFields(fields, errorGroup)
	if err != nil {
		return e.Wrap(err, "error appending error fields")
	}

	return nil
}

func (r *Resolver) AppendErrorFields(fields []*model.ErrorField, errorGroup *model.ErrorGroup) error {
	fieldsToAppend := []*model.ErrorField{}
	for _, f := range fields {
		field := &model.ErrorField{}
		res := r.DB.Where(f).First(&field)
		// If the field doesn't exist, we create it.
		if err := res.Error; err != nil || res.RecordNotFound() {
			if err := r.DB.Create(f).Error; err != nil {
				return e.Wrap(err, "error creating error field")
			}
			fieldsToAppend = append(fieldsToAppend, f)
		} else {
			fieldsToAppend = append(fieldsToAppend, field)
		}
	}
	// We append to this session in the join table regardless.
	re := r.DB.Model(errorGroup).Association("Fields").Append(fieldsToAppend)
	if err := re.Error; err != nil {
		return e.Wrap(err, "error updating error fields")
	}
	return nil
}

func GetLocationFromIP(ip string) (location *Location, err error) {
	url := fmt.Sprintf("https://geolocation-db.com/json/%s", ip)
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
