package store

import (
	"context"
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/stretchr/testify/assert"
)

func TestGetSSOClients(t *testing.T) {
	ctx := context.Background()

	defer teardown(t)

	res, err := store.GetSSOClients(ctx)
	assert.NoError(t, err)
	assert.Empty(t, res)

	client := model.SSOClient{
		Domain:       "example.com",
		ClientID:     "abc123",
		ClientSecret: "def456",
		ProviderURL:  "https://example.com/auth",
	}
	store.DB.Create(&client)

	foundClients, err := store.GetSSOClients(ctx)
	assert.NoError(t, err)
	assert.Equal(t, foundClients[0].Domain, client.Domain)
	assert.Equal(t, foundClients[0].ClientID, client.ClientID)
	assert.Equal(t, foundClients[0].ClientSecret, client.ClientSecret)
	assert.Equal(t, foundClients[0].ProviderURL, client.ProviderURL)

	foundClient, err := store.GetSSOClient(ctx, "example.com")
	assert.NoError(t, err)
	assert.Equal(t, foundClient.Domain, client.Domain)
	assert.Equal(t, foundClient.ClientID, client.ClientID)
	assert.Equal(t, foundClient.ClientSecret, client.ClientSecret)
	assert.Equal(t, foundClient.ProviderURL, client.ProviderURL)
}
