package errorgroups

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

func setupErrorGroupsRepository() *ErrorGroupsRepository {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO()).WithFields(log.Fields{"DB_HOST": os.Getenv("PSQL_HOST"), "DB_NAME": dbName})
	db, err := util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error("error creating testdb")
	}

	return NewRepository(db, &opensearch.Client{})
}

func TestUpdateErrorGroupState(t *testing.T) {
	repo := setupErrorGroupsRepository()

	errorGroup := model.ErrorGroup{
		State: privateModel.ErrorStateOpen,
	}

	updatedState := privateModel.ErrorStateIgnored
	updatedSnoozeUntil := time.Now()

	_, err := repo.UpdateErrorGroupState(context.TODO(), &errorGroup, updatedState, &updatedSnoozeUntil)
	assert.EqualError(t, err, "record not found")

	repo.db.Create(&errorGroup)

	updatedErrorGroup, err := repo.UpdateErrorGroupState(context.TODO(), &errorGroup, updatedState, &updatedSnoozeUntil)
	assert.NoError(t, err)

	assert.Equal(t, updatedErrorGroup.State, updatedState)
	assert.Equal(t, updatedErrorGroup.SnoozedUntil, &updatedSnoozeUntil)
}
