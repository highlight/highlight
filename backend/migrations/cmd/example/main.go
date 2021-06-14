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
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("error getting raw db: %+v", err)
	}
	if err := sqlDB.Ping(); err != nil {
		log.Fatalf("error pinging db: %+v", err)
	}
}
