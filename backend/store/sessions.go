package store

import (
	"context"
	"fmt"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
	log "github.com/sirupsen/logrus"
)

func (store *Store) GetSessionFromSecureID(ctx context.Context, secureID string) (*model.Session, error) {
	return redis.CachedEval(ctx, store.Redis, fmt.Sprintf("session-secure-%s", secureID), 150*time.Millisecond, time.Second, func() (*model.Session, error) {
		var session model.Session
		if err := store.DB.WithContext(ctx).Model(&session).Where(&model.Session{SecureID: secureID}).Take(&session).Error; err != nil {
			log.WithContext(ctx).WithError(err).WithField("session_secure_id", secureID).Error("failed to get session by secure id")
			return nil, err
		}
		return &session, nil
	})
}

func (store *Store) GetSession(ctx context.Context, sessionID int) (*model.Session, error) {
	return redis.CachedEval(ctx, store.Redis, fmt.Sprintf("session-id-%d", sessionID), 150*time.Millisecond, time.Second, func() (*model.Session, error) {
		var session model.Session
		if err := store.DB.WithContext(ctx).Model(&session).Where(&model.Session{Model: model.Model{ID: sessionID}}).Take(&session).Error; err != nil {
			log.WithContext(ctx).WithError(err).WithField("session_id", sessionID).Error("failed to get session by id")
			return nil, err
		}
		return &session, nil
	})
}
