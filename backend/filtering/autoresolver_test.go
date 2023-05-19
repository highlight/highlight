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

	now := time.Now()
	twentyThreeHoursAgo := now.Add(-time.Hour * 23)
	twentyFiveHoursAgo := now.Add(-time.Hour * 25)

	// Should not be autoresolved
	recentErrorGroup := model.ErrorGroup{
		State:     privateModel.ErrorStateOpen,
		ProjectID: project.ID,
	}
	service.db.Create(&recentErrorGroup)
	recentErrorObject := model.ErrorObject{
		ErrorGroupID: recentErrorGroup.ID,
		Model: model.Model{
			CreatedAt: twentyThreeHoursAgo,
		},
	}
	service.db.Create(&recentErrorObject)

	// Should be autoresolved
	oldErrorGroup := model.ErrorGroup{
		State:     privateModel.ErrorStateOpen,
		ProjectID: project.ID,
	}
	service.db.Create(&oldErrorGroup)
	oldErrorObject := model.ErrorObject{
		ErrorGroupID: oldErrorGroup.ID,
		Model: model.Model{
			CreatedAt: twentyFiveHoursAgo,
		},
	}
	service.db.Create(&oldErrorObject)

	// Should not be autoresolved since it belongs to a different project
	projectWithNoSettings := model.Project{}
	service.db.Create(&projectWithNoSettings)
	oldErrorGroupForUnrelatedProject := model.ErrorGroup{
		State:     privateModel.ErrorStateOpen,
		ProjectID: projectWithNoSettings.ID,
	}
	service.db.Create(&oldErrorGroupForUnrelatedProject)
	oldErrorObjectForUnrelatedProject := model.ErrorObject{
		ErrorGroupID: oldErrorGroup.ID,
		Model: model.Model{
			CreatedAt: twentyFiveHoursAgo,
		},
	}
	service.db.Create(&oldErrorObjectForUnrelatedProject)

	service.AutoResolveStaleErrors(context.TODO())

	errorGroup1 := model.ErrorGroup{}
	service.db.Where(model.ErrorGroup{
		Model: model.Model{
			ID: recentErrorGroup.ID,
		},
	}).Find(&errorGroup1)
	assert.Equal(t, errorGroup1.State, privateModel.ErrorStateOpen) // was not autoresolved

	errorGroup2 := model.ErrorGroup{}
	service.db.Where(model.ErrorGroup{
		Model: model.Model{
			ID: oldErrorGroup.ID,
		},
	}).Find(&errorGroup2)
	assert.Equal(t, errorGroup2.State, privateModel.ErrorStateResolved) // was autoresolved

	errorGroup3 := model.ErrorGroup{}
	service.db.Where(model.ErrorGroup{
		Model: model.Model{
			ID: oldErrorGroupForUnrelatedProject.ID,
		},
	}).Find(&errorGroup3)
	assert.Equal(t, errorGroup3.State, privateModel.ErrorStateOpen) // was not autoresolved
}
