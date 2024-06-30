package integrations

import (
	"context"
	"fmt"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/integrations/gitlab"
	"github.com/highlight-run/highlight/backend/integrations/height"
	"github.com/highlight-run/highlight/backend/integrations/jira"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"golang.org/x/oauth2"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Client struct {
	db     *gorm.DB
	height *height.HeightClient
}

func NewIntegrationsClient(db *gorm.DB) *Client {
	client := &Client{
		db:     db,
		height: height.NewHeightClient(),
	}

	return client
}

func getOAuthConfig(integrationType modelInputs.IntegrationType) (*oauth2.Config, []oauth2.AuthCodeOption, error) {
	if integrationType == modelInputs.IntegrationTypeHeight {
		return height.GetOAuthConfig()
	}

	if integrationType == modelInputs.IntegrationTypeJira {
		return jira.GetOAuthConfig()
	}

	if integrationType == modelInputs.IntegrationTypeGitLab {
		return gitlab.GetOAuthConfig()
	}

	return nil, nil, fmt.Errorf("invalid integrationType: %s", integrationType)
}

func getRefreshOAuthToken(ctx context.Context, oldToken *oauth2.Token, integrationType modelInputs.IntegrationType) (*oauth2.Token, error) {
	if integrationType == modelInputs.IntegrationTypeHeight {
		return height.GetRefreshToken(ctx, oldToken)
	}

	if integrationType == modelInputs.IntegrationTypeJira {
		return jira.GetRefreshToken(ctx, oldToken)
	}

	if integrationType == modelInputs.IntegrationTypeGitLab {
		return gitlab.GetRefreshToken(ctx, oldToken)
	}

	return nil, fmt.Errorf("invalid integrationType: %s", integrationType)
}

func (c *Client) setWorkspaceToken(workspace *model.Workspace, integrationType modelInputs.IntegrationType, token *oauth2.Token) error {
	integrationWorkspaceMapping := &model.IntegrationWorkspaceMapping{
		WorkspaceID:     workspace.ID,
		IntegrationType: integrationType,
		AccessToken:     token.AccessToken,
		RefreshToken:    token.RefreshToken,
		Expiry:          token.Expiry,
	}

	if err := c.db.Clauses(clause.OnConflict{
		UpdateAll: true,
	}).Create(integrationWorkspaceMapping).Error; err != nil {
		return err
	}

	return nil
}

func (c *Client) GetAndSetWorkspaceToken(ctx context.Context, workspace *model.Workspace, integrationType modelInputs.IntegrationType, code string) error {
	conf, options, err := getOAuthConfig(integrationType)

	if err != nil {
		return err
	}

	token, err := conf.Exchange(ctx, code, options...)

	if err != nil {
		return err
	}

	return c.setWorkspaceToken(workspace, integrationType, token)
}

func (c *Client) GetWorkspaceAccessToken(ctx context.Context, workspace *model.Workspace, integrationType modelInputs.IntegrationType) (*string, error) {
	workspaceMapping := &model.IntegrationWorkspaceMapping{}
	if err := c.db.Where(&model.IntegrationWorkspaceMapping{
		WorkspaceID:     workspace.ID,
		IntegrationType: integrationType,
	}).Take(&workspaceMapping).Error; err != nil {
		return nil, nil
	}

	if workspaceMapping == nil {
		return nil, nil
	}

	oldToken := new(oauth2.Token)
	oldToken.AccessToken = workspaceMapping.AccessToken
	oldToken.RefreshToken = workspaceMapping.RefreshToken
	oldToken.Expiry = workspaceMapping.Expiry

	if !oldToken.Valid() {
		log.WithContext(ctx).Infof("Refreshing access token for %s integration", integrationType)

		newToken, err := getRefreshOAuthToken(ctx, oldToken, integrationType)
		if err != nil {
			return nil, fmt.Errorf("failed to get oauth refresh token: %w", err)
		}

		err = c.setWorkspaceToken(workspace, integrationType, newToken)
		if err != nil {
			return nil, fmt.Errorf("failed to set refreshed oauth token: %w", err)
		}

		return &newToken.AccessToken, nil
	}

	return &oldToken.AccessToken, nil
}

func (c *Client) IsProjectIntegrated(ctx context.Context, project *model.Project, integrationType modelInputs.IntegrationType) (bool, error) {
	if integrationType == modelInputs.IntegrationTypeClickUp {
		var projectMapping *model.IntegrationProjectMapping
		if err := c.db.Where(&model.IntegrationProjectMapping{
			ProjectID:       project.ID,
			IntegrationType: integrationType,
		}).Take(&projectMapping).Error; err != nil {
			return false, nil
		}

		if projectMapping == nil {
			return false, nil
		}

		return true, nil
	}

	var workspace model.Workspace
	if err := c.db.Where(&model.Workspace{Model: model.Model{ID: project.WorkspaceID}}).Take(&workspace).Error; err != nil {
		return false, nil
	}

	accessToken, err := c.GetWorkspaceAccessToken(ctx, &workspace, integrationType)

	if err != nil {
		return false, err
	}

	if accessToken == nil {
		return false, nil
	}

	var projectMapping *model.IntegrationProjectMapping
	if err := c.db.Where(&model.IntegrationProjectMapping{
		ProjectID:       project.ID,
		IntegrationType: integrationType,
	}).Take(&projectMapping).Error; err != nil {
		return false, nil
	}

	if projectMapping == nil {
		return false, nil
	}

	return true, nil
}
