package clickhouse

import (
	"context"
	"fmt"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/openlyinc/pointy"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/queryparser"

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
		PrivacySetting:                 new(string),
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

func Test_SessionMatchesQuery(t *testing.T) {
	session := model.Session{}
	filters := queryparser.Parse("environment:prod* user_email:*@highlight.io custom_email:bar@highlight.io session_visited-url:example.com user_age:123 service_name:all custom_created_at:when")
	matches := SessionMatchesQuery(&session, &filters)
	assert.False(t, matches)

	session = model.Session{
		ServiceName: "all",
		Environment: "production",
		Fields: []*model.Field{
			{
				Type:  "user",
				Name:  "email",
				Value: "vadim@highlight.io",
			},
			{
				Type:  "custom",
				Name:  "email",
				Value: "bar@highlight.io",
			},
			{
				Type:  "custom",
				Name:  "created_at",
				Value: "when",
			},
			{
				Type:  "session",
				Name:  "visited-url",
				Value: "example.com",
			},
			{
				Type:  "user",
				Name:  "age",
				Value: "123",
			},
		},
	}
	matches = SessionMatchesQuery(&session, &filters)
	assert.True(t, matches)

	filters = queryparser.Parse("environment:development email:*@highlight.io age:123 service_name:all")
	matches = SessionMatchesQuery(&session, &filters)
	assert.False(t, matches)

	filters = queryparser.Parse("environment:*prod* user_email:vadim@highlight.io")
	matches = SessionMatchesQuery(&session, &filters)
	assert.True(t, matches)

	filters = queryparser.Parse("environment:*prod* user_email:bar@highlight.io")
	matches = SessionMatchesQuery(&session, &filters)
	assert.False(t, matches)
}

func Test_QuerySessionIds(t *testing.T) {
	ctx := context.Background()

	dbName := "highlight_testing_db"
	DB, err := util.CreateAndMigrateTestDB(dbName)
	assert.NoError(t, err)

	client, teardown := setupSessionsTest(t)
	defer teardown(t)

	s1 := &model.Session{
		Model: model.Model{
			CreatedAt: time.Now(),
		},
		ViewedByAdmins: []model.Admin{},
		Fields: []*model.Field{
			{
				Int64Model: model.Int64Model{
					CreatedAt: time.Now(),
				},
				Type:      "session",
				Name:      "environment",
				Value:     "production",
				ProjectID: 1,
			},
		},
		Environment: "production",
		SecureID:    "abc123",
		ProjectID:   1,
	}
	s2 := &model.Session{
		Model: model.Model{
			CreatedAt: time.Now(),
		},
		ViewedByAdmins: []model.Admin{},
		Fields: []*model.Field{
			{
				Int64Model: model.Int64Model{
					CreatedAt: time.Now(),
				},
				Type:      "session",
				Name:      "environment",
				Value:     "dev",
				ProjectID: 1,
			},
		},
		Environment: "dev",
		SecureID:    "abc124",
		ProjectID:   1,
	}
	s3 := &model.Session{
		Model: model.Model{
			CreatedAt: time.Now(),
		},
		ViewedByAdmins: []model.Admin{},
		Fields: []*model.Field{
			{
				Int64Model: model.Int64Model{
					CreatedAt: time.Now(),
				},
				Type:      "session",
				Name:      "environment",
				Value:     "production",
				ProjectID: 1,
			},
		},
		Environment: "production",
		SecureID:    "abc125",
		ProjectID:   1,
	}
	assert.NoError(t, DB.Create(s1).Error)
	assert.NoError(t, DB.Create(s2).Error)
	assert.NoError(t, DB.Create(s3).Error)
	assert.NoError(t, client.WriteSessions(ctx, []*model.Session{s1, s2, s3}))

	for name, tc := range map[string]struct {
		Query modelInputs.ClickhouseQuery
	}{
		"default": {
			Query: modelInputs.ClickhouseQuery{
				IsAnd: true,
				Rules: [][]string{
					{"session_environment", "is", "production"},
					{"custom_created_at", "between_date", fmt.Sprintf("%s.000Z_%s.000Z", s1.CreatedAt.UTC().Add(-time.Hour).Format(time.RFC3339)[:19], s1.CreatedAt.UTC().Add(time.Hour).Format(time.RFC3339)[:19])},
					{"custom_sample", "matches", "281cce18b609606b"},
				},
			},
		},
		"max hex": {
			Query: modelInputs.ClickhouseQuery{
				IsAnd: true,
				Rules: [][]string{
					{"custom_sample", "matches", "FFFFFFFFFFFFFFFF"},
				},
			},
		},
	} {
		t.Run(name, func(t *testing.T) {
			ids, total, sampleRuleFound, err := client.QuerySessionIds(ctx, nil, 1, 10, tc.Query, "CreatedAt DESC, ID DESC", pointy.Int(1), time.Now().Add(-time.Hour))
			assert.NoError(t, err)
			assert.True(t, sampleRuleFound)
			assert.Greater(t, total, int64(0))
			assert.Greater(t, len(ids), 0)
		})
	}
}
