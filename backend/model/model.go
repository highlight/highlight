package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/jinzhu/gorm"
	"github.com/mitchellh/mapstructure"

	e "github.com/pkg/errors"
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
	Fields []Field
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
	Length     int64   `json:"length"`
	Fields     []Field `gorm:"many2many:session_fields;"`
	UserObject JSONB   `json:"user_object" sql:"type:jsonb"`
}

type Field struct {
	Model
	// 'email', 'identifier', etc.
	Name string
	// 'email@email.com'
	Value          string
	OrganizationID int       `json:"organization_id"`
	Sessions       []Session `gorm:"many2many:session_fields;"`
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
	DB.AutoMigrate(&EventsObject{}, &Organization{}, &Admin{}, &User{}, &Session{}, &Field{})
	return DB
}

// Implement JSONB interface
type JSONB map[string]interface{}

func (j JSONB) Value() (driver.Value, error) {
	valueString, err := json.Marshal(j)
	return string(valueString), err
}

func (j *JSONB) Scan(value interface{}) error {
	if err := json.Unmarshal(value.([]byte), &j); err != nil {
		return err
	}
	return nil
}

// Params used for reading from search requests.
type Param struct {
	Action string `json:"action"`
	Type   string `json:"type"`
	Value  struct {
		Text  string `json:"text"`
		Value string `json:"value"`
	} `json:"value"`
}

func DecodeAndValidateParams(params []interface{}) ([]*Param, error) {
	ps := []*Param{}
	keys := make(map[string]bool)
	for _, param := range params {
		var output *Param
		cfg := &mapstructure.DecoderConfig{
			Metadata: nil,
			Result:   &output,
			TagName:  "json",
		}
		decoder, err := mapstructure.NewDecoder(cfg)
		if err != nil {
			return nil, e.Wrap(err, "error creating decoder")
		}
		err = decoder.Decode(param)
		if err != nil {
			return nil, e.Wrap(err, "error decoding")
		}
		// If we've already seen the key, throw an error.
		if val := keys[output.Action]; val {
			return nil, fmt.Errorf("repeated param '%v' not suppported", val)
		}
		keys[output.Action] = true
		ps = append(ps, output)
	}
	return ps, nil
}
