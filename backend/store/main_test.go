package store

import (
	"context"
	"os"
	"testing"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/integrations"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/storage"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
)

var store *Store

func TestMain(m *testing.M) {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO())

	db, err := util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}

	clickhouseClient, err := clickhouse.SetupClickhouseTestDB()
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating clickhouse test db"))
	}

	store = NewStore(db, redis.NewClient(), integrations.NewIntegrationsClient(db), &storage.FilesystemClient{}, &kafka_queue.MockMessageQueue{}, clickhouseClient)
	code := m.Run()
	os.Exit(code)
}

func teardown(t *testing.T) {
	err := util.ClearTablesInDB(store.DB)
	if err != nil {
		t.Fatal(e.Wrap(err, "error clearing database"))
	}

	err = store.Redis.FlushDB(context.TODO())
	if err != nil {
		t.Fatal(e.Wrap(err, "error clearing database"))
	}
}
