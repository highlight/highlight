package main

import (
	"os"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

func main() {
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatalf("Srror setting up DB: %v", err)
	}

	success, err := model.MigrateDB(db)

	if success {
		os.Exit(0)
	} else {
		log.WithContext(ctx).Fatalf("Error migrating DB: %v", err)
	}
}
