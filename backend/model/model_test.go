package model

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"testing"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	modelInput "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
)

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
	psqlConf := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s sslmode=disable",
		os.Getenv("PSQL_HOST"),
		os.Getenv("PSQL_PORT"),
		os.Getenv("PSQL_USER"),
		os.Getenv("PSQL_PASSWORD"))
	// Open the database object without an actual db_name.
	db, err := gorm.Open(postgres.Open(psqlConf))
	if err != nil {
		return nil, e.Wrap(err, "error opening test db")
	}
	sqlDB, err := db.DB()
	if err != nil {
		return nil, e.Wrap(err, "error retrieving test db")
	}
	defer sqlDB.Close()
	// drop db if exists
	if err := db.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %v;", dbName)).Error; err != nil {
		return nil, e.Wrap(err, "error dropping db")
	}
	// Attempt to create the database.
	if err := db.Exec(fmt.Sprintf("CREATE DATABASE %v;", dbName)).Error; err != nil {
		return nil, e.Wrap(err, "error creating db")
	}
	return SetupDB(dbName)
}

func clearTablesInDB(db *gorm.DB) error {
	for _, m := range Models {
		if err := db.Unscoped().Where("1=1").Delete(m).Error; err != nil {
			return e.Wrap(err, "error deleting table in db")
		}
	}
	return nil
}

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	fetch = mockFetcher{}
	var err error
	DB, err = createAndMigrateTestDB("highlight_testing_db")
	if err != nil {
		log.Errorf("error creating testdb: %v", err)
	}
	code := m.Run()
	os.Exit(code)
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
		errorObjectInput    model.ErrorObjectInput
		expectedErrorObject ErrorObject
		fetcher             fetcher
		err                 error
	}{
		"test source mapping with proper stack trace": {
			errorObjectInput: model.ErrorObjectInput{
				Trace: []*model.StackFrameInput{
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
			expectedErrorObject: ErrorObject{
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
			errorObjectInput: model.ErrorObjectInput{
				Trace: []*model.StackFrameInput{
					{
						FileName:     MakeStringPointer("./test-files/lodash.js"),
						LineNumber:   MakeIntPointer(0),
						ColumnNumber: MakeIntPointer(0),
					},
				},
			},
			expectedErrorObject: ErrorObject{},
			fetcher:             mockFetcher{},
			err:                 e.New("file does not contain source map url"),
		},
		"test source mapping invalid trace:file doesn't exist": {
			errorObjectInput: model.ErrorObjectInput{
				Trace: []*model.StackFrameInput{
					{
						FileName:     MakeStringPointer("https://cdnjs.cloudflare.com/ajax/libs/lodash.js"),
						LineNumber:   MakeIntPointer(0),
						ColumnNumber: MakeIntPointer(0),
					},
				},
			},
			expectedErrorObject: ErrorObject{},
			fetcher:             NetworkFetcher{},
			err:                 e.New("status code not OK"),
		},
		"test source mapping invalid trace:filename is not a url": {
			errorObjectInput: model.ErrorObjectInput{
				Trace: []*model.StackFrameInput{
					{
						FileName:     MakeStringPointer("/file/local/domain.js"),
						LineNumber:   MakeIntPointer(0),
						ColumnNumber: MakeIntPointer(0),
					},
				},
			},
			expectedErrorObject: ErrorObject{},
			fetcher:             NetworkFetcher{},
			err:                 e.New(`error getting source file: Get "/file/local/domain.js": unsupported protocol scheme ""`),
		},
		"test source mapping invalid trace:filename is localhost": {
			errorObjectInput: model.ErrorObjectInput{
				Trace: []*model.StackFrameInput{
					{
						FileName:     MakeStringPointer("http://localhost:8080/abc.min.js"),
						LineNumber:   MakeIntPointer(0),
						ColumnNumber: MakeIntPointer(0),
					},
				},
			},
			expectedErrorObject: ErrorObject{},
			fetcher:             NetworkFetcher{},
			err:                 e.New(`cannot parse localhost source`),
		},
		"test source mapping invalid trace:trace is nil": {
			errorObjectInput:    model.ErrorObjectInput{},
			expectedErrorObject: ErrorObject{},
			fetcher:             mockFetcher{},
			err:                 e.New("stack trace input cannot be nil"),
		},
		"test source mapping invalid trace:empty stack frame doesn't update error object": {
			errorObjectInput: model.ErrorObjectInput{
				Trace: []*model.StackFrameInput{},
			},
			expectedErrorObject: ErrorObject{
				MappedStackTrace: MakeStringPointer("null"),
			},
			fetcher: mockFetcher{},
			err:     e.New(""),
		},
	}

	// run tests
	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			defer func(db *gorm.DB) {
				err := clearTablesInDB(db)
				if err != nil {
					t.Fatal(e.Wrap(err, "error clearing tables in test db"))
				}
			}(DB)
			fetch = tc.fetcher
			var errorObj ErrorObject
			err := errorObj.SetSourceMapElements(&tc.errorObjectInput)
			if err != nil {
				if err.Error() == tc.err.Error() {
					return
				}
				t.Error(e.Wrap(err, "error setting source map elements"))
			}
			eq, diff, err := AreModelsWeaklyEqual(&errorObj, &tc.expectedErrorObject)
			if err != nil {
				t.Error(e.Wrap(err, "error checking if models are equal"))
			}
			if !eq {
				t.Error(e.Errorf("models not equal: %+v", diff))
			}
		})
	}
}
