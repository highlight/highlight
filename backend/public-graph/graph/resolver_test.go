package graph

import (
	"encoding/json"
	"os"
	"strconv"
	"testing"
	"time"

	"github.com/go-test/deep"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	modelInput "github.com/highlight-run/highlight/backend/private-graph/graph/model"
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
	nullStr := "null"
	metaDataStr := `[{"timestamp":"2000-08-01T00:00:00Z","error_id":1,"session_id":0,"browser":"","os":"","visited_url":""},{"timestamp":"2000-08-01T00:00:00Z","error_id":2,"session_id":0,"browser":"","os":"","visited_url":""}]`
	longTraceStr := `[{"functionName":"is","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null},{"functionName":"longer","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null},{"functionName":"trace","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null}]`
	shortTraceStr := `[{"functionName":"a","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null},{"functionName":"short","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null}]`
	tests := map[string]struct {
		errorsToInsert      []model.ErrorObject
		expectedErrorGroups []model.ErrorGroup
	}{
		"test two errors with same environment but different case": {
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
					StackTrace:     nullStr,
					State:          model.ErrorGroupStates.OPEN,
					MetadataLog:    &metaDataStr,
					FieldGroup:     &nullStr,
					Environments:   `{"dev":2}`,
				},
			},
		},
		"test two errors with different environment": {
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
					StackTrace:     nullStr,
					State:          model.ErrorGroupStates.OPEN,
					MetadataLog:    &metaDataStr,
					FieldGroup:     &nullStr,
					Environments:   `{"dev":1,"prod":1}`,
				},
			},
		},
		"two errors, one with empty environment": {
			errorsToInsert: []model.ErrorObject{
				{
					OrganizationID: 1,
					Environment:    "dev",
					Model:          model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
				},
				{
					OrganizationID: 1,
					Model:          model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					OrganizationID: 1,
					StackTrace:     nullStr,
					State:          model.ErrorGroupStates.OPEN,
					MetadataLog:    &metaDataStr,
					FieldGroup:     &nullStr,
					Environments:   `{"dev":1}`,
				},
			},
		},
		"test longer error stack first": {
			errorsToInsert: []model.ErrorObject{
				{
					OrganizationID: 1,
					Model:          model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
					StackTrace:     &longTraceStr,
				},
				{
					OrganizationID: 1,
					Model:          model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
					StackTrace:     &shortTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					OrganizationID:   1,
					StackTrace:       shortTraceStr,
					State:            model.ErrorGroupStates.OPEN,
					MetadataLog:      &metaDataStr,
					FieldGroup:       &nullStr,
					Environments:     `{}`,
					MappedStackTrace: util.MakeStringPointer("null"),
				},
			},
		},
		"test shorter error stack first": {
			errorsToInsert: []model.ErrorObject{
				{
					OrganizationID: 1,
					Model:          model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
					StackTrace:     &shortTraceStr,
				},
				{
					OrganizationID: 1,
					Model:          model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
					StackTrace:     &longTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					OrganizationID:   1,
					StackTrace:       longTraceStr,
					MetadataLog:      &metaDataStr,
					FieldGroup:       &nullStr,
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
				errorGroup, err := r.HandleErrorAndGroup(&errorObj, &publicModelInput.ErrorObjectInput{StackTrace: frames}, nil, 1)
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

func TestEnhanceStackTrace(t *testing.T) {
	// construct table of sub-tests to run
	tests := map[string]struct {
		stackFrameInput     []*publicModelInput.StackFrameInput
		expectedErrorObject model.ErrorObject
		expectedStackTrace  []modelInput.ErrorTrace
		fetcher             fetcher
		err                 error
	}{
		"test source mapping with proper stack trace": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     util.MakeStringPointer("./test-files/lodash.min.js"),
					LineNumber:   util.MakeIntPointer(1),
					ColumnNumber: util.MakeIntPointer(813),
				},
				{
					FileName:     util.MakeStringPointer("./test-files/lodash.min.js"),
					LineNumber:   util.MakeIntPointer(1),
					ColumnNumber: util.MakeIntPointer(799),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     util.MakeStringPointer("lodash.js"),
					LineNumber:   util.MakeIntPointer(634),
					ColumnNumber: util.MakeIntPointer(4),
					FunctionName: util.MakeStringPointer("arrayIncludesWith"),
				},
				{
					FileName:     util.MakeStringPointer("lodash.js"),
					LineNumber:   util.MakeIntPointer(633),
					ColumnNumber: util.MakeIntPointer(11),
					FunctionName: util.MakeStringPointer("arrayIncludesWith"),
				},
			},
			fetcher: DiskFetcher{},
			err:     e.New(""),
		},
		"test source mapping with proper stack trace with network fetcher": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js"),
					LineNumber:   util.MakeIntPointer(1),
					ColumnNumber: util.MakeIntPointer(813),
				},
				{
					FileName:     util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js"),
					LineNumber:   util.MakeIntPointer(1),
					ColumnNumber: util.MakeIntPointer(799),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js"),
					LineNumber:   util.MakeIntPointer(634),
					ColumnNumber: util.MakeIntPointer(4),
					FunctionName: util.MakeStringPointer("arrayIncludesWith"),
				},
				{
					FileName:     util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js"),
					LineNumber:   util.MakeIntPointer(633),
					ColumnNumber: util.MakeIntPointer(11),
					FunctionName: util.MakeStringPointer("arrayIncludesWith"),
				},
			},
			fetcher: NetworkFetcher{},
			err:     e.New(""),
		},
		"test source mapping invalid trace:no related source map": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     util.MakeStringPointer("./test-files/lodash.js"),
					LineNumber:   util.MakeIntPointer(0),
					ColumnNumber: util.MakeIntPointer(0),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     util.MakeStringPointer("./test-files/lodash.js"),
					LineNumber:   util.MakeIntPointer(0),
					ColumnNumber: util.MakeIntPointer(0),
					Error:        util.MakeStringPointer("file does not contain source map url: ./test-files/lodash.js"),
				},
			},
			fetcher: DiskFetcher{},
			err:     e.New(""),
		},
		"test source mapping invalid trace:file doesn't exist": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js"),
					LineNumber:   util.MakeIntPointer(0),
					ColumnNumber: util.MakeIntPointer(0),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js"),
					LineNumber:   util.MakeIntPointer(0),
					ColumnNumber: util.MakeIntPointer(0),
					Error:        util.MakeStringPointer("error fetching file: https://cdnjs.cloudflare.com/ajax/libs/lodash.js: status code not OK"),
				},
			},
			fetcher: NetworkFetcher{},
			err:     e.New(""),
		},
		"test source mapping invalid trace:filename is not a url": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     util.MakeStringPointer("/file/local/domain.js"),
					LineNumber:   util.MakeIntPointer(0),
					ColumnNumber: util.MakeIntPointer(0),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     util.MakeStringPointer("/file/local/domain.js"),
					LineNumber:   util.MakeIntPointer(0),
					ColumnNumber: util.MakeIntPointer(0),
					Error:        util.MakeStringPointer(`error fetching file: /file/local/domain.js: error getting source file: Get "/file/local/domain.js": unsupported protocol scheme ""`),
				},
			},
			fetcher: NetworkFetcher{},
			err:     e.New(""),
		},
		"test source mapping invalid trace:trace is nil": {
			stackFrameInput:    nil,
			expectedStackTrace: nil,
			fetcher:            DiskFetcher{},
			err:                e.New("stack trace input cannot be nil"),
		},
		"test source mapping invalid trace:empty stack frame doesn't update error object": {
			stackFrameInput:    []*publicModelInput.StackFrameInput{},
			expectedStackTrace: nil,
			fetcher:            DiskFetcher{},
			err:                e.New(""),
		},
		"test tsx mapping": {
			stackFrameInput: []*publicModelInput.StackFrameInput{
				{
					FileName:     util.MakeStringPointer("./test-files/main.8344d167.chunk.js"),
					LineNumber:   util.MakeIntPointer(1),
					ColumnNumber: util.MakeIntPointer(422367),
				},
			},
			expectedStackTrace: []modelInput.ErrorTrace{
				{
					FileName:     util.MakeStringPointer("pages/Buttons/Buttons.tsx"),
					LineNumber:   util.MakeIntPointer(13),
					ColumnNumber: util.MakeIntPointer(30),
					FunctionName: util.MakeStringPointer(""),
				},
			},
			fetcher: DiskFetcher{},
			err:     e.New(""),
		},
	}

	storageClient, err := storage.NewStorageClient()
	if err != nil {
		t.Fatalf("error creating storage client: %v", err)
	}
	r := Resolver{
		DB:            DB,
		StorageClient: storageClient,
	}

	// run tests
	for name, tc := range tests {
		util.RunTestWithDBWipe(t, name, DB, func(t *testing.T) {
			fetch = tc.fetcher
			mappedStackTrace, err := r.EnhanceStackTrace(tc.stackFrameInput, 1, 1)
			if err != nil {
				if err.Error() == tc.err.Error() {
					return
				}
				t.Error(e.Wrap(err, "error setting source map elements"))
			}
			diff := deep.Equal(&mappedStackTrace, &tc.expectedStackTrace)
			if len(diff) > 0 {
				t.Error(e.Errorf("publicModelInput. not equal: %+v", diff))
			}
		})
	}
}
