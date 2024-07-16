package util

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"testing"

	e "github.com/pkg/errors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
)

func RunTestWithDBWipe(t *testing.T, db *gorm.DB, f func(t *testing.T)) {
	RunTestWithDBWipeWithName(t, db, t.Name(), f)
}

func RunTestWithDBWipeWithName(t *testing.T, db *gorm.DB, name string, f func(t *testing.T)) {
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
		env.Config.SQLHost,
		env.Config.SQLPort,
		env.Config.SQLUser,
		env.Config.SQLPassword)
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
