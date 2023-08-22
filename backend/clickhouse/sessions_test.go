package clickhouse

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/stretchr/testify/assert"
)

func setupSessionsTest(tb testing.TB) (*Client, func(tb testing.TB)) {
	client, _ := NewClient(TestDatabase)

	return client, func(tb testing.TB) {
		err := client.conn.Exec(context.Background(), fmt.Sprintf("TRUNCATE TABLE %s", SessionsTable))
		assert.NoError(tb, err)
		err = client.conn.Exec(context.Background(), fmt.Sprintf("TRUNCATE TABLE %s", FieldsTable))
		assert.NoError(tb, err)
	}
}

func TestWriteSession(t *testing.T) {
	ctx := context.Background()
	client, teardown := setupSessionsTest(t)
	defer teardown(t)

	assert.Error(t, client.WriteSessions(ctx, []*model.Session{{}}))
	assert.NoError(t, client.WriteSessions(ctx, []*model.Session{{
		Model: model.Model{
			ID:        0,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		SecureID:                       "",
		ClientID:                       "",
		Identified:                     false,
		Fingerprint:                    0,
		Identifier:                     "",
		OrganizationID:                 0,
		ProjectID:                      0,
		Email:                          new(string),
		IP:                             "",
		City:                           "",
		State:                          "",
		Postal:                         "",
		Country:                        "",
		Latitude:                       0,
		Longitude:                      0,
		OSName:                         "",
		OSVersion:                      "",
		BrowserName:                    "",
		BrowserVersion:                 "",
		Language:                       "",
		HasUnloaded:                    false,
		Processed:                      new(bool),
		HasRageClicks:                  new(bool),
		HasErrors:                      new(bool),
		HasOutOfOrderEvents:            false,
		Length:                         0,
		ActiveLength:                   0,
		Fields:                         []*model.Field{},
		Environment:                    "",
		AppVersion:                     new(string),
		UserObject:                     map[string]interface{}{},
		UserProperties:                 "",
		FirstTime:                      new(bool),
		LastUserInteractionTime:        time.Now(),
		Viewed:                         new(bool),
		Starred:                        new(bool),
		FieldGroup:                     new(string),
		EnableStrictPrivacy:            new(bool),
		EnableRecordingNetworkContents: new(bool),
		ClientVersion:                  "",
		FirstloadVersion:               "",
		ClientConfig:                   new(string),
		WithinBillingQuota:             new(bool),
		IsPublic:                       false,
		EventCounts:                    new(string),
		PagesVisited:                   0,
		ObjectStorageEnabled:           new(bool),
		DirectDownloadEnabled:          false,
		AllObjectsCompressed:           false,
		PayloadSize:                    new(int64),
		VerboseID:                      "",
		Excluded:                       false,
		ExcludedReason:                 nil,
		RetryCount:                     0,
		ViewedByAdmins:                 []model.Admin{},
		Chunked:                        new(bool),
		ProcessWithRedis:               false,
		AvoidPostgresStorage:           false,
		Normalness:                     new(float64),
	}}))
}
