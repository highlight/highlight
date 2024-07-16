package store

import (
	"context"
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/stretchr/testify/assert"
)

func TestGetSession(t *testing.T) {
	defer teardown(t)
	_, err := store.GetSession(context.Background(), 1)
	assert.Error(t, err)

	session := model.Session{}
	store.DB.Create(&session)

	foundSession, err := store.GetSession(context.Background(), session.ID)
	assert.NoError(t, err)
	assert.Equal(t, session.ID, foundSession.ID)
}
