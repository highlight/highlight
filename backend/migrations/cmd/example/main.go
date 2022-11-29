package main

import (
	"fmt"
	"os"

	hubspotApi "github.com/highlight-run/highlight/backend/hubspot"
	"github.com/leonelquinteros/hubspot"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

func main() {
	log.Info("setting up db")
	db, _ := model.SetupDB(os.Getenv("PSQL_DB"))

	api := hubspotApi.NewHubspotAPI(hubspot.NewClient(hubspot.NewClientConfig()), db)
	fmt.Printf("api: %+v\n", api)

	api.FetchContact("chris@highlight.io")
}
