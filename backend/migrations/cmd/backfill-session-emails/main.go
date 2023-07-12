package main

import (
	"context"
	"encoding/json"
	"os"
	"reflect"
	"sync"

	"github.com/highlight-run/highlight/backend/model"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const batchSize = 100

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

// Run via
// `doppler run -- go run backend/migrations/cmd/backfill-session-emails/main.go
func main() {
	ctx := context.Background()
	log.WithContext(ctx).Info("setting up db")
	db, err := model.SetupDB(ctx, os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	log.WithContext(ctx).Infof("starting query")

	var sessions []model.Session

	wg := sync.WaitGroup{}
	inner := func(tx *gorm.DB, batch int) error {
		wg.Add(1)
		go func() {
			for _, session := range sessions {
				var userProperties map[string]interface{}

				if err := json.Unmarshal([]byte(session.UserProperties), &userProperties); err != nil {
					log.WithContext(ctx).Errorf("Error parsing user_properties for session_id:%d : %v\n", session.ID, err)
					continue
				}

				// Check if the parsed JSON has the "email" key
				if email, ok := userProperties["email"].(string); ok {
					// Update the "email" column on the session
					if err := db.Model(&session).Update("email", email).Error; err != nil {
						log.WithContext(ctx).Errorf("Error updating email column: %v\n", err)
						continue
					}
				}
			}
		}()
		wg.Done()
		return nil
	}

	// if err := db.Debug().Where("email IS NULL AND user_properties IS NOT NULL and user_properties != ''").FindInBatches(&sessions, batchSize, inner).Error; err != nil {
	// 	log.WithContext(ctx).Fatalf("failed: %v", err)
	// }

	if err := FindInBatches(db.Debug().Clauses().Model(&model.Session{}).Where("created_at > ?", "2023-06-12 14:00:00 PST").Where("created_at <= ?", "now()"), &sessions, batchSize, inner).Error; err != nil {
		log.WithContext(ctx).Fatalf("error getting sessions: %v", err)
	}

	wg.Wait()
}
