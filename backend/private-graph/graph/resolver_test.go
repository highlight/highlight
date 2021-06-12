package graph

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

var DB *gorm.DB

func createAndMigrateTestDB(dbName string) (*gorm.DB, error) {
	log.Println("host", os.Getenv("PSQL_HOST"))
	psqlConf := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s sslmode=disable",
		os.Getenv("PSQL_HOST"),
		os.Getenv("PSQL_PORT"),
		os.Getenv("PSQL_USER"),
		os.Getenv("PSQL_PASSWORD"))
	// Open the database object without an actual db_name.
	db, err := gorm.Open(postgres.Open(psqlConf))
	if err != nil {
		return nil, errors.Wrap(err, "error opening test db")
	}
	sqlDB, err := db.DB()
	if err != nil {
		return nil, errors.Wrap(err, "error retrieving test db")
	}
	defer sqlDB.Close()
	// Attempt to create the database.
	db.Exec(fmt.Sprintf("CREATE DATABASE %v;", dbName))
	return model.SetupDB(dbName)
}

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	var err error
	DB, err = createAndMigrateTestDB("highlight_testing_db")
	if err != nil {
		log.Errorf("error creating testdb: %v", err)
	}
	code := m.Run()
	os.Exit(code)
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
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.T},
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.F},
				{ActiveLength: 1000, OrganizationID: 1, Viewed: nil},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.T, FirstTime: &model.F},
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.F, FirstTime: &model.F},
				{ActiveLength: 1000, OrganizationID: 1, Viewed: nil, FirstTime: &model.F},
			},
		},
		"Hide viewed sessions": {hideViewed: &model.T, expectedCount: 2,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.T},
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.F},
				{ActiveLength: 1000, OrganizationID: 1, Viewed: nil},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.F, FirstTime: &model.F},
				{ActiveLength: 1000, OrganizationID: 1, Viewed: nil, FirstTime: &model.F},
			},
		},
		"Don't hide single viewed sessions": {hideViewed: &model.F, expectedCount: 1,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.T},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.T, FirstTime: &model.F},
			},
		},
		"Hide single viewed sessions": {hideViewed: &model.T, expectedCount: 0,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.T},
			},
			expectedSessions: []model.Session{},
		},
		"Don't hide single un-viewed sessions": {hideViewed: &model.F, expectedCount: 1,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.F},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.F, FirstTime: &model.F},
			},
		},
		"Hide single un-viewed sessions": {hideViewed: &model.T, expectedCount: 1,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.F},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.F, FirstTime: &model.F},
			},
		},
		"Don't hide single viewed=nil sessions": {hideViewed: &model.F, expectedCount: 1,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.F},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.F, FirstTime: &model.F},
			},
		},
		"Hide single viewed=nil sessions": {hideViewed: &model.T, expectedCount: 1,
			sessionsToInsert: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: nil},
			},
			expectedSessions: []model.Session{
				{ActiveLength: 1000, OrganizationID: 1, Viewed: nil, FirstTime: &model.F},
			},
		},
	}
	// run tests
	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			// inserting the data
			if err := DB.Create(&tc.sessionsToInsert).Error; err != nil {
				t.Fatalf("error inserting sessions: %v", err)
			}
			fieldsToInsert := []model.Field{
				{
					Type:           "session",
					OrganizationID: 1,
					Sessions:       tc.sessionsToInsert,
				},
			}
			if err := DB.Create(&fieldsToInsert).Error; err != nil {
				t.Fatalf("error inserting sessions: %v", err)
			}
			defer func(DB *gorm.DB, t *testing.T) {
				if err := DB.Exec("DELETE FROM sessions;").Error; err != nil {
					t.Fatalf("error deleting from sessions: %v", err)
				}
				if err := DB.Exec("DELETE FROM fields;").Error; err != nil {
					t.Fatalf("error deleting from fields: %v", err)
				}
				if err := DB.Exec("DELETE FROM session_fields;").Error; err != nil {
					t.Fatalf("error deleting from session_fields: %v", err)
				}
			}(DB, t)

			// test logic
			r := &queryResolver{Resolver: &Resolver{DB: DB}}
			params := &modelInputs.SearchParamsInput{HideViewed: tc.hideViewed}
			sessions, err := r.Sessions(context.Background(), 1, 3, modelInputs.SessionLifecycleAll, false, params)
			if err != nil {
				t.Fatalf("error querying sessions: %v", err)
			}
			if sessions.TotalCount != tc.expectedCount {
				t.Fatalf("received session count and expected session count not equal")
			}
			for i, s := range sessions.Sessions {
				isEqual, diff := s.Compare(tc.expectedSessions[i])
				if !isEqual {
					t.Fatalf("received session not equal to expected session. diff: %+v", diff)
				}
			}
		})
	}
}

func TestSessionsOther(t *testing.T) {
	log.Println("hillo")
}
