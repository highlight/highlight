package main

import (
	"encoding/json"
	"os"
	"strconv"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

type UserPropertyOld struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Value string `json:"value"`
}

func GetPropertiesOld(obj *model.SessionAlert) ([]*UserPropertyOld, error) {
	if obj == nil {
		return nil, e.New("empty session alert object for track properties")
	}
	propertyString := "[]"
	if obj.TrackProperties != nil {
		propertyString = *obj.TrackProperties
	}
	var sanitizedProperties []*UserPropertyOld
	if err := json.Unmarshal([]byte(propertyString), &sanitizedProperties); err != nil {
		return nil, e.Wrap(err, "error unmarshalling sanitized track properties")
	}
	return sanitizedProperties, nil
}

func main() {
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.Fatalf("error setting up db: %+v", err)
	}
	var sessionAlerts []model.SessionAlert
	db.Model(model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{Type: &model.AlertType.USER_PROPERTIES}}).Or(&model.SessionAlert{Alert: model.Alert{Type: &model.AlertType.TRACK_PROPERTIES}}).Scan(&sessionAlerts)
	log.Infof("%+v", sessionAlerts)
	for _, alert := range sessionAlerts {
		if alert.TrackProperties != nil {
			trackProperties, err := GetPropertiesOld(&alert)
			if err != nil {
				log.Error("error getting track properties")
				continue
			}
			var newProperties []model.TrackProperty
			toBreak := false
			for _, prop := range trackProperties {
				properId, err := strconv.Atoi(prop.ID)
				if err != nil {
					log.Error("wut2")
					toBreak = true
					break
				}
				newProperties = append(newProperties, model.TrackProperty{ID: properId, Name: prop.Name, Value: prop.Value})
			}
			if toBreak {
				log.Error("wut22")
				continue
			}
			props, err := json.Marshal(newProperties)
			if err != nil {
				log.Error("ugh")
				continue
			}
			propsStr := string(props)
			if err := db.Debug().Where(&model.SessionAlert{Model: model.Model{ID: alert.ID}}).Updates(&model.SessionAlert{TrackProperties: &propsStr}).Error; err != nil {
				log.Error("ripparoni")
				continue
			}
		}
		if alert.UserProperties != nil {
			userProperties, err := GetPropertiesOld(&alert)
			if err != nil {
				log.Error("Fff")
				continue
			}
			var newProperties []model.UserProperty
			toBreak := false
			for _, prop := range userProperties {
				properId, err := strconv.Atoi(prop.ID)
				if err != nil {
					log.Error("wut")
					toBreak = true
					break
				}
				newProperties = append(newProperties, model.UserProperty{ID: properId, Name: prop.Name, Value: prop.Value})
			}
			if toBreak {
				log.Error("wut234")
				continue
			}
			props, err := json.Marshal(newProperties)
			if err != nil {
				log.Error("nooooo")
				continue
			}
			propsStr := string(props)
			log.Info(propsStr)
			if err := db.Debug().Where(&model.SessionAlert{Model: model.Model{ID: alert.ID}}).Updates(&model.SessionAlert{UserProperties: &propsStr}).Error; err != nil {
				log.Error("ripparoni")
				continue
			}
		}
	}

}
