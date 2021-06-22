package graph

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/pkg/errors"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	modelInput "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	publicModelInput "github.com/highlight-run/highlight/backend/public-graph/graph/model"
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
	// drop db if exists
	db.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %v;", dbName))
	// Attempt to create the database.
	db.Exec(fmt.Sprintf("CREATE DATABASE %v;", dbName))
	return model.SetupDB(dbName)
}

func clearTablesInDB(db *gorm.DB, t *testing.T) {
	for _, m := range model.Models {
		if err := db.Unscoped().Where("1=1").Delete(m).Error; err != nil {
			t.Error(errors.Wrap(err, "error deleting table in db"))
		}
	}
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
					State:          model.ErrorGroupStates.OPEN,
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
	}
	// run tests
	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			defer clearTablesInDB(DB, t)
			// test logic
			r := &Resolver{DB: DB}
			receivedErrorGroups := make(map[string]model.ErrorGroup)
			for _, errorObj := range tc.errorsToInsert {
				errorGroup, err := r.HandleErrorAndGroup(&errorObj, nil, nil)
				if err != nil {
					t.Fatalf("error handling error and group: %+v", err)
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
					t.Fatalf("error comparing two error groups: %+v", err)
				}
				if !isEqual {
					t.Fatalf("received error group not equal to expected error group. diff: %+v", diff)
				}
				i++
			}
		})
	}
}

func MakeIntPointer(v int) *int {
	return &v
}

func MakeStringPointer(v string) *string {
	return &v
}

func MakeStringPointerFromInterface(v interface{}) *string {
	exampleErrorTraceBytes, _ := json.Marshal(&v)
	exampleErrorTraceString := string(exampleErrorTraceBytes)
	return &exampleErrorTraceString
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
						FileName:     MakeStringPointer("./test-files/lodash.min.js"),
						LineNumber:   MakeIntPointer(1),
						ColumnNumber: MakeIntPointer(813),
					},
					{
						FileName:     MakeStringPointer("./test-files/lodash.min.js"),
						LineNumber:   MakeIntPointer(1),
						ColumnNumber: MakeIntPointer(799),
					},
				},
			},
			expectedErrorObject: model.ErrorObject{
				MappedStackTrace: MakeStringPointerFromInterface(
					[]modelInput.ErrorTrace{
						{
							FileName:     MakeStringPointer("lodash.js"),
							LineNumber:   MakeIntPointer(634),
							ColumnNumber: MakeIntPointer(4),
							FunctionName: MakeStringPointer(""),
						},
						{
							FileName:     MakeStringPointer("lodash.js"),
							LineNumber:   MakeIntPointer(633),
							ColumnNumber: MakeIntPointer(11),
							FunctionName: MakeStringPointer("arrayIncludesWith"),
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
						FileName:     MakeStringPointer("./test-files/lodash.js"),
						LineNumber:   MakeIntPointer(0),
						ColumnNumber: MakeIntPointer(0),
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
						FileName:     MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js"),
						LineNumber:   MakeIntPointer(0),
						ColumnNumber: MakeIntPointer(0),
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
						FileName:     MakeStringPointer("/file/local/domain.js"),
						LineNumber:   MakeIntPointer(0),
						ColumnNumber: MakeIntPointer(0),
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
						FileName:     MakeStringPointer("http://localhost:8080/abc.min.js"),
						LineNumber:   MakeIntPointer(0),
						ColumnNumber: MakeIntPointer(0),
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
				MappedStackTrace: MakeStringPointer("null"),
			},
			fetcher: mockFetcher{},
			err:     e.New(""),
		},
	}

	r := Resolver{}

	// run tests
	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			defer func(db *gorm.DB, t *testing.T) {
				clearTablesInDB(db, t)
			}(DB, t)
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
