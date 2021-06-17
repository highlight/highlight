package model

import (
	"fmt"
	"os"
	"testing"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
)

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
	var err error
	DB, err = createAndMigrateTestDB("highlight_testing_db")
	if err != nil {
		log.Errorf("error creating testdb: %v", err)
	}
	code := m.Run()
	os.Exit(code)
}

func TestSetSourceMapElements(t *testing.T) {
	// construct table of sub-tests to run
	tests := map[string]struct {
		errorObjectInput    model.ErrorObjectInput
		expectedErrorObject ErrorObject
		err                 error
	}{
		"test source mapping within function": {
			errorObjectInput: model.ErrorObjectInput{
				Source:       "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js",
				LineNumber:   1,
				ColumnNumber: 813,
			},
			expectedErrorObject: ErrorObject{
				SourceMap:          "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js.map",
				MappedFile:         "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js",
				MappedLineNumber:   634,
				MappedColumnNumber: 4,
			},
			err: nil,
		},
		"test source mapping on function name": {
			errorObjectInput: model.ErrorObjectInput{
				Source:       "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js",
				LineNumber:   1,
				ColumnNumber: 799,
			},
			expectedErrorObject: ErrorObject{
				SourceMap:          "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js.map",
				MappedFile:         "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js",
				MappedFunction:     "arrayIncludesWith",
				MappedLineNumber:   633,
				MappedColumnNumber: 11,
			},
			err: nil,
		},
		"test source mapping invalid source:no related source map": {
			errorObjectInput: model.ErrorObjectInput{
				Source: "https://cdnjs.cloudflare.com/",
			},
			expectedErrorObject: ErrorObject{},
			err:                 e.New("file does not contain source map url"),
		},
		"test source mapping invalid source:file too small": {
			errorObjectInput: model.ErrorObjectInput{
				Source: "https://cdnjs.cloudflare.com/ajax/libs/lodash.js",
			},
			expectedErrorObject: ErrorObject{},
			err:                 e.New("file not large enough to contain link to a source map"),
		},
		"test source mapping invalid source:source is not a url": {
			errorObjectInput: model.ErrorObjectInput{
				Source: "/file/local/domain.js",
			},
			expectedErrorObject: ErrorObject{},
			err:                 e.New(`error getting source file: Get "/file/local/domain.js": unsupported protocol scheme ""`),
		},
		"test source mapping invalid source:source is localhost": {
			errorObjectInput: model.ErrorObjectInput{
				Source: "http://localhost:8080/abc.min.js",
			},
			expectedErrorObject: ErrorObject{},
			err:                 e.New(`cannot parse localhost source`),
		},
		"test source mapping invalid source:source is empty": {
			errorObjectInput: model.ErrorObjectInput{
				Source: "",
			},
			expectedErrorObject: ErrorObject{},
			err:                 e.New(`parse "": empty url`),
		},
	}

	// run tests
	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
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
			defer func(db *gorm.DB) {
				err := clearTablesInDB(db)
				if err != nil {
					t.Fatal(e.Wrap(err, "error clearing tables in test db"))
				}
			}(DB)
		})
	}
}
