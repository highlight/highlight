package main

import (
	"github.com/highlight-run/highlight/backend/timeseries"
	"gorm.io/gorm"
	"os"
	"strconv"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

const BatchSize = 10000

func main() {
	log.WithContext(ctx).Info("setting up db")
	tdb := timeseries.New()
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

	var mgs []*model.MetricGroup

	inner := func(tx *gorm.DB, batch int) error {
		pointsByProject := make(map[int][]timeseries.Point)
		for _, mg := range mgs {
			firstTime := time.Time{}
			tags := map[string]string{
				"project_id": strconv.Itoa(mg.ProjectID),
				"session_id": strconv.Itoa(mg.SessionID),
				"group_name": mg.GroupName,
			}
			fields := map[string]interface{}{}
			for _, m := range mg.Metrics {
				if m.CreatedAt.After(firstTime) {
					firstTime = m.CreatedAt
				}
				tags[m.Name] = m.Category
				fields[m.Name] = m.Value
			}
			if len(fields) == 0 {
				log.WithContext(ctx).Warnf("no fields for mg %+v", mg)
				continue
			}
			if _, ok := pointsByProject[mg.ProjectID]; !ok {
				pointsByProject[mg.ProjectID] = []timeseries.Point{}
			}
			pointsByProject[mg.ProjectID] = append(pointsByProject[mg.ProjectID], timeseries.Point{
				Time:   firstTime,
				Tags:   tags,
				Fields: fields,
			})
		}
		for projectID, points := range pointsByProject {
			tdb.Write(strconv.Itoa(projectID), timeseries.Metrics, points)
		}
		return nil
	}

	if err := db.Preload("Metrics").Model(&model.MetricGroup{}).FindInBatches(&mgs, BatchSize, inner).Error; err != nil {
		log.WithContext(ctx).Fatalf("failed: %v", err)
	}
	tdb.Stop()
}
