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
var repo ProjectFiltersRepository

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO()).WithFields(log.Fields{"DB_HOST": os.Getenv("PSQL_HOST"), "DB_NAME": dbName})
	var err error
	db, err = util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}
	repo = ProjectFiltersRepository{
		db: db,
	}
	code := m.Run()
	os.Exit(code)
}

func TestUpdateProjectFilters(t *testing.T) {
	util.RunTestWithDBWipe(t, "UpdateProjectFilters", db, func(t *testing.T) {
		project := model.Project{}
		if err := db.Create(&project).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting project"))
		}

		updatedSettings := repo.UpdateProjectFilters(&project, model.ProjectFilterSettings{
			FilterSessionsWithoutError: true,
		})

		assert.True(t, updatedSettings.FilterSessionsWithoutError)
	})
}
