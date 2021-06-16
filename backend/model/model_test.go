package model

import (
	"fmt"
	"os"
	"testing"

	"gorm.io/driver/postgres"

	"github.com/highlight-run/highlight/backend/public-graph/graph/model"

	e "github.com/pkg/errors"
	"gorm.io/gorm"

	log "github.com/sirupsen/logrus"
	_ "gorm.io/driver/postgres"
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
	}{
		"test proper source mapping": {
			errorObjectInput: model.ErrorObjectInput{
				Source:       "https://djc7ncwalsvt2.cloudfront.net/static/js/0.21404295.chunk.js",
				LineNumber:   2,
				ColumnNumber: 261451,
			},
			expectedErrorObject: ErrorObject{
				SourceMap:          "https://djc7ncwalsvt2.cloudfront.net/static/js/0.21404295.chunk.js.map",
				MappedFile:         "https://djc7ncwalsvt2.cloudfront.net/static/node_modules/video.js/dist/video.es.js",
				MappedFunction:     "window$1",
				MappedLineNumber:   97,
				MappedColumnNumber: 47,
			},
		},
	}
	// run tests
	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			var errorObj ErrorObject
			err := errorObj.SetSourceMapElements(&tc.errorObjectInput)
			if err != nil {
				t.Error(e.Wrap(err, "error setting source map elements"))
			}
			eq, diff, err := AreModelsWeaklyEqual(&errorObj, &tc.expectedErrorObject)
			if err != nil {
				t.Error(e.Wrap(err, "error checking if models are equal"))
			}
			if !eq {
				t.Error(e.New(fmt.Sprintf("models not equal: %+v", diff)))
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
