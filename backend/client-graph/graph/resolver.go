package graph

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jinzhu/gorm"
	"github.com/mssola/user_agent"
	e "github.com/pkg/errors"
)

// This file will not be regenerated automatically.
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

func (r *Resolver) AppendProperties(sessionID int, propertiesObject map[string]string) error {
	session := &model.Session{}
	res := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return e.Wrap(err, "error receiving session")
	}

	modelFields := []model.Field{}
	for fk, fv := range propertiesObject {
		// Get the field with org_id, name, value
		field := &model.Field{}
		res = r.DB.Where(&model.Field{OrganizationID: session.OrganizationID, Name: fk, Value: fv}).First(&field)
		// If the field doesn't exist, we create it.
		if err := res.Error; err != nil || res.RecordNotFound() {
			f := &model.Field{OrganizationID: session.OrganizationID, Name: fk, Value: fv}
			if err := r.DB.Create(f).Error; err != nil {
				return e.Wrap(err, "error creating field")
			}
			field = f
		}
		modelFields = append(modelFields, *field)
	}

	re := r.DB.Model(&session).Association("Fields").Append(modelFields)
	if err := re.Error; err != nil {
		return e.Wrap(err, "error updating fields")
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
