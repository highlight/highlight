package database

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/jinzhu/gorm"

	_ "github.com/jinzhu/gorm/dialects/postgres"

	log "github.com/sirupsen/logrus"
)

var DB *gorm.DB

type EventsStruct struct {
	Events               []json.RawMessage `json:"events"`
	VisitLocationDetails json.RawMessage   `json:"visitLocationDetails"`
}

type EventsObject struct {
	gorm.Model
	Events  *string
	VisitID *string
}

type Organization struct {
	gorm.Model
	Name   *string
	Users  []User
	Admins []Admin
}

type Admin struct {
	gorm.Model
	OrganizationID uint
	PasswordHash   *string
}

type User struct {
	gorm.Model
	OrganizationID uint
	EventsObjects  []EventsObject
}

func SetupDB() *gorm.DB {
	psqlConf := fmt.Sprintf(
		"host=%s port=5432 user=%s dbname=%s password=%s sslmode=disable",
		os.Getenv("PSQL_HOST"),
		os.Getenv("PSQL_USER"),
		os.Getenv("PSQL_DB"),
		os.Getenv("PSQL_PASSWORD"))

	var err error
	DB, err = gorm.Open("postgres", psqlConf)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	DB.AutoMigrate(&EventsObject{})
	return DB
}
