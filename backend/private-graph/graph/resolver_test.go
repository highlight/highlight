package graph

import (
	"fmt"
	"os"
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
	// Attempt to create the database.
	db.Exec(fmt.Sprintf("CREATE DATABASE %v;", dbName))
	return model.SetupDB(dbName)
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

func TestHideViewedSessions(t *testing.T) {
}

func TestSessionsOther(t *testing.T) {
	log.Println("hillo")
}
