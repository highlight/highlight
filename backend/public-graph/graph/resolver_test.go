package graph

import (
	"encoding/json"
	"os"
	"strconv"
	"testing"
	"time"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	publicModelInput "github.com/highlight-run/highlight/backend/public-graph/graph/model"
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
	longTraceStr := `[{"functionName":"is","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null},{"functionName":"longer","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null},{"functionName":"trace","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null}]`
	shortTraceStr := `[{"functionName":"a","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null},{"functionName":"short","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null}]`
	tests := map[string]struct {
		errorsToInsert      []model.ErrorObject
		expectedErrorGroups []model.ErrorGroup
	}{
		"test two errors with same environment but different case": {
			errorsToInsert: []model.ErrorObject{
				{
					Event:       "error",
					ProjectID:   1,
					Environment: "dev",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
				},
				{
					Event:       "error",
					ProjectID:   1,
					Environment: "dEv",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:        "error",
					ProjectID:    1,
					State:        model.ErrorGroupStates.OPEN,
					Environments: `{"dev":2}`,
				},
			},
		},
		"test two errors with different environment": {
			errorsToInsert: []model.ErrorObject{
				{
					Event:       "error",
					ProjectID:   1,
					Environment: "dev",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
				},
				{
					Event:       "error",
					ProjectID:   1,
					Environment: "prod",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:        "error",
					ProjectID:    1,
					State:        model.ErrorGroupStates.OPEN,
					Environments: `{"dev":1,"prod":1}`,
				},
			},
		},
		"two errors, one with empty environment": {
			errorsToInsert: []model.ErrorObject{
				{
					ProjectID:   1,
					Environment: "dev",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
					Event:       "error",
				},
				{
					Event:     "error",
					ProjectID: 1,
					Model:     model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:        "error",
					ProjectID:    1,
					State:        model.ErrorGroupStates.OPEN,
					Environments: `{"dev":1}`,
				},
			},
		},
		"test longer error stack first": {
			errorsToInsert: []model.ErrorObject{
				{
					Event:      "error",
					ProjectID:  1,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
					StackTrace: &longTraceStr,
				},
				{
					Event:      "error",
					ProjectID:  1,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
					StackTrace: &shortTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:            "error",
					ProjectID:        1,
					StackTrace:       shortTraceStr,
					State:            model.ErrorGroupStates.OPEN,
					Environments:     `{}`,
					MappedStackTrace: util.MakeStringPointer("null"),
				},
			},
		},
		"test shorter error stack first": {
			errorsToInsert: []model.ErrorObject{
				{
					Event:      "error",
					ProjectID:  1,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
					StackTrace: &shortTraceStr,
				},
				{
					Event:      "error",
					ProjectID:  1,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
					StackTrace: &longTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:            "error",
					ProjectID:        1,
					StackTrace:       longTraceStr,
					Environments:     `{}`,
					State:            model.ErrorGroupStates.OPEN,
					MappedStackTrace: util.MakeStringPointer("null"),
				},
			},
		},
	}
	// run tests
	for name, tc := range tests {
		util.RunTestWithDBWipe(t, name, DB, func(t *testing.T) {
			r := &Resolver{DB: DB}
			receivedErrorGroups := make(map[string]model.ErrorGroup)
			for _, errorObj := range tc.errorsToInsert {
				var frames []*publicModelInput.StackFrameInput
				if errorObj.StackTrace != nil {
					if err := json.Unmarshal([]byte(*errorObj.StackTrace), &frames); err != nil {
						t.Fatal(e.Wrap(err, "error unmarshalling error stack trace frames"))
					}
				}
				errorGroup, err := r.HandleErrorAndGroup(&errorObj, "", frames, nil, 1)
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
