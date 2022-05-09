package graph

import (
	"os"
	"testing"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
)

var DB *gorm.DB

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	dbName := "highlight_testing_db"
	testLogger := log.WithFields(log.Fields{"DB_HOST": os.Getenv("PSQL_HOST"), "DB_NAME": dbName})
	var err error
	DB, err = util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}
	code := m.Run()
	os.Exit(code)
}

func TestResolver_GetSessionChunk(t *testing.T) {
	timestamps := []int64{
		1651073243208,
		1651073392851,
		1651073564534,
		1651073772378,
		1651074011838,
		1651074045741,
		1651074284153,
		1651074417161,
	}
	util.RunTestWithDBWipe(t, "Test Chunk", DB, func(t *testing.T) {
		// inserting the data
		sessionsToInsert := []model.Session{
			{ActiveLength: 1000, ProjectID: 1, Viewed: nil},
		}
		if err := DB.Create(&sessionsToInsert).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting sessions"))
		}
		chunksToInsert := []model.EventChunk{}
		for idx, ts := range timestamps {
			chunksToInsert = append(chunksToInsert, model.EventChunk{
				SessionID:  sessionsToInsert[0].ID,
				ChunkIndex: idx,
				Timestamp:  ts,
			})
		}
		if err := DB.Create(&chunksToInsert).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting sessions"))
		}

		// test logic
		r := &queryResolver{Resolver: &Resolver{DB: DB}}
		chunkIdx, chunkTs := r.GetSessionChunk(sessionsToInsert[0].ID, 792248)
		if chunkIdx != 4 {
			t.Fatalf("received incorrect chunk idx %d", chunkIdx)
		}
		if chunkTs != 23618 {
			t.Fatalf("received incorrect chunk ts %d", chunkTs)
		}
	})
}
