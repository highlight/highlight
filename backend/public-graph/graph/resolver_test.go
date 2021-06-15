package graph

import (
	"os"
	"strconv"
	"testing"
	"time"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
)

var DB *gorm.DB

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	dbName := "highlight_testing_db"
	testLogger := log.WithFields(log.Fields{"DB_HOST": os.Getenv("PSQL_HOST"), "DB_NAME": dbName})
	var err error
	DB, err = util.CreateAndMigrateTestDB("highlight_testing_db")
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}
	code := m.Run()
	os.Exit(code)
}

func TestHandleErrorAndGroup(t *testing.T) {
	// construct table of sub-tests to run
	nullStr := "null"
	metaDataStr := `[{"timestamp":"2000-08-01T00:00:00Z","error_id":1,"session_id":0,"browser":"","os":"","visited_url":""},{"timestamp":"2000-08-01T00:00:00Z","error_id":2,"session_id":0,"browser":"","os":"","visited_url":""}]`
	tests := map[string]struct {
		errorsToInsert      []model.ErrorObject
		expectedErrorGroups []model.ErrorGroup
	}{
		"two errors with same environment but different case": {
			errorsToInsert: []model.ErrorObject{
				{
					OrganizationID: 1,
					Environment:    "dev",
					Model:          model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
				},
				{
					OrganizationID: 1,
					Environment:    "dEv",
					Model:          model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					OrganizationID: 1,
					Trace:          nullStr,
					Resolved:       &model.F,
					MetadataLog:    &metaDataStr,
					FieldGroup:     &nullStr,
					Environments:   `{"dev":2}`,
				},
			},
		},
		"two errors with diff environment": {
			errorsToInsert: []model.ErrorObject{
				{
					OrganizationID: 1,
					Environment:    "dev",
					Model:          model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
				},
				{
					OrganizationID: 1,
					Environment:    "prod",
					Model:          model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					OrganizationID: 1,
					Trace:          nullStr,
					Resolved:       &model.F,
					MetadataLog:    &metaDataStr,
					FieldGroup:     &nullStr,
					Environments:   `{"dev":1,"prod":1}`,
				},
			},
		},
	}
	// run tests
	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			defer func(db *gorm.DB) {
				err := util.ClearTablesInDB(db)
				if err != nil {
					t.Fatal(e.Wrap(err, "error clearing database"))
				}
			}(DB)
			// test logic
			r := &Resolver{DB: DB}
			receivedErrorGroups := make(map[string]model.ErrorGroup)
			for _, errorObj := range tc.errorsToInsert {
				errorGroup, err := r.HandleErrorAndGroup(&errorObj, nil, nil)
				if err != nil {
					t.Fatal(e.Wrap(err, "error handling error and group"))
				}
				if errorGroup != nil {
					id := strconv.Itoa(errorGroup.ID)
					receivedErrorGroups[id] = *errorGroup
				}
			}
			var i int
			for _, errorGroup := range receivedErrorGroups {
				isEqual, diff, err := model.AreModelsWeaklyEqual(&errorGroup, &tc.expectedErrorGroups[i])
				if err != nil {
					t.Fatal(e.Wrap(err, "error comparing two error groups"))
				}
				if !isEqual {
					t.Fatalf("received error group not equal to expected error group. diff: %+v", diff)
				}
				i++
			}
		})
	}
}
