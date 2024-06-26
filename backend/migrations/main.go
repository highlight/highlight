package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/model"
	log "github.com/sirupsen/logrus"
	"os"
)

func main() {
	ctx := context.TODO()
	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
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
