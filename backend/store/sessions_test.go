package store

import (
	"context"
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/stretchr/testify/assert"
)

func TestGetSession(t *testing.T) {
	util.RunTestWithDBWipe(t, store.db, func(t *testing.T) {
		_, err := store.GetSession(context.Background(), 1)
		assert.Error(t, err)

		session := model.Session{}
		store.db.Create(&session)

		foundSession, err := store.GetSession(context.Background(), session.ID)
		assert.NoError(t, err)
		assert.Equal(t, session.ID, foundSession.ID)
	})
}
