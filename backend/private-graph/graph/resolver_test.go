package graph

import (
	"context"
	"os"
	"testing"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

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
				t.Fatal(e.Wrap(err, "error inserting sessions"))
			}
			fieldsToInsert := []model.Field{
				{
					Type:           "session",
					OrganizationID: 1,
					Sessions:       tc.sessionsToInsert,
				},
			}
			if err := DB.Create(&fieldsToInsert).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting sessions"))
			}
			defer func(db *gorm.DB) {
				err := util.ClearTablesInDB(db)
				if err != nil {
					t.Fatal(e.Wrap(err, "error clearing database"))
				}
			}(DB)

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
				isEqual, diff, err := model.AreModelsWeaklyEqual(&s, &tc.expectedSessions[i])
				if err != nil {
					t.Fatal(e.Wrap(err, "error comparing two sessions"))
				}
				if !isEqual {
					t.Fatalf("received session not equal to expected session. diff: %+v", diff)
				}
			}
		})
	}
}

// uncomment this once I have a common handler for isAdminInOrg()
//func TestErrorGroups(t *testing.T) {
//	// construct table of sub-tests to run
//	startDate := time.Date(2021, 4, 19, 21, 0, 0, 0, time.UTC)
//	endDate := time.Date(2021, 4, 20, 10, 0, 0, 0, time.UTC)
//	tests := map[string]struct {
//		errorObjectsToInsert []model.ErrorObject
//		errorGroupsToInsert  []model.ErrorGroup
//		params               *modelInputs.ErrorSearchParamsInput
//		expectedCount        int64
//		expectedErrorGroups  []model.ErrorGroup
//		expectedError        error
//	}{
//		"get error groups with date range": {
//			params: &modelInputs.ErrorSearchParamsInput{
//				DateRange: &modelInputs.DateRangeInput{
//					StartDate: &startDate,
//					EndDate:   &endDate,
//				},
//			},
//			errorGroupsToInsert: []model.ErrorGroup{
//				{
//					Model:          model.Model{ID: 1},
//					OrganizationID: 1,
//				},
//				{
//					Model:          model.Model{ID: 2},
//					OrganizationID: 1,
//				},
//			},
//			expectedErrorGroups: []model.ErrorGroup{
//				{
//					State:          model.ErrorGroupStates.OPEN,
//					Model:          model.Model{ID: 2},
//					OrganizationID: 1,
//				},
//			},
//			errorObjectsToInsert: []model.ErrorObject{
//				{
//					Model: model.Model{
//						ID:        1,
//						CreatedAt: startDate.Add(2 * time.Hour),
//					},
//					OrganizationID: 1,
//					ErrorGroupID:   2,
//				},
//				{
//					Model: model.Model{
//						ID:        2,
//						CreatedAt: startDate.Add(-2 * time.Hour),
//					},
//					OrganizationID: 1,
//					ErrorGroupID:   2,
//				},
//				{
//					Model: model.Model{
//						ID:        3,
//						CreatedAt: endDate.Add(2 * time.Hour),
//					},
//					OrganizationID: 1,
//					ErrorGroupID:   2,
//				},
//				{
//					Model: model.Model{
//						ID:        4,
//						CreatedAt: endDate.Add(-2 * time.Hour),
//					},
//					OrganizationID: 1,
//					ErrorGroupID:   2,
//				},
//			},
//			expectedCount: 1,
//		},
//	}
//	// run tests
//	for name, tc := range tests {
//		t.Run(name, func(t *testing.T) {
//			// inserting the data
//			if err := DB.Create(&tc.errorObjectsToInsert).Error; err != nil {
//				t.Fatal(e.Wrap(err, "error inserting error objects"))
//			}
//			if err := DB.Create(&tc.errorGroupsToInsert).Error; err != nil {
//				t.Fatal(e.Wrap(err, "error inserting error groups"))
//			}
//			defer func(db *gorm.DB) {
//				err := util.ClearTablesInDB(db)
//				if err != nil {
//					t.Fatal(e.Wrap(err, "error clearing database"))
//				}
//			}(DB)
//
//			// test logic
//			r := &queryResolver{Resolver: &Resolver{DB: DB}}
//			errorGroups, err := r.ErrorGroups(context.Background(), 1, 10, tc.params)
//			t.Logf("error groups count: %d ||||| error groups: %+v", errorGroups.TotalCount, errorGroups.ErrorGroups)
//			if err != nil {
//				t.Fatal(e.Wrap(err, "error querying errorGroups"))
//			}
//			if errorGroups.TotalCount != tc.expectedCount {
//				t.Fatal("received error group count and expected error group count not equal")
//			}
//			for i, errorGroup := range errorGroups.ErrorGroups {
//				isEqual, diff, err := model.AreModelsWeaklyEqual(&errorGroup, &tc.expectedErrorGroups[i])
//				if err != nil {
//					t.Fatal(e.Wrap(err, "error comparing two error groups"))
//				}
//				if !isEqual {
//					t.Fatalf("received error group not equal to expected error group. diff: %+v", diff)
//				}
//			}
//		})
//	}
//}
//
