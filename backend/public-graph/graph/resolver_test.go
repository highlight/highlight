package graph

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	modelInput "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	publicModelInput "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
)

var DB *gorm.DB

type mockFetcher struct{}

func (n mockFetcher) fetchFile(href string) ([]byte, *string, error) {
	inputBytes, err := ioutil.ReadFile(href)
	if err != nil {
		return nil, nil, e.Wrap(err, "error fetching file from disk")
	}
	filename := href[strings.LastIndex(href, "/"):]
	return inputBytes, &filename, nil
}

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
					Trace:          nullStr,
					Resolved:       &model.F,
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
					Trace:          nullStr,
					Resolved:       &model.F,
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
					Trace:          nullStr,
					Resolved:       &model.F,
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
					Trace:          &longTraceStr,
				},
				{
					OrganizationID: 1,
					Model:          model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
					Trace:          &shortTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					OrganizationID: 1,
					Trace:          longTraceStr,
					Resolved:       &model.F,
					State:          model.ErrorGroupStates.OPEN,
					MetadataLog:    &metaDataStr,
					FieldGroup:     &nullStr,
					Environments:   `{}`,
				},
			},
		},
		"test shorter error stack first": {
			errorsToInsert: []model.ErrorObject{
				{
					OrganizationID: 1,
					Model:          model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
					Trace:          &shortTraceStr,
				},
				{
					OrganizationID: 1,
					Model:          model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
					Trace:          &longTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					OrganizationID: 1,
					Trace:          longTraceStr,
					Resolved:       &model.F,
					MetadataLog:    &metaDataStr,
					FieldGroup:     &nullStr,
					Environments:   `{}`,
					State:          model.ErrorGroupStates.OPEN,
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
				var frames []*publicModelInput.StackFrameInput
				if errorObj.Trace != nil {
					if err := json.Unmarshal([]byte(*errorObj.Trace), &frames); err != nil {
						t.Fatal(e.Wrap(err, "error unmarshalling error stack trace frames"))
					}
				}
				errorGroup, _, err := r.HandleErrorAndGroup(&errorObj, frames, nil)
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

func TestSetSourceMapElements(t *testing.T) {
	// construct table of sub-tests to run
	tests := map[string]struct {
		errorObjectInput    publicModelInput.ErrorObjectInput
		expectedErrorObject model.ErrorObject
		fetcher             fetcher
		err                 error
	}{
		"test source mapping with proper stack trace": {
			errorObjectInput: publicModelInput.ErrorObjectInput{
				Trace: []*publicModelInput.StackFrameInput{
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
			},
			expectedErrorObject: model.ErrorObject{
				MappedStackTrace: util.MakeStringPointerFromInterface(
					[]modelInput.ErrorTrace{
						{
							FileName:     util.MakeStringPointer("lodash.js"),
							LineNumber:   util.MakeIntPointer(634),
							ColumnNumber: util.MakeIntPointer(4),
							FunctionName: util.MakeStringPointer(""),
						},
						{
							FileName:     util.MakeStringPointer("lodash.js"),
							LineNumber:   util.MakeIntPointer(633),
							ColumnNumber: util.MakeIntPointer(11),
							FunctionName: util.MakeStringPointer("arrayIncludesWith"),
						},
					},
				),
			},
			fetcher: mockFetcher{},
			err:     e.New(""),
		},
		"test source mapping invalid trace:no related source map": {
			errorObjectInput: publicModelInput.ErrorObjectInput{
				Trace: []*publicModelInput.StackFrameInput{
					{
						FileName:     util.MakeStringPointer("./test-files/lodash.js"),
						LineNumber:   util.MakeIntPointer(0),
						ColumnNumber: util.MakeIntPointer(0),
					},
				},
			},
			expectedErrorObject: model.ErrorObject{},
			fetcher:             mockFetcher{},
			err:                 e.New("file does not contain source map url"),
		},
		"test source mapping invalid trace:file doesn't exist": {
			errorObjectInput: publicModelInput.ErrorObjectInput{
				Trace: []*publicModelInput.StackFrameInput{
					{
						FileName:     util.MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js"),
						LineNumber:   util.MakeIntPointer(0),
						ColumnNumber: util.MakeIntPointer(0),
					},
				},
			},
			expectedErrorObject: model.ErrorObject{},
			fetcher:             NetworkFetcher{},
			err:                 e.New("status code not OK"),
		},
		"test source mapping invalid trace:filename is not a url": {
			errorObjectInput: publicModelInput.ErrorObjectInput{
				Trace: []*publicModelInput.StackFrameInput{
					{
						FileName:     util.MakeStringPointer("/file/local/domain.js"),
						LineNumber:   util.MakeIntPointer(0),
						ColumnNumber: util.MakeIntPointer(0),
					},
				},
			},
			expectedErrorObject: model.ErrorObject{},
			fetcher:             NetworkFetcher{},
			err:                 e.New(`error getting source file: Get "/file/local/domain.js": unsupported protocol scheme ""`),
		},
		"test source mapping invalid trace:filename is localhost": {
			errorObjectInput: publicModelInput.ErrorObjectInput{
				Trace: []*publicModelInput.StackFrameInput{
					{
						FileName:     util.MakeStringPointer("http://localhost:8080/abc.min.js"),
						LineNumber:   util.MakeIntPointer(0),
						ColumnNumber: util.MakeIntPointer(0),
					},
				},
			},
			expectedErrorObject: model.ErrorObject{},
			fetcher:             NetworkFetcher{},
			err:                 e.New(`cannot parse localhost source`),
		},
		"test source mapping invalid trace:trace is nil": {
			errorObjectInput:    publicModelInput.ErrorObjectInput{},
			expectedErrorObject: model.ErrorObject{},
			fetcher:             mockFetcher{},
			err:                 e.New("stack trace input cannot be nil"),
		},
		"test source mapping invalid trace:empty stack frame doesn't update error object": {
			errorObjectInput: publicModelInput.ErrorObjectInput{
				Trace: []*publicModelInput.StackFrameInput{},
			},
			expectedErrorObject: model.ErrorObject{
				MappedStackTrace: util.MakeStringPointer("null"),
			},
			fetcher: mockFetcher{},
			err:     e.New(""),
		},
	}

	r := Resolver{}

	// run tests
	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			defer func(db *gorm.DB) {
				err := util.ClearTablesInDB(db)
				if err != nil {
					t.Fatal(e.Wrap(err, "error clearing database"))
				}
			}(DB)
			fetch = tc.fetcher
			var errorObj model.ErrorObject
			err := r.SetSourceMapElements(&errorObj, &tc.errorObjectInput, 1)
			if err != nil {
				if err.Error() == tc.err.Error() {
					return
				}
				t.Error(e.Wrap(err, "error setting source map elements"))
			}
			eq, diff, err := model.AreModelsWeaklyEqual(&errorObj, &tc.expectedErrorObject)
			if err != nil {
				t.Error(e.Wrap(err, "error checking if publicModelInput. are equal"))
			}
			if !eq {
				t.Error(e.Errorf("publicModelInput. not equal: %+v", diff))
			}
		})
	}
}
