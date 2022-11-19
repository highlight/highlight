package main

import (
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	private "github.com/highlight-run/highlight/backend/private-graph/graph"
	"github.com/highlight-run/highlight/backend/timeseries"
	log "github.com/sirupsen/logrus"
	"os"
	"strconv"
	"time"
)

const LookbackDays = 30

func main() {
	log.Info("setting up infra")
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.Fatalf("error creating db: %v", err)
	}
	opensearchClient, err := opensearch.NewOpensearchClient()
	if err != nil {
		log.Fatalf("error creating opensearch client: %v", err)
	}
	tdb := timeseries.New()
	pri := private.Resolver{
		DB:         db,
		TDB:        tdb,
		OpenSearch: opensearchClient,
	}
	log.Info("done setting up infra")

	var projects []*model.Project
	if err := db.Debug().Model(&model.Project{}).Scan(&projects).Error; err != nil {
		log.Fatalf("error getting projects: %v", err)
	}

	for _, project := range projects {
		projectID := project.ID
		var errorGroups []*model.ErrorGroup
		if err := db.Debug().Model(&model.ErrorGroup{}).Where(&model.ErrorGroup{ProjectID: projectID}).Scan(&errorGroups).Error; err != nil {
			log.Fatalf("error getting error groups: %v", err)
		}

		err = pri.SetErrorFrequencies(errorGroups, LookbackDays)
		if err != nil {
			log.Fatalf("failed to get opensearch error group frequencies: %v", err)
		}

		var points []timeseries.Point
		for _, errorGroup := range errorGroups {
			for i, f := range errorGroup.ErrorFrequency {
				points = append(points, timeseries.Point{
					Time: time.Now().Add(-24 * time.Hour * time.Duration(LookbackDays-i)),
					Tags: map[string]string{
						"ErrorGroupID": strconv.Itoa(errorGroup.ID),
					},
					Fields: map[string]interface{}{
						"count": f,
					},
				})
			}
		}
		log.Infof("writing %d points for project %d", len(points), projectID)
		tdb.Write(strconv.Itoa(projectID), timeseries.Error.AggName, points)
	}

	_ = opensearchClient.Close()
	tdb.Stop()
}
