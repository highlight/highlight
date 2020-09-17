package model

import (
	"fmt"
	"os"
	"time"

	"github.com/jinzhu/gorm"

	log "github.com/sirupsen/logrus"
)

var DB *gorm.DB

type Model struct {
	ID        int        `gorm:"primary_key" json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at"`
}

type Organization struct {
	Model
	Name   *string
	Users  []User
	Admins []Admin `gorm:"many2many:organization_admins;"`
}

type Admin struct {
	Model
	Name          *string
	Email         *string
	UID           *string        `gorm:"unique_index"`
	Organizations []Organization `gorm:"many2many:organization_admins;"`
}

type User struct {
	Model
	OrganizationID int
	Sessions       []Session
}

type Session struct {
	Model
	UserID int `json:"user_id"`
	// User provided identifier (see IdentifySession)
	Identifier     string `json:"identifier"`
	OrganizationID int    `json:"organization_id"`
	Details        string `json:"details"`
	Status         string `json:"status"`
	EventsObjects  []EventsObject
	// Tells us if the session has been parsed by a worker.
	Processed bool `json:"processed"`
	// The length of a session.
	Length int64 `json:"length"`
}

type EventsObject struct {
	Model
	SessionID int
	Events    string
}

func SetupDB() *gorm.DB {
	log.Println("setting up database")
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
	DB.AutoMigrate(&EventsObject{}, &Organization{}, &Admin{}, &User{}, &Session{})
	return DB
}
