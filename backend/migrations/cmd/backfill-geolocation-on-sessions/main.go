package main

import (
	"context"

	"github.com/highlight-run/highlight/backend/env"
	"gorm.io/gorm"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
	publicGraph "github.com/highlight-run/highlight/backend/public-graph/graph"
)

const batchSize = 100

// Run via
// `doppler run -- go run backend/migrations/cmd/backfill-geolocation-on-sessions/main.go`
func main() {
	ctx := context.Background()
	log.WithContext(ctx).Info("setting up db")
	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	log.WithContext(ctx).Infof("starting query")

	var sessions []model.Session

	inner := func(tx *gorm.DB, batch int) error {
		for _, session := range sessions {
			location, err := publicGraph.GetLocationFromIP(ctx, session.IP)
			if err != nil {
				log.WithContext(ctx).Errorf("Error fetching geolocation for session_id:%d : %v\n", session.ID, err)
				continue
			}

			if location == nil {
				log.WithContext(ctx).Errorf("Error fetching geolocation for session_id:%d : %v\n", session.ID, err)
				continue
			}

			session.City = location.City
			session.State = location.State
			session.Postal = location.Postal
			session.Country = location.Country
			session.Latitude = location.Latitude.(float64)
			session.Longitude = location.Longitude.(float64)

			if err := db.Model(&session).Updates(map[string]interface{}{
				"city":      location.City,
				"state":     location.State,
				"postal":    location.Postal,
				"country":   location.Country,
				"latitude":  location.Latitude,
				"longitude": location.Longitude,
			}).Error; err != nil {
				log.WithContext(ctx).Errorf("Error updating session_id:%d : %v\n", session.ID, err)
				continue
			}
		}

		return nil
	}

	if err := db.Debug().
		Joins("JOIN projects AS p ON p.id = sessions.project_id").
		Joins("JOIN all_workspace_settings AS aw ON aw.workspace_id = p.workspace_id").
		Where("aw.store_ip = ? AND sessions.country = ? AND sessions.state = ? AND sessions.created_at >= ? AND sessions.IP != ?", true, "", "", "2024-07-19 00:00:00", "").
		Order("id").
		FindInBatches(&sessions, batchSize, inner).
		Error; err != nil {
		log.WithContext(ctx).Fatalf("failed: %v", err)
	}
}
