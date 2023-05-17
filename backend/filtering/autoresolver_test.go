package filtering

import (
	"context"
	"os"
	"testing"

	"github.com/highlight-run/highlight/backend/errorgroups"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/util"
	log "github.com/sirupsen/logrus"
)

func setupErrorGroupsRepository() *errorgroups.ErrorGroupsRepository {
	dbName := "highlight_testing_db2"
	testLogger := log.WithContext(context.TODO()).WithFields(log.Fields{"DB_HOST": os.Getenv("PSQL_HOST"), "DB_NAME": dbName})
	db, err := util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error("error creating testdb")
	}

	return errorgroups.NewRepository(db, &opensearch.Client{})
}

func TestAutoResolveStaleErrors(t *testing.T) {
	service := AutoResolverService{setupFilteringRepository(), setupErrorGroupsRepository()}
	service.AutoResolveStaleErrors(context.TODO())
}
