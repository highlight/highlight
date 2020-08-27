package model

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jinzhu/gorm"
	"github.com/jinzhu/gorm/dialects/postgres"
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
	Admins []Admin
}

type Admin struct {
	Model
	OrganizationID int
}

type User struct {
	Model
	OrganizationID int
	Session        []Session
}

type Session struct {
	Model
	UserID        int            `json:"user_id"`
	Details       postgres.Jsonb `json:"details"`
	EventsObjects []EventsObject
}

type EventsObject struct {
	Model
	SessionID int
	Events    postgres.Jsonb
}

func SetupDB() {
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
}
