package main

import (
	"os"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

func main() {
	log.WithContext(ctx).Info("setting up db")
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		log.WithContext(ctx).Fatalf("error getting raw db: %+v", err)
	}
	if err := sqlDB.Ping(); err != nil {
		log.WithContext(ctx).Fatalf("error pinging db: %+v", err)
	}
}
