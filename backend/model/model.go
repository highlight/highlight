package model

import (
	"context"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/k0kubun/pp"
	"github.com/mitchellh/mapstructure"
	"github.com/rs/xid"
	"github.com/speps/go-hashids"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

var (
	DB     *gorm.DB
	HashID *hashids.HashID
	F      bool = false
	T      bool = true
)

func init() {
	hd := hashids.NewData()
	hd.MinLength = 8
	hd.Alphabet = "abcdefghijklmnopqrstuvwxyz1234567890"
	hid, err := hashids.NewWithData(hd)
	if err != nil {
		log.Fatalf("error creating hash id client: %v", err)
	}
	HashID = hid
}

type Model struct {
	ID        int        `gorm:"primary_key" json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at"`
}

type RecordingSettings struct {
	Model
	OrganizationID int     `json:"organization_id"`
	Details        *string `json:"details"`
}

func (r *RecordingSettings) GetDetailsAsSlice() ([]string, error) {
	var result []string
	if r.Details == nil {
		return result, nil
	}
	err := json.Unmarshal([]byte(*r.Details), &result)
	if err != nil {
		return nil, e.Wrap(err, "error parsing details json")
	}
	return result, nil
}

type Organization struct {
	Model
	Name             *string
	StripeCustomerID *string
	BillingEmail     *string
	Secret           *string `json:"-"`
	Admins           []Admin `gorm:"many2many:organization_admins;"`
	Fields           []Field
	RecordingSetting RecordingSettings
	TrialEndDate     *time.Time `json:"trial_end_date"`
	// Slack API Interaction.
	SlackAccessToken      *string
	SlackWebhookURL       *string
	SlackWebhookChannel   *string
	SlackWebhookChannelID *string
}

func (u *Organization) VerboseID() string {
	str, err := HashID.Encode([]int{u.ID})
	if err != nil {
		log.Errorf("error generating hash id: %v", err)
		str = strconv.Itoa(u.ID)
	}
	return str
}

func FromVerboseID(verboseId string) int {
	// Try to convert the id to an integer in the case that the client is out of date.
	if organizationID, err := strconv.Atoi(verboseId); err == nil {
		return organizationID
	}
	// Otherwise, decode with HashID library
	ints := HashID.Decode(verboseId)
	if len(ints) != 1 {
		return 1
	}
	return ints[0]
}

func (u *Organization) BeforeCreate(tx *gorm.DB) (err error) {
	x := xid.New().String()
	u.Secret = &x
	return
}

type Admin struct {
	Model
	Name          *string
	Email         *string
	UID           *string        `gorm:"unique_index"`
	Organizations []Organization `gorm:"many2many:organization_admins;"`
}

type EmailSignup struct {
	Model
	Email string `gorm:"unique_index"`
}

type User struct {
	Model
	OrganizationID int
	Sessions       []Session
}

type SessionResults struct {
	Sessions   []Session
	TotalCount int64
}

type SessionCount struct {
	Count int64
}

type Session struct {
	Model
	UserID int `json:"user_id"`
	// User provided identifier (see IdentifySession)
	Identifier     string `json:"identifier"`
	OrganizationID int    `json:"organization_id"`
	// Location data based off user ip (see InitializeSession)
	City      string  `json:"city"`
	State     string  `json:"state"`
	Postal    string  `json:"postal"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	// Details based off useragent (see Initialize Session)
	OSName         string `json:"os_name"`
	OSVersion      string `json:"os_version"`
	BrowserName    string `json:"browser_name"`
	BrowserVersion string `json:"browser_version"`
	Status         string `json:"status"`
	Language       string `json:"language"`
	EventsObjects  []EventsObject
	// Tells us if the session has been parsed by a worker.
	Processed *bool `json:"processed"`
	// The length of a session.
	Length     int64    `json:"length"`
	Fields     []*Field `json:"fields" gorm:"many2many:session_fields;"`
	UserObject JSONB    `json:"user_object" sql:"type:jsonb"`
	// Whether this is the first session created by this user.
	FirstTime        *bool      `json:"first_time" gorm:"default:false"`
	PayloadUpdatedAt *time.Time `json:"payload_updated_at"`
	// Custom properties
	Viewed              *bool   `json:"viewed"`
	Starred             *bool   `json:"starred"`
	FieldGroup          *string `json:"field_group"`
	EnableStrictPrivacy *bool   `json:"enable_strict_privacy"`
	// The version of Highlight's Client.
	ClientVersion string `json:"client_version" gorm:"index"`
	// The version of Highlight's Firstload.
	FirstloadVersion string `json:"firstload_version" gorm:"index"`
	// The client configuration that the end-user sets up. This is used for debugging purposes.
	ClientConfig *string `json:"client_config" sql:"type:jsonb"`
}

type Field struct {
	Model
	// 'user_property', 'session_property'.
	Type string
	// 'email', 'identifier', etc.
	Name string
	// 'email@email.com'
	Value          string
	OrganizationID int       `json:"organization_id"`
	Sessions       []Session `gorm:"many2many:session_fields;"`
}

type ResourcesObject struct {
	Model
	SessionID int
	Resources string
}

type SearchParams struct {
	UserProperties     []*UserProperty `json:"user_properties"`
	ExcludedProperties []*UserProperty `json:"excluded_properties"`
	TrackProperties    []*UserProperty `json:"track_properties"`
	DateRange          *DateRange      `json:"date_range"`
	LengthRange        *LengthRange    `json:"length_range"`
	Browser            *string         `json:"browser"`
	OS                 *string         `json:"os"`
	VisitedURL         *string         `json:"visited_url"`
	Referrer           *string         `json:"referrer"`
	Identified         bool            `json:"identified"`
	HideViewed         bool            `json:"hide_viewed"`
	FirstTime          bool            `json:"first_time"`
}
type Segment struct {
	Model
	Name           *string
	Params         *string `json:"params"`
	UserObject     JSONB   `json:"user_object" sql:"type:jsonb"`
	OrganizationID int
}

func (s *SearchParams) GormDataType() string {
	out, err := json.Marshal(s)
	if err != nil {
		return ""
	}
	return string(out)
}

func (s *SearchParams) GormValue(ctx context.Context, db *gorm.DB) clause.Expr {
	pp.Println("value", s.GormDataType())
	return clause.Expr{
		SQL: fmt.Sprintf("ST_PointFromText(%v)", s.GormDataType()),
	}
}

type DateRange struct {
	StartDate time.Time
	EndDate   time.Time
}

type LengthRange struct {
	Min int
	Max int
}

type UserProperty struct {
	Name  string
	Value string
}

type MessagesObject struct {
	Model
	SessionID int
	Messages  string
}

type EventsObject struct {
	Model
	SessionID int
	Events    string
}

type ErrorResults struct {
	ErrorGroups []ErrorGroup
	TotalCount  int
}

type ErrorSearchParams struct {
	DateRange    *DateRange `json:"date_range"`
	Browser      *string    `json:"browser"`
	OS           *string    `json:"os"`
	VisitedURL   *string    `json:"visited_url"`
	HideResolved bool       `json:"hide_resolved"`
	Event        *string    `json:"event"`
}
type ErrorSegment struct {
	Model
	Name           *string
	Params         *string `json:"params"`
	OrganizationID int
}

type ErrorObject struct {
	Model
	OrganizationID int
	SessionID      int
	ErrorGroupID   int
	Event          string
	Type           string
	URL            string
	Source         string
	LineNumber     int
	ColumnNumber   int
	OS             string
	Browser        string
	Trace          *string   `json:"trace"`
	Timestamp      time.Time `json:"timestamp"`
}

type ErrorGroup struct {
	Model
	OrganizationID int
	Event          string
	Type           string
	Trace          string
	Resolved       *bool `json:"resolved"`
	MetadataLog    *string
	Fields         []*ErrorField `gorm:"many2many:error_group_fields;"`
	FieldGroup     *string
}

type ErrorField struct {
	Model
	OrganizationID int
	Name           string
	Value          string
	ErrorGroups    []ErrorGroup `gorm:"many2many:error_group_fields;"`
}

type SessionComment struct {
	Model
	AdminId     int
	SessionId   int
	Timestamp   int
	Text        string
	XCoordinate float64
	YCoordinate float64
}

func SetupDB() *gorm.DB {
	log.Println("setting up database")
	psqlConf := fmt.Sprintf(
		"host=%s port=%s user=%s dbname=%s password=%s sslmode=disable",
		os.Getenv("PSQL_HOST"),
		os.Getenv("PSQL_PORT"),
		os.Getenv("PSQL_USER"),
		os.Getenv("PSQL_DB"),
		os.Getenv("PSQL_PASSWORD"))

	var err error
	DB, err = gorm.Open(postgres.Open(psqlConf))
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	DB.AutoMigrate(
		&RecordingSettings{},
		&MessagesObject{},
		&EventsObject{},
		&ErrorObject{},
		&ErrorGroup{},
		&ErrorField{},
		&ErrorSegment{},
		&Organization{},
		&Segment{},
		&Admin{},
		&User{},
		&Session{},
		&Field{},
		&EmailSignup{},
		&ResourcesObject{},
		&SessionComment{},
	)
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
