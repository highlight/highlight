package filtering

import (
	"context"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/stretchr/testify/assert"
)

func TestAutoResolveStaleErrors(t *testing.T) {
	service := AutoResolverService{setupFilteringRepository(), setupErrorGroupsRepository()}

	project := model.Project{}
	service.db.Create(&project)

	_, err := service.UpdateProjectFilterSettings(project, model.ProjectFilterSettings{
		AutoResolveStaleErrorsDayInterval: 1,
	})
	assert.NoError(t, err)

	errorGroup1 := model.ErrorGroup{
		State:     privateModel.ErrorStateOpen,
		ProjectID: project.ID,
	}
	errorGroup2 := model.ErrorGroup{
		State:     privateModel.ErrorStateOpen,
		ProjectID: project.ID,
	}
	service.db.Create(&errorGroup1)
	service.db.Create(&errorGroup2)

	now := time.Now()
	twentyThreeHoursAgo := now.Add(-time.Hour * 23)
	twentyFiveHoursAgo := now.Add(-time.Hour * 25)

	errorObject1 := model.ErrorObject{
		ErrorGroupID: errorGroup1.ID,
		Model: model.Model{
			CreatedAt: twentyThreeHoursAgo,
		},
	}
	errorObject2 := model.ErrorObject{
		ErrorGroupID: errorGroup2.ID,
		Model: model.Model{
			CreatedAt: twentyFiveHoursAgo,
		},
	}

	service.db.Create(&errorObject1)
	service.db.Create(&errorObject2)

	service.AutoResolveStaleErrors(context.TODO())

	updatedErrorGroup1 := model.ErrorGroup{}
	service.db.Where(model.ErrorGroup{
		Model: model.Model{
			ID: errorGroup1.ID,
		},
	}).Find(&updatedErrorGroup1)

	assert.Equal(t, updatedErrorGroup1.State, privateModel.ErrorStateOpen)

	updatedErrorGroup2 := model.ErrorGroup{}
	service.db.Where(model.ErrorGroup{
		Model: model.Model{
			ID: errorGroup2.ID,
		},
	}).Find(&updatedErrorGroup2)

	assert.Equal(t, updatedErrorGroup2.State, privateModel.ErrorStateResolved)
}
