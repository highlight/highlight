package graph

import (
	"fmt"
	"os"
	"strconv"
	"testing"

	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
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
	// drop db if exists
	db.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %v;", dbName))
	// Attempt to create the database.
	db.Exec(fmt.Sprintf("CREATE DATABASE %v;", dbName))
	return model.SetupDB(dbName)
}

func clearTablesInDB(db *gorm.DB, t *testing.T) {
	for _, m := range model.Models {
		if err := db.Where("1=1").Delete(m).Error; err != nil {
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

func TestErrorGroups(t *testing.T) {
	// construct table of sub-tests to run
	tests := map[string]struct {
		errorsToInsert      []model.ErrorObject
		expectedErrorGroups []model.ErrorGroup
	}{
		"two errors with same environment but different case": {
			errorsToInsert: []model.ErrorObject{
				{
					OrganizationID: 1,
					Environment:    "dev",
				},
				{
					OrganizationID: 1,
					Environment:    "dEv",
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					OrganizationID: 1,
					Trace:          "null",
					Resolved:       &model.F,
					Environments:   `{"dev":2}`,
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
				fmt.Printf("=======================\n\n%+v\n%+v\n\n=======================\n", errorGroup, tc.expectedErrorGroups[i])
				fmt.Printf("=======================\n\n%+v\n\n=======================\n", diff)
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
