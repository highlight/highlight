package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
	"github.com/highlight-run/workerpool"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"net/mail"
	"os"
	"reflect"
	"sync"
)

const BatchSize = 64

func FindInBatches(db *gorm.DB, dest interface{}, batchSize int, fc func(tx *gorm.DB, batch int) error) *gorm.DB {
	var (
		tx = db.Order(clause.OrderByColumn{
			Column: clause.Column{Table: clause.CurrentTable, Name: "created_at"},
		}).Session(&gorm.Session{})
		queryDB      = tx
		rowsAffected int64
		batch        int
	)

	for {
		result := queryDB.Limit(batchSize).Find(dest)
		rowsAffected += result.RowsAffected
		batch++

		if result.Error == nil && result.RowsAffected != 0 {
			_ = tx.AddError(fc(result, batch))
		} else if result.Error != nil {
			_ = tx.AddError(result.Error)
		}

		if tx.Error != nil || int(result.RowsAffected) < batchSize {
			break
		} else {
			resultsValue := reflect.Indirect(reflect.ValueOf(dest))
			if result.Statement.Schema.PrioritizedPrimaryField == nil {
				_ = tx.AddError(gorm.ErrPrimaryKeyRequired)
				break
			} else {
				primaryValue, _ := result.Statement.Schema.PrioritizedPrimaryField.ValueOf(resultsValue.Index(resultsValue.Len() - 1))
				queryDB = tx.Clauses(clause.Gt{Column: clause.Column{Table: clause.CurrentTable, Name: clause.PrimaryKey}, Value: primaryValue})
			}
		}
	}
	return tx
}

func main() {
	log.Info("setting up db")
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.Fatalf("error setting up db: %+v", err)
	}

	opensearchClient, err := opensearch.NewOpensearchClient()
	if err != nil {
		log.Fatalf("error creating opensearch client: %v", err)
	}

	r := public.Resolver{
		AlertWorkerPool: workerpool.New(16),
		DB:              db,
		OpenSearch:      opensearchClient,
	}
	log.Infof("starting query")

	var sessions []model.Session

	wg := sync.WaitGroup{}
	inner := func(tx *gorm.DB, batch int) error {
		wg.Add(1)
		go func() {
			for _, session := range sessions {
				if err := r.IndexSessionOpensearch(context.Background(), &session); err != nil {
					log.Error(e.Wrap(err, "error indexing new session in opensearch"))
					continue
				}

				userObj := make(map[string]string)
				// get existing session user properties in case of multiple identify calls
				if existingUserProps, err := session.GetUserProperties(); err == nil {
					for k, v := range existingUserProps {
						userObj[k] = v
					}
				}
				if session.Identifier != "" {
					userObj["identifier"] = session.Identifier
				}
				_, err = mail.ParseAddress(session.Identifier)
				if err == nil {
					userObj["email"] = session.Identifier
				}

				if err := r.AppendProperties(context.Background(), session.ID, userObj, public.PropertyType.USER); err != nil {
					log.Error(e.Wrapf(err, "error backfilling: session: %d", session.ID))
				}

				log.Infof("updated %d", session.ID)
			}
			wg.Done()
		}()
		return nil
	}

	//if err := db.Debug().Clauses().Model(&model.Session{}).Where("created_at > ?", "2023-02-09 14:00:00 PST").Where("created_at <= ?", "2023-02-10 09:13:00 PST").FindInBatches(&sessions, BatchSize, inner).Error; err != nil {
	//	log.Fatalf("error getting sessions: %v", err)
	//}

	if err := FindInBatches(db.Debug().Clauses().Model(&model.Session{}).Where("created_at > ?", "2023-02-09 14:00:00 PST").Where("created_at <= ?", "2023-02-10 09:13:00 PST"), &sessions, BatchSize, inner).Error; err != nil {
		log.Fatalf("error getting sessions: %v", err)
	}

	wg.Wait()

	if err := r.OpenSearch.Close(); err != nil {
		log.Fatalf("error closing OS: %v", err)
	}
}
