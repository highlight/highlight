package store

import (
	"context"
	"os"
	"testing"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
)

var store *Store

func TestMain(m *testing.M) {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO()).WithFields(log.Fields{"DB_HOST": os.Getenv("PSQL_HOST"), "DB_NAME": dbName})
	var err error
	db, err := util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}

	store = NewStore(db, &opensearch.Client{})
	code := m.Run()
	os.Exit(code)
}
