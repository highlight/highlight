package main

import (
	"context"
	"encoding/json"
	"github.com/highlight-run/highlight/backend/env"
	"gorm.io/gorm"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

const batchSize = 100

// Run via
// `doppler run -- go run backend/migrations/cmd/backfill-session-emails/main.go“
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
		var userProperties map[string]interface{}
		for _, session := range sessions {
			if err := json.Unmarshal([]byte(session.UserProperties), &userProperties); err != nil {
				log.WithContext(ctx).Errorf("Error parsing user_properties for session_id:%d : %v\n", session.ID, err)
				continue
			}

			// Check if the parsed JSON has the "email" key
			if email, ok := userProperties["email"].(string); ok {
				// Update the "email" column on the session
				if err := db.Model(&session).Update("email", email).Error; err != nil {
					log.WithContext(ctx).Errorf("Error updating email column: %v\n", err)
					continue
				}
			}

		}

		return nil
	}

	if err := db.Debug().Where("email IS NULL").FindInBatches(&sessions, batchSize, inner).Error; err != nil {
		log.WithContext(ctx).Fatalf("failed: %v", err)
	}
}
