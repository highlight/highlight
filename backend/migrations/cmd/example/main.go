package main

import (
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

func main() {
	log.Info("setting up db")
	db := model.SetupDB()
}
