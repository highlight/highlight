package filtering

import (
	"context"
	"os"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	_ "gorm.io/driver/postgres"

	"github.com/highlight-run/highlight/backend/util"
)

func setupFilteringRepository() *FilteringRepository {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO()).WithFields(log.Fields{"DB_HOST": os.Getenv("PSQL_HOST"), "DB_NAME": dbName})
	db, err := util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}
	return NewRepository(db)
}

// func TestUpdateProjectFilterSettings(t *testing.T) {
// 	repo := setupFilteringRepository()

// 	util.RunTestWithDBWipe(t, "UpdateProjectFilterSettings", repo.db, func(t *testing.T) {
// 		project := model.Project{}
// 		if err := repo.db.Create(&project).Error; err != nil {
// 			t.Fatal(e.Wrap(err, "error inserting project"))
// 		}

// 		updatedSettings := repo.UpdateProjectFilterSettings(&project, model.ProjectFilterSettings{
// 			FilterSessionsWithoutError: true,
// 		})

// 		assert.True(t, updatedSettings.FilterSessionsWithoutError)
// 	})
// }
