package filtering

import (
	"context"
	"os"
	"testing"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
)

var db *gorm.DB

func setupRepository() FilteringRepository {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO()).WithFields(log.Fields{"DB_HOST": os.Getenv("PSQL_HOST"), "DB_NAME": dbName})
	var err error
	db, err = util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}
	return FilteringRepository{
		db: db,
	}
}

func TestUpdateProjectFilterSettings(t *testing.T) {
	repo := setupRepository()

	util.RunTestWithDBWipe(t, "UpdateProjectFilterSettings", repo.db, func(t *testing.T) {
		project := model.Project{}
		if err := db.Create(&project).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting project"))
		}

		updatedSettings := repo.UpdateProjectFilterSettings(&project, model.ProjectFilterSettings{
			FilterSessionsWithoutError: true,
		})

		assert.True(t, updatedSettings.FilterSessionsWithoutError)
	})
}
