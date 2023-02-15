package util

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"testing"

	e "github.com/pkg/errors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
)

func RunTestWithDBWipe(t *testing.T, name string, db *gorm.DB, f func(t *testing.T)) {
	defer func(db *gorm.DB) {
		err := ClearTablesInDB(db)
		if err != nil {
			t.Fatal(e.Wrap(err, "error clearing database"))
		}
	}(db)
	t.Run(name, f)
}

func CreateAndMigrateTestDB(dbName string) (*gorm.DB, error) {
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
	// Setup database
	db, err = model.SetupDB(context.TODO(), dbName)
	if err != nil {
		return nil, e.Wrap(err, "error setting up test db")
	}
	// Migrate database
	_, err = model.MigrateDB(context.TODO(), db)
	if err != nil {
		return nil, e.Wrap(err, "error migrating test db")
	}
	return db, nil
}

func ClearTablesInDB(db *gorm.DB) error {
	for _, m := range model.Models {
		if err := db.Unscoped().Where("1=1").Delete(m).Error; err != nil {
			return e.Wrap(err, "error deleting table in db")
		}
	}
	return nil
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
