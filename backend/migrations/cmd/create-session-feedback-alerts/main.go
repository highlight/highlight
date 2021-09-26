package main

import (
	"os"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

func main() {
	log.Info("setting up db")
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.Fatalf("error setting up db: %+v", err)
	}

	var projects []model.Project
	if err := db.Model(&model.Project{}).Scan(&projects).Error; err != nil {
		log.Fatalf("error getting projects: %v", err)
	}

	thresholdWindow := 30
	emptiness := "[]"
	var alerts []model.SessionAlert
	for _, o := range projects {
		alerts = append(alerts, model.SessionAlert{
			Alert: model.Alert{
				ProjectID:            o.ID,
				ExcludedEnvironments: &emptiness,
				CountThreshold:       1,
				ThresholdWindow:      &thresholdWindow,
				ChannelsToNotify:     &emptiness,
				Type:                 &model.AlertType.SESSION_FEEDBACK,
			},
		})
	}
	if err := db.Create(&alerts).Error; err != nil {
		log.Fatalf("error creating alerts: %v", err)
	}
}
