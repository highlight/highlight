package integrations

import (
	"context"
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/stretchr/testify/assert"
)

func TestIsProjectIntegrated(t *testing.T) {
	util.RunTestWithDBWipe(t, "UpdateProjectFilterSettings", client.db, func(t *testing.T) {
		project := model.Project{}
		err := client.db.Create(&project).Error
		assert.NoError(t, err)

		// Clickup
		integrated, err := client.IsProjectIntegrated(context.Background(), &project, privateModel.IntegrationTypeClickUp)
		assert.NoError(t, err)

		assert.False(t, integrated)

		mapping := model.IntegrationProjectMapping{
			IntegrationType: privateModel.IntegrationTypeClickUp,
			ProjectID:       project.ID,
			ExternalID:      "clickup-space-id",
		}
		err = client.db.Create(&mapping).Error
		assert.NoError(t, err)

		integrated, err = client.IsProjectIntegrated(context.Background(), &project, privateModel.IntegrationTypeClickUp)
		assert.NoError(t, err)
		assert.True(t, integrated)

	})
}
