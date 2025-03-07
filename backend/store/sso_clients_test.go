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

	_, err := store.GetSSOClients(ctx)
	assert.Error(t, err)

	client := model.SSOClient{
		Domain: "example.com",
	}
	store.DB.Create(&client)

	foundClient, err := store.GetSSOClients(ctx)
	assert.NoError(t, err)
	assert.Equal(t, foundClient.Domain, client.Domain)
	assert.Equal(t, foundClient.ClientID, client.ClientID)
	assert.Equal(t, foundClient.ClientSecret, client.ClientSecret)
	assert.Equal(t, foundClient.RedirectURL, client.RedirectURL)
}
