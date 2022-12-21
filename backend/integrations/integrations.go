package integrations

import (
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"gorm.io/gorm"
)

type Client struct {
	db *gorm.DB
}

func NewIntegrationsClient(db *gorm.DB) *Client {
	client := &Client{
		db: db,
	}

	return client
}

func (c *Client) GetWorkspaceAccessToken(workspace *model.Workspace, integrationType modelInputs.IntegrationType) (*string, error) {
	workspaceMapping := &model.IntegrationWorkspaceMapping{}
	if err := c.db.Where(&model.IntegrationWorkspaceMapping{
		WorkspaceID:     workspace.ID,
		IntegrationType: integrationType,
	}).First(&workspaceMapping).Error; err != nil {
		return nil, err
	}

	return &workspaceMapping.AccessToken, nil
}
