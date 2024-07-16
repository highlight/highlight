package worker

import (
	"context"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/integrations"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/storage"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

func createAutoResolver() *AutoResolver {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO())
	var err error
	db, err := util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}

	store := store.NewStore(db, redis.NewClient(), integrations.NewIntegrationsClient(db), &storage.FilesystemClient{}, &kafka_queue.MockMessageQueue{}, nil)
	return NewAutoResolver(store, db)
}

func TestAutoResolveStaleErrors(t *testing.T) {
	autoResolver := createAutoResolver()
	db := autoResolver.db

	util.RunTestWithDBWipe(t, db, func(t *testing.T) {
		workspace := model.Workspace{}
		db.Create(&workspace)

		settings := model.AllWorkspaceSettings{WorkspaceID: workspace.ID}
		db.Create(&settings)

		project := model.Project{WorkspaceID: workspace.ID}
		db.Create(&project)

		_, err := autoResolver.store.UpdateProjectFilterSettings(context.TODO(), project.ID, store.UpdateProjectFilterSettingsParams{
			AutoResolveStaleErrorsDayInterval: ptr.Int(1),
		})
		assert.NoError(t, err)

		now := time.Now()
		twentyThreeHoursAgo := now.Add(-time.Hour * 23)
		twentyFiveHoursAgo := now.Add(-time.Hour * 25)

		// Should not be autoresolved
		recentErrorGroup := model.ErrorGroup{
			State:     privateModel.ErrorStateOpen,
			ProjectID: project.ID,
		}
		db.Create(&recentErrorGroup)
		recentErrorObject := model.ErrorObject{
			ErrorGroupID: recentErrorGroup.ID,
			ProjectID:    project.ID,
			Model: model.Model{
				CreatedAt: twentyThreeHoursAgo,
			},
		}
		db.Create(&recentErrorObject)

		// Should be autoresolved
		oldErrorGroup := model.ErrorGroup{
			State:     privateModel.ErrorStateOpen,
			ProjectID: project.ID,
		}
		db.Create(&oldErrorGroup)
		oldErrorObject := model.ErrorObject{
			ErrorGroupID: oldErrorGroup.ID,
			ProjectID:    project.ID,
			Model: model.Model{
				CreatedAt: twentyFiveHoursAgo,
			},
		}
		db.Create(&oldErrorObject)

		// Should not be autoresolved
		hasManyErrorObjectsErrorGroup := model.ErrorGroup{
			State:     privateModel.ErrorStateOpen,
			ProjectID: project.ID,
		}
		db.Create(&hasManyErrorObjectsErrorGroup)
		errorObject1 := model.ErrorObject{
			ErrorGroupID: hasManyErrorObjectsErrorGroup.ID,
			ProjectID:    project.ID,
			Model: model.Model{
				CreatedAt: twentyFiveHoursAgo,
			},
		}
		db.Create(&errorObject1)
		errorObject2 := model.ErrorObject{
			ErrorGroupID: hasManyErrorObjectsErrorGroup.ID,
			ProjectID:    project.ID,
			Model: model.Model{
				CreatedAt: twentyThreeHoursAgo,
			},
		}
		db.Create(&errorObject2)

		// Should not be autoresolved since it belongs to a different project
		projectWithNoSettings := model.Project{}
		db.Create(&projectWithNoSettings)
		oldErrorGroupForUnrelatedProject := model.ErrorGroup{
			State:     privateModel.ErrorStateOpen,
			ProjectID: projectWithNoSettings.ID,
		}
		db.Create(&oldErrorGroupForUnrelatedProject)
		oldErrorObjectForUnrelatedProject := model.ErrorObject{
			ErrorGroupID: oldErrorGroup.ID,
			Model: model.Model{
				CreatedAt: twentyFiveHoursAgo,
			},
		}
		db.Create(&oldErrorObjectForUnrelatedProject)

		autoResolver.AutoResolveStaleErrors(context.TODO())

		errorGroup1 := model.ErrorGroup{}
		db.Where(model.ErrorGroup{
			Model: model.Model{
				ID: recentErrorGroup.ID,
			},
		}).Find(&errorGroup1)
		assert.Equal(t, errorGroup1.State, privateModel.ErrorStateOpen) // was not autoresolved

		errorGroup2 := model.ErrorGroup{}
		db.Where(model.ErrorGroup{
			Model: model.Model{
				ID: oldErrorGroup.ID,
			},
		}).Find(&errorGroup2)
		assert.Equal(t, errorGroup2.State, privateModel.ErrorStateResolved) // was autoresolved

		errorGroup3 := model.ErrorGroup{}
		db.Where(model.ErrorGroup{
			Model: model.Model{
				ID: hasManyErrorObjectsErrorGroup.ID,
			},
		}).Find(&errorGroup3)
		assert.Equal(t, errorGroup3.State, privateModel.ErrorStateOpen) // was not autoresolved

		errorGroup4 := model.ErrorGroup{}
		db.Where(model.ErrorGroup{
			Model: model.Model{
				ID: oldErrorGroupForUnrelatedProject.ID,
			},
		}).Find(&errorGroup4)
		assert.Equal(t, errorGroup4.State, privateModel.ErrorStateOpen) // was not autoresolved
	})
}
