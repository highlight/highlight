package main

import (
	"context"
	"os"

	"github.com/segmentio/encoding/json"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

func main() {
	ctx := context.TODO()
	db, err := model.SetupDB(ctx, os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}
	var segments []model.Segment
	if err := db.Debug().Where(&model.Segment{}).Scan(&segments).Error; err != nil {
		log.WithContext(ctx).Error("sad")
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
				log.WithContext(ctx).Error("wow")
				continue
			}

			var updateParams model.SearchParams

			for _, prop := range params.UserProperties {
				var id int
				if prop.Name == "contains" {
					if err := db.Debug().Model(&model.Field{}).Where("value ILIKE ? and type = ?", "%"+prop.Value+"%", "user").Pluck("id", &id).Error; err != nil {
						log.WithContext(ctx).Error("user contains: ", err)
						panic("panicking")
					}
				} else {
					if err := db.Debug().Model(&model.Field{}).Where("name = ? AND value = ? AND type = ?", prop.Name, prop.Value, "user").Pluck("id", &id).Error; err != nil {
						log.WithContext(ctx).Error("user: ", err)
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
						log.WithContext(ctx).Error("track contains: ", err)
						panic("panicking")
					}
				} else {
					if err := db.Debug().Model(&model.Field{}).Where("name = ? AND value = ? AND type = ?", prop.Name, prop.Value, "track").Pluck("id", &id).Error; err != nil {
						log.WithContext(ctx).Error("track: ", err)
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
						log.WithContext(ctx).Error("excluded contains: ", err)
						panic("panicking")
					}
				} else {
					if err := db.Debug().Model(&model.Field{}).Where(db.Where(&model.Field{Type: "track"}).Or(&model.Field{Type: "user"})).Where(&model.Field{Name: prop.Name, Value: prop.Value}).Pluck("id", &id).Error; err != nil {
						log.WithContext(ctx).Error("excluded: ", err)
						panic("panicking")
					}
				}
				updateParams.TrackProperties = append(updateParams.TrackProperties, &model.UserProperty{ID: id, Name: prop.Name, Value: prop.Value})
			}
			params.ExcludedProperties = updateParams.ExcludedProperties

			paramsBytes, err = json.Marshal(params)
			if err != nil {
				log.WithContext(ctx).Error("nooo: ", err)
				continue
			}
			paramsString := string(paramsBytes)
			if err := db.Debug().Model(&model.Segment{}).Where(&model.Segment{Model: model.Model{ID: segment.ID}}).Updates(&model.Segment{Params: &paramsString}).Error; err != nil {
				log.WithContext(ctx).Error("ugh: ", err)
			}
		}
	}
}
