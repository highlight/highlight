package main

import (
	"context"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/model"
	private "github.com/highlight-run/highlight/backend/private-graph/graph"
	"github.com/highlight-run/highlight/backend/timeseries"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const LookbackDays = 30
const BatchSize = 1000

func main() {
	ctx := context.TODO()
	log.WithContext(ctx).Info("setting up infra")
	db, err := model.SetupDB(ctx, os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatalf("error creating db: %v", err)
	}
	clickhouseClient, err := clickhouse.NewClient(clickhouse.PrimaryDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error creating clickhouse client: %v", err)
	}
	tdb := timeseries.New(ctx)
	pri := private.Resolver{
		DB:               db,
		TDB:              tdb,
		ClickhouseClient: clickhouseClient,
	}
	log.WithContext(ctx).Info("done setting up infra")

	var projects []*model.Project
	if err := db.Debug().Model(&model.Project{}).Scan(&projects).Error; err != nil {
		log.WithContext(ctx).Fatalf("error getting projects: %v", err)
	}

	wg := sync.WaitGroup{}
	for _, project := range projects {
		wg.Add(1)
		go func(projectID int) {
			errorGroups := &[]*model.ErrorGroup{}
			inner := func(tx *gorm.DB, batch int) error {
				err = pri.SetErrorFrequenciesClickhouse(ctx, projectID, *errorGroups, LookbackDays)
				if err != nil {
					return err
				}

				for _, errorGroup := range *errorGroups {
					var points []timeseries.Point
					for i, f := range errorGroup.ErrorFrequency {
						point := timeseries.Point{
							Time: time.Now().Add(-24 * time.Hour * time.Duration(LookbackDays-i)),
							Tags: map[string]string{
								"ErrorGroupID": strconv.Itoa(errorGroup.ID),
							},
							Fields: map[string]interface{}{
								"count": f,
							},
						}
						points = append(points, point)
					}
					log.WithContext(ctx).Infof("writing %d points for project %d eg %d", len(points), projectID, errorGroup.ID)
					tdb.Write(ctx, strconv.Itoa(projectID), timeseries.Error.AggName, points)
				}
				return nil
			}

			if err := db.Debug().Model(&model.ErrorGroup{}).Where(&model.ErrorGroup{ProjectID: projectID}).FindInBatches(errorGroups, BatchSize, inner).Error; err != nil {
				log.WithContext(ctx).Fatalf("error processing error groups: %v", err)
			}
			wg.Done()
		}(project.ID)
	}
	wg.Wait()

	tdb.Stop()
}
