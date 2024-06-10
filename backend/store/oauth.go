package store

import (
	"context"
	"fmt"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
)

func (store *Store) GetOAuth(ctx context.Context, id string) (*model.OAuthClientStore, error) {
	return redis.CachedEval(ctx, store.Redis, fmt.Sprintf("oauth-client-id-%s", id), 150*time.Millisecond, time.Minute, func() (*model.OAuthClientStore, error) {
		var oauthClient model.OAuthClientStore
		err := store.DB.
			Model(&model.OAuthClientStore{}).
			Preload("Operations").
			Where(&model.OAuthClientStore{ID: id}).
			Take(&oauthClient).Error

		return &oauthClient, err
	})
}
