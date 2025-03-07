package store

import (
	"context"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
)

type SSOClients struct {
	Clients []*model.SSOClient
}

func (store *Store) GetSSOClients(ctx context.Context) (*SSOClients, error) {
	return redis.CachedEval(ctx, store.Redis, "sso-clients", time.Second, time.Second, func() (*SSOClients, error) {
		var ssoClients []*model.SSOClient
		err := store.DB.
			Model(&model.SSOClient{}).
			Find(&ssoClients).Error

		return &SSOClients{Clients: ssoClients}, err
	})
}
