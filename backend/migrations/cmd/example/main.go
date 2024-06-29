package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/env"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

func main() {
	ctx := context.TODO()
	log.WithContext(ctx).Info("setting up db")
	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
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
