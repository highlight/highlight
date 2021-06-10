package graph

import (
	"log"
	"os"
	"testing"

	"fmt"

	"gorm.io/driver/postgres"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func TestMain(m *testing.M) {
	log.Println("startup task")
	dbName := "highlight_test"
	psqlConf := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s sslmode=disable",
		os.Getenv("PSQL_HOST"),
		os.Getenv("PSQL_PORT"),
		os.Getenv("PSQL_USER"),
		os.Getenv("PSQL_PASSWORD"))
	// Open the database object without an actual db_name.
	db, err := gorm.Open(postgres.Open(psqlConf))
	if err != nil {
		log.Fatalf("error opening test db: %v", err)
	}
	// Attempt to create the database.
	db = db.Exec(fmt.Sprintf("CREATE DATABASE %v;", dbName))
	// If there's an issue creating the database, it probably already exists.
	if db.Error != nil {
		log.Println("error creating db: attempting to connect to it")
		var err error
		db, err = gorm.Open(postgres.Open(psqlConf))
		if err != nil {
			log.Fatalf("Unable to connect to test database: %v", err)
		}
	}
	log.Println("here")
	DB = db
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("error retrieving test db: %v", err)
	}
	defer sqlDB.Close()
	code := m.Run()
	os.Exit(code)
}

func TestSessions(t *testing.T) {
	log.Println("hello")
}

func TestSessionsOther(t *testing.T) {
	log.Println("hillo")
}
