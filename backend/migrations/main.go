package main

import (
	"context"
	"os"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

func main() {
	ctx := context.TODO()
	db, err := model.SetupDB(ctx, os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatalf("Srror setting up DB: %v", err)
	}

	success, err := model.MigrateDB(ctx, db)

	if success {
		os.Exit(0)
	} else {
		log.WithContext(ctx).Fatalf("Error migrating DB: %v", err)
	}
}
