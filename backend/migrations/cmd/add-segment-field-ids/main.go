package main

import (
	"encoding/json"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

func main() {
	db := model.SetupDB()
	var segments []model.Segment
	if err := db.Debug().Where(&model.Segment{}).Scan(&segments).Error; err != nil {
		log.Error("sad")
		panic("panicking")
	}
	for _, segment := range segments {
		if segment.Params != nil {
			/*
			   user_properties: [UserProperty]
			   excluded_properties: [UserProperty]
			   track_properties: [UserProperty]
			*/
			var params model.SearchParams
			paramsBytes := []byte(*segment.Params)
			err := json.Unmarshal(paramsBytes, &params)
			if err != nil {
				log.Error("wow")
				continue
			}

			var updateParams model.SearchParams

			for _, prop := range params.UserProperties {
				var id int
				if prop.Name == "contains" {
					if err := db.Debug().Model(&model.Field{}).Where("value ILIKE ? and type = ?", "%"+prop.Value+"%", "user").Pluck("id", &id).Error; err != nil {
						log.Error("user contains: ", err)
						panic("panicking")
					}
				} else {
					if err := db.Debug().Model(&model.Field{}).Where("name = ? AND value = ? AND type = ?", prop.Name, prop.Value, "user").Pluck("id", &id).Error; err != nil {
						log.Error("user: ", err)
						panic("panicking")
					}
				}
				updateParams.UserProperties = append(updateParams.UserProperties, &model.UserProperty{ID: id, Name: prop.Name, Value: prop.Value})
			}
			params.UserProperties = updateParams.UserProperties

			for _, prop := range params.TrackProperties {
				var id int
				if prop.Name == "contains" {
					if err := db.Debug().Model(&model.Field{}).Where("value ILIKE ? and type = ?", "%"+prop.Value+"%", "track").Pluck("id", &id).Error; err != nil {
						log.Error("track contains: ", err)
						panic("panicking")
					}
				} else {
					if err := db.Debug().Model(&model.Field{}).Where("name = ? AND value = ? AND type = ?", prop.Name, prop.Value, "track").Pluck("id", &id).Error; err != nil {
						log.Error("track: ", err)
						panic("panicking")
					}

				}
				updateParams.TrackProperties = append(updateParams.TrackProperties, &model.UserProperty{ID: id, Name: prop.Name, Value: prop.Value})
			}
			params.TrackProperties = updateParams.TrackProperties

			for _, prop := range params.ExcludedProperties {
				var id int
				if prop.Name == "contains" {
					if err := db.Debug().Model(&model.Field{}).Where(db.Where(&model.Field{Type: "track"}).Or(&model.Field{Type: "user"})).Where("value ILIKE ?", "%"+prop.Value+"%").Pluck("id", &id).Error; err != nil {
						log.Error("excluded contains: ", err)
						panic("panicking")
					}
				} else {
					if err := db.Debug().Model(&model.Field{}).Where(db.Where(&model.Field{Type: "track"}).Or(&model.Field{Type: "user"})).Where(&model.Field{Name: prop.Name, Value: prop.Value}).Pluck("id", &id).Error; err != nil {
						log.Error("excluded: ", err)
						panic("panicking")
					}
				}
				updateParams.TrackProperties = append(updateParams.TrackProperties, &model.UserProperty{ID: id, Name: prop.Name, Value: prop.Value})
			}
			params.ExcludedProperties = updateParams.ExcludedProperties

			paramsBytes, err = json.Marshal(params)
			if err != nil {
				log.Error("nooo: ", err)
				continue
			}
			paramsString := string(paramsBytes)
			if err := db.Debug().Model(&model.Segment{}).Where(&model.Segment{Model: model.Model{ID: segment.ID}}).Updates(&model.Segment{Params: &paramsString}).Error; err != nil {
				log.Error("ugh: ", err)
			}
		}
	}
}
