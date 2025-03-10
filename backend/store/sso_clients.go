package store

import (
	"context"
	"github.com/highlight-run/highlight/backend/model"
)

func (store *Store) GetSSOClients(ctx context.Context) ([]*model.SSOClient, error) {
	var ssoClients []*model.SSOClient
	return ssoClients, store.DB.
		WithContext(ctx).
		Model(&model.SSOClient{}).
		Find(&ssoClients).Error
}

func (store *Store) GetSSOClient(ctx context.Context, domain string) (*model.SSOClient, error) {
	var ssoClient model.SSOClient
	return &ssoClient, store.DB.
		WithContext(ctx).
		Model(&model.SSOClient{}).
		Where(&model.SSOClient{Domain: domain}).
		Take(&ssoClient).Error
}
