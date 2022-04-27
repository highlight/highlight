package graph

import (
	"context"
	"fmt"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"
	"os"
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
)

var DB *gorm.DB

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	dbName := "highlight_testing_db"
	testLogger := log.WithFields(log.Fields{"DB_HOST": os.Getenv("PSQL_HOST"), "DB_NAME": dbName})
	var err error
	DB, err = util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}
	code := m.Run()
	os.Exit(code)
}

func validateSessionResult(actual model.Session, expected model.Session) error {
	if actual.ActiveLength != expected.ActiveLength {
		return e.New(fmt.Sprintf("Actual ActiveLength %d doesn't match expected ActiveLength %d", actual.ActiveLength, expected.ActiveLength))
	}
	if actual.ProjectID != expected.ProjectID {
		return e.New(fmt.Sprintf("Actual ProjectID %d doesn't match expected ProjectID %d", actual.ProjectID, expected.ProjectID))
	}
	if actual.Viewed != expected.Viewed && *actual.Viewed != *expected.Viewed {
		return e.New(fmt.Sprintf("Actual Viewed %t doesn't match expected Viewed %t", *actual.Viewed, *expected.Viewed))
	}
	if actual.FirstTime != expected.FirstTime && *actual.FirstTime != *expected.FirstTime {
		return e.New(fmt.Sprintf("Actual FirstTime %t doesn't match expected FirstTime %t", *actual.FirstTime, *expected.FirstTime))
	}
	return nil
}

func TestHideViewedSessions(t *testing.T) {
	// construct table of sub-tests to run
	tests := map[string]struct {
		hideViewed       *bool // hide viewed?
		expectedCount    int64
		expectedSessions []model.Session
		sessionsToInsert []model.Session
	}{
		"Don't hide viewed sessions": {hideViewed: &model.F, expectedCount: 3,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.T},
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.F},
				{ActiveLength: 1000, ProjectID: 1, Viewed: nil},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.T, FirstTime: &model.F},
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.F, FirstTime: &model.F},
				{ActiveLength: 1000, ProjectID: 1, Viewed: nil, FirstTime: &model.F},
			},
		},
		"Hide viewed sessions": {hideViewed: &model.T, expectedCount: 2,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.T},
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.F},
				{ActiveLength: 1000, ProjectID: 1, Viewed: nil},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.F, FirstTime: &model.F},
				{ActiveLength: 1000, ProjectID: 1, Viewed: nil, FirstTime: &model.F},
			},
		},
		"Don't hide single viewed sessions": {hideViewed: &model.F, expectedCount: 1,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.T},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.T, FirstTime: &model.F},
			},
		},
		"Hide single viewed sessions": {hideViewed: &model.T, expectedCount: 0,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.T},
			},
			expectedSessions: []model.Session{},
		},
		"Don't hide single un-viewed sessions": {hideViewed: &model.F, expectedCount: 1,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.F},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.F, FirstTime: &model.F},
			},
		},
		"Hide single un-viewed sessions": {hideViewed: &model.T, expectedCount: 1,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.F},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.F, FirstTime: &model.F},
			},
		},
		"Don't hide single viewed=nil sessions": {hideViewed: &model.F, expectedCount: 1,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.F},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: &model.F, FirstTime: &model.F},
			},
		},
		"Hide single viewed=nil sessions": {hideViewed: &model.T, expectedCount: 1,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: nil},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, ProjectID: 1, Viewed: nil, FirstTime: &model.F},
			},
		},
	}
	// run tests
	for name, tc := range tests {
		util.RunTestWithDBWipe(t, name, DB, func(t *testing.T) {
			// inserting the data
			if err := DB.Create(&tc.sessionsToInsert).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting sessions"))
			}
			fieldsToInsert := []model.Field{
				{
					Type:      "session",
					ProjectID: 1,
					Sessions:  tc.sessionsToInsert,
				},
			}
			if err := DB.Create(&fieldsToInsert).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting sessions"))
			}

			// test logic
			r := &queryResolver{Resolver: &Resolver{DB: DB}}
			params := &modelInputs.SearchParamsInput{HideViewed: tc.hideViewed}
			sessions, err := r.Sessions(context.Background(), 1, 3, modelInputs.SessionLifecycleAll, false, params)
			if err != nil {
				t.Fatal(e.Wrap(err, "error querying sessions"))
			}
			if sessions.TotalCount != tc.expectedCount {
				t.Fatal("received session count and expected session count not equal")
			}
			for i, s := range sessions.Sessions {
				err = validateSessionResult(s, tc.expectedSessions[i])
				if err != nil {
					t.Fatal(e.Wrap(err, "error matching actual and expected session"))
				}
			}
		})
	}
}

func TestResolver_GetSessionChunk(t *testing.T) {
	timestamps := []int64{
		1650666776139,
		1650666799399,
		1650666809450,
		1650667660054,
		1650667900790,
		1650668142399,
		1650668382573,
	}
	util.RunTestWithDBWipe(t, "Test Chunk", DB, func(t *testing.T) {
		// inserting the data
		sessionsToInsert := []model.Session{
			{ActiveLength: 1000, ProjectID: 1, Viewed: nil},
		}
		if err := DB.Create(&sessionsToInsert).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting sessions"))
		}
		chunksToInsert := []model.EventChunk{}
		for idx, ts := range timestamps {
			chunksToInsert = append(chunksToInsert, model.EventChunk{
				SessionID:  sessionsToInsert[0].ID,
				ChunkIndex: idx,
				Timestamp:  ts,
			})
		}
		if err := DB.Create(&chunksToInsert).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting sessions"))
		}

		// test logic
		r := &queryResolver{Resolver: &Resolver{DB: DB}}
		chunkIdx, chunkTs := r.GetSessionChunk(sessionsToInsert[0].ID, 1092307)
		if chunkIdx != 3 {
			t.Fatalf("received incorrect chunk idx %d", chunkIdx)
		}
		if chunkTs != 208392 {
			t.Fatalf("received incorrect chunk ts %d", chunkTs)
		}
	})
}
