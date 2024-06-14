package store

import (
	"context"
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/stretchr/testify/assert"
)

func TestGetOAuth(t *testing.T) {
	ctx := context.Background()

	defer teardown(t)

	_, err := store.GetOAuth(ctx, "abc123")
	assert.Error(t, err)

	client := model.OAuthClientStore{
		Domains: []string{"example.com"},
	}
	store.DB.Create(&client)

	op := model.OAuthOperation{
		ClientID:                   client.ID,
		AuthorizedGraphQLOperation: "test",
	}
	store.DB.Create(&op)

	foundClient, err := store.GetOAuth(ctx, client.ID)
	assert.NoError(t, err)
	assert.Equal(t, foundClient.ID, foundClient.ID)
	assert.Equal(t, foundClient.Secret, foundClient.Secret)
	assert.Equal(t, foundClient.Operations[0].AuthorizedGraphQLOperation, "test")
}
