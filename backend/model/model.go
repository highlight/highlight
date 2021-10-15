package model

import (
	"context"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"os"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/go-test/deep"
	"github.com/mitchellh/mapstructure"
	"github.com/rs/xid"
	"github.com/slack-go/slack"
	"github.com/speps/go-hashids"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/logger"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

var (
	DB     *gorm.DB
	HashID *hashids.HashID
	F      bool = false
	T      bool = true
)

const (
	SUGGESTION_LIMIT_CONSTANT = 8
)

var AlertType = struct {
	ERROR            string
	NEW_USER         string
	TRACK_PROPERTIES string
	USER_PROPERTIES  string
	SESSION_FEEDBACK string
	NEW_SESSION      string
}{
	ERROR:            "ERROR_ALERT",
	NEW_USER:         "NEW_USER_ALERT",
	TRACK_PROPERTIES: "TRACK_PROPERTIES_ALERT",
	USER_PROPERTIES:  "USER_PROPERTIES_ALERT",
	SESSION_FEEDBACK: "SESSION_FEEDBACK_ALERT",
	NEW_SESSION:      "NEW_SESSION_ALERT",
}

var AdminRole = struct {
	ADMIN  string
	MEMBER string
}{
	ADMIN:  "ADMIN",
	MEMBER: "MEMBER",
}

var ErrorGroupStates = struct {
	OPEN     string
	RESOLVED string
	IGNORED  string
}{
	OPEN:     "OPEN",
	RESOLVED: "RESOLVED",
	IGNORED:  "IGNORED",
}

var SessionCommentTypes = struct {
	// Comments created by a Highlight user on the Highlight app.
	ADMIN string
	// Comments created by a Highlight customer, comes from feedback from their app.
	FEEDBACK string
}{
	ADMIN:    "ADMIN",
	FEEDBACK: "FEEDBACK",
}

type contextString string

var ContextKeys = struct {
	IP             contextString
	UserAgent      contextString
	AcceptLanguage contextString
	UID            contextString
	// The email for the current user. If the email is a @highlight.run, the email will need to be verified, otherwise `Email` will be an empty string.
	Email contextString
}{
	IP:             "ip",
	UserAgent:      "userAgent",
	AcceptLanguage: "acceptLanguage",
	UID:            "uid",
	Email:          "email",
}

var Models = []interface{}{
	&MessagesObject{},
	&EventsObject{},
	&ErrorObject{},
	&ErrorGroup{},
	&ErrorField{},
	&ErrorSegment{},
	&Organization{},
	&Segment{},
	&Admin{},
	&Session{},
	&DailySessionCount{},
	&DailyErrorCount{},
	&Field{},
	&EmailSignup{},
	&ResourcesObject{},
	&SessionComment{},
	&ErrorComment{},
	&ErrorAlert{},
	&SessionAlert{},
	&Project{},
	&RageClickEvent{},
	&Workspace{},
	&EnhancedUserDetails{},
}

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
	ID        int        `gorm:"primary_key;type:serial" json:"id" deep:"-"`
	CreatedAt time.Time  `json:"created_at" deep:"-"`
	UpdatedAt time.Time  `json:"updated_at" deep:"-"`
	DeletedAt *time.Time `json:"deleted_at" deep:"-"`
}

type Organization struct {
	Model
	Name             *string
	StripeCustomerID *string
	StripePriceID    *string
	BillingEmail     *string
	Secret           *string    `json:"-"`
	Admins           []Admin    `gorm:"many2many:organization_admins;"`
	TrialEndDate     *time.Time `json:"trial_end_date"`
	// Slack API Interaction.
	SlackAccessToken      *string
	SlackWebhookURL       *string
	SlackWebhookChannel   *string
	SlackWebhookChannelID *string
	SlackChannels         *string
	// Manual monthly session limit override
	MonthlySessionLimit *int
}

type Workspace struct {
	Model
	Name                  *string
	Secret                *string // Needed for workspace-level team
	Admins                []Admin `gorm:"many2many:workspace_admins;"`
	SlackAccessToken      *string
	SlackWebhookURL       *string
	SlackWebhookChannel   *string
	SlackWebhookChannelID *string
	SlackChannels         *string
	Projects              []Project
	MigratedFromProjectID *int // Column can be removed after migration is done
}

type Project struct {
	Model
	Name             *string
	StripeCustomerID *string
	StripePriceID    *string
	BillingEmail     *string
	Secret           *string    `json:"-"`
	Admins           []Admin    `gorm:"many2many:project_admins;"`
	TrialEndDate     *time.Time `json:"trial_end_date"`
	// Manual monthly session limit override
	MonthlySessionLimit *int
	WorkspaceID         int
}

type HasSecret interface {
	GetSecret() *string
}

func (project *Project) GetSecret() *string     { return project.Secret }
func (workspace *Workspace) GetSecret() *string { return workspace.Secret }

type Alert struct {
	OrganizationID       int
	ProjectID            int
	ExcludedEnvironments *string
	CountThreshold       int
	ThresholdWindow      *int
	ChannelsToNotify     *string
	Name                 *string
	Type                 *string `gorm:"index"`
	LastAdminToEditID    int     `gorm:"last_admin_to_edit_id"`
}

type EnhancedUserDetails struct {
	Model
	Email       *string `gorm:"unique_index"`
	PersonJSON  *string
	CompanyJSON *string
}

type ErrorAlert struct {
	Model
	Alert
}

type SessionAlert struct {
	Model
	Alert
	TrackProperties *string
	UserProperties  *string
}

func (obj *Alert) GetExcludedEnvironments() ([]*string, error) {
	if obj == nil {
		return nil, e.New("empty session alert object for excluded environments")
	}
	excludedString := "[]"
	if obj.ExcludedEnvironments != nil {
		excludedString = *obj.ExcludedEnvironments
	}
	var sanitizedExcludedEnvironments []*string
	if err := json.Unmarshal([]byte(excludedString), &sanitizedExcludedEnvironments); err != nil {
		return nil, e.Wrap(err, "error unmarshalling sanitized excluded environments")
	}
	return sanitizedExcludedEnvironments, nil
}

func (obj *Alert) GetChannelsToNotify() ([]*modelInputs.SanitizedSlackChannel, error) {
	if obj == nil {
		return nil, e.New("empty session alert object for channels to notify")
	}
	channelString := "[]"
	if obj.ChannelsToNotify != nil {
		channelString = *obj.ChannelsToNotify
	}
	var sanitizedChannels []*modelInputs.SanitizedSlackChannel
	if err := json.Unmarshal([]byte(channelString), &sanitizedChannels); err != nil {
		return nil, e.Wrap(err, "error unmarshalling sanitized slack channels")
	}
	return sanitizedChannels, nil
}

func (obj *SessionAlert) GetTrackProperties() ([]*TrackProperty, error) {
	if obj == nil {
		return nil, e.New("empty session alert object for track properties")
	}
	propertyString := "[]"
	if obj.TrackProperties != nil {
		propertyString = *obj.TrackProperties
	}
	var sanitizedProperties []*TrackProperty
	if err := json.Unmarshal([]byte(propertyString), &sanitizedProperties); err != nil {
		return nil, e.Wrap(err, "error unmarshalling sanitized track properties")
	}
	return sanitizedProperties, nil
}

func (obj *SessionAlert) GetUserProperties() ([]*UserProperty, error) {
	if obj == nil {
		return nil, e.New("empty session alert object for user properties")
	}
	propertyString := "[]"
	if obj.UserProperties != nil {
		propertyString = *obj.UserProperties
	}
	var sanitizedProperties []*UserProperty
	if err := json.Unmarshal([]byte(propertyString), &sanitizedProperties); err != nil {
		return nil, e.Wrap(err, "error unmarshalling sanitized user properties")
	}
	return sanitizedProperties, nil
}

type SlackChannel struct {
	WebhookAccessToken string
	WebhookURL         string
	WebhookChannel     string
	WebhookChannelID   string
}

func (u *Workspace) IntegratedSlackChannels() ([]SlackChannel, error) {
	parsedChannels := []SlackChannel{}
	if u.SlackChannels != nil {
		err := json.Unmarshal([]byte(*u.SlackChannels), &parsedChannels)
		if err != nil {
			return nil, e.Wrap(err, "error parsing details json")
		}
	} else {
		return parsedChannels, nil
	}
	repeat := false
	for _, c := range parsedChannels {
		if u.SlackWebhookChannelID != nil && c.WebhookChannelID == *u.SlackWebhookChannelID {
			repeat = true
		}
	}
	if u.SlackWebhookChannel != nil && !repeat {
		// Archived channels or users will not have a channel ID.
		if u.SlackWebhookChannelID != nil {
			parsedChannels = append(parsedChannels, SlackChannel{
				WebhookAccessToken: *u.SlackAccessToken,
				WebhookURL:         *u.SlackWebhookURL,
				WebhookChannel:     *u.SlackWebhookChannel,
				WebhookChannelID:   *u.SlackWebhookChannelID,
			})
		}
	}
	return parsedChannels, nil
}

func (u *Project) VerboseID() string {
	str, err := HashID.Encode([]int{u.ID})
	if err != nil {
		log.Errorf("error generating hash id: %v", err)
		str = strconv.Itoa(u.ID)
	}
	return str
}

func FromVerboseID(verboseId string) int {
	// Try to convert the id to an integer in the case that the client is out of date.
	if projectID, err := strconv.Atoi(verboseId); err == nil {
		return projectID
	}
	// Otherwise, decode with HashID library
	ints := HashID.Decode(verboseId)
	if len(ints) != 1 {
		return 1
	}
	return ints[0]
}

func (u *Project) BeforeCreate(tx *gorm.DB) (err error) {
	x := xid.New().String()
	u.Secret = &x
	return
}

func (u *Workspace) BeforeCreate(tx *gorm.DB) (err error) {
	x := xid.New().String()
	u.Secret = &x
	return
}

type Admin struct {
	Model
	Name             *string
	Email            *string
	PhotoURL         *string          `json:"photo_url"`
	UID              *string          `gorm:"unique_index"`
	Organizations    []Organization   `gorm:"many2many:organization_admins;"`
	Projects         []Project        `gorm:"many2many:project_admins;"`
	SessionComments  []SessionComment `gorm:"many2many:session_comment_admins;"`
	ErrorComments    []ErrorComment   `gorm:"many2many:error_comment_admins;"`
	Workspaces       []Workspace      `gorm:"many2many:workspace_admins;"`
	SlackIMChannelID *string
	Role             *string `json:"role" gorm:"default:ADMIN"`
}

type EmailSignup struct {
	Model
	Email               string `gorm:"unique_index"`
	ApolloData          string
	ApolloDataShortened string
}

type SessionResults struct {
	Sessions   []Session
	TotalCount int64
}

type Session struct {
	Model
	// The ID used publicly for the URL on the client; used for sharing
	SecureID    string `json:"secure_id" gorm:"uniqueIndex;not null;default:secure_id_generator()"`
	Fingerprint int    `json:"fingerprint"`
	// User provided identifier (see IdentifySession)
	Identifier     string `json:"identifier"`
	OrganizationID int    `json:"organization_id"`
	ProjectID      int    `json:"project_id"`
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
	Language       string `json:"language"`
	// Tells us if the session has been parsed by a worker.
	Processed *bool `json:"processed"`
	// The length of a session.
	Length         int64    `json:"length"`
	ActiveLength   int64    `json:"active_length"`
	Fields         []*Field `json:"fields" gorm:"many2many:session_fields;"`
	Environment    string   `json:"environment"`
	AppVersion     *string  `json:"app_version" gorm:"index"`
	UserObject     JSONB    `json:"user_object" sql:"type:jsonb"`
	UserProperties string   `json:"user_properties"`
	// Whether this is the first session created by this user.
	FirstTime        *bool      `json:"first_time" gorm:"default:false"`
	PayloadUpdatedAt *time.Time `json:"payload_updated_at"`
	// Custom properties
	Viewed                         *bool   `json:"viewed"`
	Starred                        *bool   `json:"starred"`
	FieldGroup                     *string `json:"field_group"`
	EnableStrictPrivacy            *bool   `json:"enable_strict_privacy"`
	EnableRecordingNetworkContents *bool   `json:"enable_recording_network_contents"`
	// The version of Highlight's Client.
	ClientVersion string `json:"client_version" gorm:"index"`
	// The version of Highlight's Firstload.
	FirstloadVersion string `json:"firstload_version" gorm:"index"`
	// The client configuration that the end-user sets up. This is used for debugging purposes.
	ClientConfig *string `json:"client_config" sql:"type:jsonb"`
	// Determines whether this session should be viewable. This enforces billing.
	WithinBillingQuota *bool `json:"within_billing_quota" gorm:"index;default:true"` // index? probably.
	// Used for shareable links. No authentication is needed if IsPublic is true
	IsPublic *bool `json:"is_public" gorm:"default:false"`

	ObjectStorageEnabled *bool   `json:"object_storage_enabled"`
	PayloadSize          *int64  `json:"payload_size"`
	MigrationState       *string `json:"migration_state"`
}

// AreModelsWeaklyEqual compares two structs of the same type while ignoring the Model and SecureID field
// a and b MUST be pointers, otherwise this won't work
func AreModelsWeaklyEqual(a, b interface{}) (bool, []string, error) {
	if reflect.TypeOf(a) != reflect.TypeOf(b) {
		return false, nil, e.New("interfaces to compare aren't the same time")
	}

	aReflection := reflect.ValueOf(a)
	// Check if the passed interface is a pointer
	if aReflection.Type().Kind() != reflect.Ptr {
		return false, nil, e.New("`a` is not a pointer")
	}
	// 'dereference' with Elem() and get the field by name
	aModelField := aReflection.Elem().FieldByName("Model")
	aSecureIDField := aReflection.Elem().FieldByName("SecureID")

	bReflection := reflect.ValueOf(b)
	// Check if the passed interface is a pointer
	if bReflection.Type().Kind() != reflect.Ptr {
		return false, nil, e.New("`b` is not a pointer")
	}
	// 'dereference' with Elem() and get the field by name
	bModelField := bReflection.Elem().FieldByName("Model")
	bSecureIDField := bReflection.Elem().FieldByName("SecureID")

	if aModelField.IsValid() && bModelField.IsValid() {
		// override Model on b with a's model
		bModelField.Set(aModelField)
	} else if aModelField.IsValid() || bModelField.IsValid() {
		// return error if one has a model and the other doesn't
		return false, nil, e.New("one interface has a model and the other doesn't")
	}

	if aSecureIDField.IsValid() && bSecureIDField.IsValid() {
		// override SecureID on b with a's SecureID
		bSecureIDField.Set(aSecureIDField)
	} else if aSecureIDField.IsValid() || bSecureIDField.IsValid() {
		// return error if one has a SecureID and the other doesn't
		return false, nil, e.New("one interface has a SecureID and the other doesn't")
	}

	// get diff
	diff := deep.Equal(aReflection.Interface(), bReflection.Interface())
	isEqual := len(diff) == 0

	return isEqual, diff, nil
}

type Field struct {
	Model
	// 'user_property', 'session_property'.
	Type string
	// 'email', 'identifier', etc.
	Name string
	// 'email@email.com'
	Value     string
	ProjectID int       `json:"project_id"`
	Sessions  []Session `gorm:"many2many:session_fields;"`
}

type ResourcesObject struct {
	Model
	SessionID int
	Resources string
}

func (r *ResourcesObject) Contents() string {
	return r.Resources
}

type SearchParams struct {
	UserProperties          []*UserProperty `json:"user_properties"`
	ExcludedProperties      []*UserProperty `json:"excluded_properties"`
	TrackProperties         []*UserProperty `json:"track_properties"`
	ExcludedTrackProperties []*UserProperty `json:"excluded_track_properties"`
	DateRange               *DateRange      `json:"date_range"`
	LengthRange             *LengthRange    `json:"length_range"`
	Browser                 *string         `json:"browser"`
	OS                      *string         `json:"os"`
	Environments            []*string       `json:"environments"`
	AppVersions             []*string       `json:"app_versions"`
	DeviceID                *string         `json:"device_id"`
	VisitedURL              *string         `json:"visited_url"`
	Referrer                *string         `json:"referrer"`
	Identified              bool            `json:"identified"`
	HideViewed              bool            `json:"hide_viewed"`
	FirstTime               bool            `json:"first_time"`
	ShowLiveSessions        bool            `json:"show_live_sessions"`
}
type Segment struct {
	Model
	Name           *string
	Params         *string `json:"params"`
	OrganizationID int
	ProjectID      int `json:"project_id"`
}

type DailySessionCount struct {
	Model
	Date           *time.Time `json:"date"`
	Count          int64      `json:"count"`
	OrganizationID int
	ProjectID      int `json:"project_id"`
}

const DAILY_ERROR_COUNTS_TBL = "daily_error_counts"
const DAILY_ERROR_COUNTS_UNIQ = "date_project_id_error_type_uniq"

type DailyErrorCount struct {
	Model
	Date           *time.Time `json:"date"`
	Count          int64      `json:"count"`
	OrganizationID int
	ProjectID      int    `json:"project_id"`
	ErrorType      string `gorm:"default:FRONTEND"`
}

func (s *SearchParams) GormDataType() string {
	out, err := json.Marshal(s)
	if err != nil {
		return ""
	}
	return string(out)
}

func (s *SearchParams) GormValue(ctx context.Context, db *gorm.DB) clause.Expr {
	return clause.Expr{
		SQL: fmt.Sprintf("ST_PointFromText(%v)", s.GormDataType()),
	}
}

type DateRange struct {
	StartDate time.Time
	EndDate   time.Time
}

type LengthRange struct {
	Min float64
	Max float64
}

type UserProperty struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Value string `json:"value"`
}

type TrackProperty struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Value string `json:"value"`
}

type Object interface {
	Contents() string
}

type MessagesObject struct {
	Model
	SessionID int
	Messages  string
}

func (m *MessagesObject) Contents() string {
	return m.Messages
}

type EventsObject struct {
	Model
	SessionID int
	Events    string
}

func (m *EventsObject) Contents() string {
	return m.Events
}

type ErrorResults struct {
	ErrorGroups []ErrorGroup
	TotalCount  int64
}

type ErrorSearchParams struct {
	DateRange  *DateRange              `json:"date_range"`
	Browser    *string                 `json:"browser"`
	OS         *string                 `json:"os"`
	VisitedURL *string                 `json:"visited_url"`
	Event      *string                 `json:"event"`
	State      *modelInputs.ErrorState `json:"state"`
}
type ErrorSegment struct {
	Model
	Name           *string
	Params         *string `json:"params"`
	OrganizationID int
	ProjectID      int `json:"project_id"`
}

type ErrorObject struct {
	Model
	OrganizationID int
	ProjectID      int `json:"project_id"`
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
	Trace          *string   `json:"trace"` //DEPRECATED, USE STACKTRACE INSTEAD
	StackTrace     *string   `json:"stack_trace"`
	Timestamp      time.Time `json:"timestamp"`
	Payload        *string   `json:"payload"`
	Environment    string
	RequestID      *string // From X-Highlight-Request header
	ErrorType      string  `gorm:"default:FRONTEND"`
}

type ErrorGroup struct {
	Model
	// The ID used publicly for the URL on the client; used for sharing
	SecureID         string `json:"secure_id" gorm:"uniqueIndex;not null;default:secure_id_generator()"`
	OrganizationID   int
	ProjectID        int `json:"project_id"`
	Event            string
	Type             string
	Trace            string //DEPRECATED, USE STACKTRACE INSTEAD
	StackTrace       string
	MappedStackTrace *string
	State            string        `json:"state" gorm:"default:OPEN"`
	Fields           []*ErrorField `gorm:"many2many:error_group_fields;"`
	FieldGroup       *string
	Environments     string
	IsPublic         bool `gorm:"default:false"`
}

type ErrorField struct {
	Model
	OrganizationID int
	ProjectID      int `json:"project_id"`
	Name           string
	Value          string
	ErrorGroups    []ErrorGroup `gorm:"many2many:error_group_fields;"`
}

type SessionComment struct {
	Model
	Admins          []Admin `gorm:"many2many:session_comment_admins;"`
	OrganizationID  int
	ProjectID       int `json:"project_id"`
	AdminId         int
	SessionId       int
	SessionSecureId string `gorm:"index;not null;default:''"`
	Timestamp       int
	Text            string
	XCoordinate     float64
	YCoordinate     float64
	Type            string `json:"type" gorm:"default:ADMIN"`
	Metadata        JSONB  `json:"metadata" gorm:"type:jsonb"`
}

type ErrorComment struct {
	Model
	Admins         []Admin `gorm:"many2many:error_comment_admins;"`
	OrganizationID int
	ProjectID      int `json:"project_id"`
	AdminId        int
	ErrorId        int
	ErrorSecureId  string `gorm:"index;not null;default:''"`
	Text           string
}

type RageClickEvent struct {
	Model
	ProjectID       int    `deep:"-"`
	SessionSecureID string `deep:"-"`
	TotalClicks     int
	StartTimestamp  time.Time `deep:"-"`
	EndTimestamp    time.Time `deep:"-"`
}

var ErrorType = struct {
	FRONTEND string
	BACKEND  string
}{
	FRONTEND: "FRONTEND",
	BACKEND:  "BACKEND",
}

func SetupDB(dbName string) (*gorm.DB, error) {
	var (
		host     = os.Getenv("PSQL_HOST")
		port     = os.Getenv("PSQL_PORT")
		username = os.Getenv("PSQL_USER")
		password = os.Getenv("PSQL_PASSWORD")
		sslmode  = "disable"
	)

	databaseURL, ok := os.LookupEnv("DATABASE_URL")
	if ok {
		re, err := regexp.Compile(`(?m)^(?:postgres://)([^:]*)(?::)([^@]*)(?:@)([^:]*)(?::)([^/]*)(?:/)(.*)`)
		if err != nil {
			log.Error(e.Wrap(err, "failed to compile regex"))
		} else {
			matched := re.FindAllStringSubmatch(databaseURL, -1)
			if len(matched) > 0 && len(matched[0]) > 5 {
				username = matched[0][1]
				password = matched[0][2]
				host = matched[0][3]
				port = matched[0][4]
				dbName = matched[0][5]
				sslmode = "require"
			}
		}
	}
	log.Printf("setting up db @ %s\n", host)
	psqlConf := fmt.Sprintf(
		"host=%s port=%s user=%s dbname=%s password=%s sslmode=%s",
		host,
		port,
		username,
		dbName,
		password,
		sslmode)

	var err error

	logLevel := logger.Silent
	if os.Getenv("HIGHLIGHT_DEBUG_MODE") == "blame-GARAGE-spike-typic-neckline-santiago-tore-keep-becalm-preach-fiber-pomade-escheat-crone-tasmania" {
		logLevel = logger.Info
	}
	DB, err = gorm.Open(postgres.Open(psqlConf), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
		Logger:                                   logger.Default.LogMode(logLevel),
		PrepareStmt:                              true,
		SkipDefaultTransaction:                   true,
	})

	if err != nil {
		return nil, e.Wrap(err, "Failed to connect to database")
	}

	log.Printf("running db migration ... \n")
	if err := DB.Exec("CREATE EXTENSION IF NOT EXISTS pgcrypto;").Error; err != nil {
		return nil, e.Wrap(err, "Error installing pgcrypto")
	}
	// Unguessable, cryptographically random url-safe ID for users to share links
	if err := DB.Exec(`
		CREATE OR REPLACE FUNCTION secure_id_generator(OUT result text) AS $$
		BEGIN
			result := encode(gen_random_bytes(21), 'base64');
			result := replace(result, '+', '0');
			result := replace(result, '/', '1');
			result := replace(result, '=', '');
		END;
		$$ LANGUAGE PLPGSQL;
	`).Error; err != nil {
		return nil, e.Wrap(err, "Error creating secure_id_generator")
	}

	if err := DB.AutoMigrate(
		Models...,
	); err != nil {
		return nil, e.Wrap(err, "Error migrating db")
	}

	// Add unique constraint to daily_error_counts
	if err := DB.Exec(`
		DO $$
			BEGIN
				BEGIN
					ALTER TABLE daily_error_counts
					ADD CONSTRAINT date_project_id_error_type_uniq
						UNIQUE (date, project_id, error_type);
				EXCEPTION
					WHEN duplicate_table
					THEN RAISE NOTICE 'daily_error_counts.date_project_id_error_type_uniq already exists';
				END;
			END $$;
	`).Error; err != nil {
		return nil, e.Wrap(err, "Error adding unique constraint on daily_error_counts")
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return nil, e.Wrap(err, "error retrieving underlying sql db")
	}
	sqlDB.SetMaxOpenConns(15)

	switch os.Getenv("DEPLOYMENT_KEY") {
	case "HIGHLIGHT_BEHAVE_HEALTH-i_fgQwbthAdqr9Aat_MzM7iU3!@fKr-_vopjXR@f":
		fallthrough
	case "HIGHLIGHT_ONPREM_BETA":
		// default case, should only exist in main highlight prod
		thresholdWindow := 30
		emptiness := "[]"
		if err := DB.FirstOrCreate(&SessionAlert{
			Alert: Alert{
				ProjectID: 1,
				Type:      &AlertType.SESSION_FEEDBACK,
			},
		}).Attrs(&SessionAlert{
			Alert: Alert{
				ExcludedEnvironments: &emptiness,
				CountThreshold:       1,
				ThresholdWindow:      &thresholdWindow,
				ChannelsToNotify:     &emptiness,
			},
		}).Error; err != nil {
			break
		}
	}

	log.Printf("finished db migration. \n")
	return DB, nil
}

// Implement JSONB interface
type JSONB map[string]interface{}

func (j JSONB) Value() (driver.Value, error) {
	valueString, err := json.Marshal(j)
	return string(valueString), err
}

func (j *JSONB) Scan(value interface{}) error {
	switch v := value.(type) {
	case string:
		if err := json.Unmarshal([]byte(v), &j); err != nil {
			return err
		}
	case []byte:
		if err := json.Unmarshal(v, &j); err != nil {
			return err
		}
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

func (s *Session) SetUserProperties(userProperties map[string]string) error {
	user, err := json.Marshal(userProperties)
	if err != nil {
		return e.Wrapf(err, "[project_id: %d] error marshalling user properties map into bytes", s.ProjectID)
	}
	s.UserProperties = string(user)
	return nil
}

func (s *Session) GetUserProperties() (map[string]string, error) {
	var userProperties map[string]string
	if err := json.Unmarshal([]byte(s.UserProperties), &userProperties); err != nil {
		return nil, e.Wrapf(err, "[project_id: %d] error unmarshalling user properties map into bytes", s.ProjectID)
	}
	return userProperties, nil
}

type SendSlackAlertInput struct {
	Organization *Organization
	// Workspace is a required parameter
	Workspace *Workspace
	// SessionSecureID is a required parameter
	SessionSecureID string
	// UserIdentifier is a required parameter for New User, Error, and SessionFeedback alerts
	UserIdentifier string
	// Group is a required parameter for Error alerts
	Group *ErrorGroup
	// URL is an optional parameter for Error alerts
	URL *string
	// ErrorsCount is a required parameter for Error alerts
	ErrorsCount *int64
	// MatchedFields is a required parameter for Track Properties and User Properties alerts
	MatchedFields []*Field
	// UserProperties is a required parameter for User Properties alerts
	UserProperties map[string]string
	// CommentID is a required parameter for SessionFeedback alerts
	CommentID *int
	// CommentText is a required parameter for SessionFeedback alerts
	CommentText string
}

func (obj *Alert) SendSlackAlert(input *SendSlackAlertInput) error {
	// TODO: combine `error_alerts` and `session_alerts` tables and create unique composite index on (project_id, type)
	if obj == nil {
		return e.New("alert is nil")
	}
	// get alerts channels
	channels, err := obj.GetChannelsToNotify()
	if err != nil {
		return e.Wrap(err, "error getting channels to notify from user properties alert")
	}
	if len(channels) <= 0 {
		return nil
	}
	// get project's channels
	integratedSlackChannels, err := input.Workspace.IntegratedSlackChannels()
	if err != nil {
		return e.Wrap(err, "error getting slack webhook url for alert")
	}
	if len(integratedSlackChannels) <= 0 {
		return nil
	}

	var blockSet []slack.Block
	var textBlock *slack.TextBlockObject
	var msg slack.WebhookMessage
	var messageBlock []*slack.TextBlockObject

	frontendURL := os.Getenv("FRONTEND_URI")
	suffix := ""
	if input.CommentID != nil {
		suffix = fmt.Sprintf("?commentId=%d", *input.CommentID)
	}
	sessionLink := fmt.Sprintf("<%s/%d/sessions/%s%s>", frontendURL, obj.ProjectID, input.SessionSecureID, suffix)
	messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*Session:*\n"+sessionLink, false, false))

	var previewText string
	if obj.Type == nil {
		if input.Group != nil {
			obj.Type = &AlertType.ERROR
		} else {
			obj.Type = &AlertType.NEW_USER
		}
	}
	switch *obj.Type {
	case AlertType.ERROR:
		if input.Group == nil || input.Group.State == ErrorGroupStates.IGNORED {
			return nil
		}
		shortEvent := input.Group.Event
		if len(input.Group.Event) > 50 {
			shortEvent = input.Group.Event[:50] + "..."
		}
		errorLink := fmt.Sprintf("%s/%d/errors/%s", frontendURL, obj.ProjectID, input.Group.SecureID)
		// construct Slack message
		previewText = fmt.Sprintf("Highlight: Error Alert: %s", shortEvent)
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Highlight Error Alert: %d Recent Occurrences*\n\n%s\n<%s/>", *input.ErrorsCount, shortEvent, errorLink), false, false)
		messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*User:*\n"+input.UserIdentifier, false, false))
		if input.URL != nil {
			messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*Visited Url:*\n"+*input.URL, false, false))
		}
		blockSet = append(blockSet, slack.NewSectionBlock(textBlock, messageBlock, nil))
		var actionBlock []slack.BlockElement
		for _, action := range modelInputs.AllErrorState {
			if input.Group.State == string(action) {
				continue
			}

			titleStr := string(action)
			if action == modelInputs.ErrorStateIgnored || action == modelInputs.ErrorStateResolved {
				titleStr = titleStr[:len(titleStr)-1]
			}
			button := slack.NewButtonBlockElement(
				"",
				"click",
				slack.NewTextBlockObject(
					slack.PlainTextType,
					strings.Title(strings.ToLower(titleStr))+" Error",
					false,
					false,
				),
			)
			button.URL = fmt.Sprintf("%s?action=%s", errorLink, strings.ToLower(string(action)))
			actionBlock = append(actionBlock, button)
		}
		blockSet = append(blockSet, slack.NewActionBlock(
			"",
			actionBlock...,
		))
		blockSet = append(blockSet, slack.NewDividerBlock())
		msg.Attachments = []slack.Attachment{
			{
				Color:  "#961e13",
				Blocks: slack.Blocks{BlockSet: blockSet},
			},
		}
	case AlertType.NEW_USER:
		// construct Slack message
		previewText = "Highlight: New User Alert"
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, "*Highlight New User Alert:*\n\n", false, false)
		if input.UserIdentifier != "" {
			messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*User:*\n"+input.UserIdentifier, false, false))
		}
		for k, v := range input.UserProperties {
			if k == "" {
				continue
			}
			if v == "" {
				v = "_empty_"
			}
			messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*%s:*\n%s", strings.Title(strings.ToLower(k)), v), false, false))
		}
		blockSet = append(blockSet, slack.NewSectionBlock(textBlock, messageBlock, nil))
		blockSet = append(blockSet, slack.NewDividerBlock())
		msg.Blocks = &slack.Blocks{BlockSet: blockSet}
	case AlertType.TRACK_PROPERTIES:
		// format matched properties
		var formattedFields []string
		for _, addr := range input.MatchedFields {
			formattedFields = append(formattedFields, fmt.Sprintf("{name: %s, value: %s}", addr.Name, addr.Value))
		}
		// construct Slack message
		previewText = "Highlight: Track Properties Alert"
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, "*Highlight Track Properties Alert:*\n\n", false, false)
		messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Matched Track Properties:*\n%+v", formattedFields), false, false))
		blockSet = append(blockSet, slack.NewSectionBlock(textBlock, messageBlock, nil))
		blockSet = append(blockSet, slack.NewDividerBlock())
		msg.Blocks = &slack.Blocks{BlockSet: blockSet}
	case AlertType.USER_PROPERTIES:
		// format matched properties
		var formattedFields []string
		for _, addr := range input.MatchedFields {
			formattedFields = append(formattedFields, fmt.Sprintf("{name: %s, value: %s}", addr.Name, addr.Value))
		}
		// construct Slack message
		previewText = "Highlight: User Properties Alert"
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, "*Highlight User Properties Alert:*\n\n", false, false)
		messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Matched User Properties:*\n%+v", formattedFields), false, false))
		blockSet = append(blockSet, slack.NewSectionBlock(textBlock, messageBlock, nil))
		blockSet = append(blockSet, slack.NewDividerBlock())
		msg.Blocks = &slack.Blocks{BlockSet: blockSet}
	case AlertType.SESSION_FEEDBACK:
		previewText = "Highlight: Session Feedback Alert"
		if input.UserIdentifier == "" {
			input.UserIdentifier = "User"
		}
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*%s Left Feedback*\n\n%s", input.UserIdentifier, input.CommentText), false, false)
		blockSet = append(blockSet, slack.NewSectionBlock(textBlock, messageBlock, nil))
		blockSet = append(blockSet, slack.NewDividerBlock())
		msg.Blocks = &slack.Blocks{BlockSet: blockSet}
	case AlertType.NEW_SESSION:
		identifier := input.UserIdentifier
		if identifier == "" {
			identifier = "User"
		}
		previewText = fmt.Sprintf("Highlight: New Session Created By %s", identifier)
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*New Session Created By User: %s*\n\n", input.UserIdentifier), false, false)
		blockSet = append(blockSet, slack.NewSectionBlock(textBlock, messageBlock, nil))
		blockSet = append(blockSet, slack.NewDividerBlock())
		msg.Blocks = &slack.Blocks{BlockSet: blockSet}
	}

	msg.Text = previewText

	var slackClient *slack.Client
	if input.Workspace.SlackAccessToken != nil {
		slackClient = slack.New(*input.Workspace.SlackAccessToken)
	}
	log.Printf("Sending Slack Alert for project: %d session: %s", input.Workspace.ID, input.SessionSecureID)

	// send message
	for _, channel := range channels {
		if channel.WebhookChannel != nil {
			var slackWebhookURL string
			isWebhookChannel := false

			// Find the webhook URL
			for _, ch := range integratedSlackChannels {
				if id := channel.WebhookChannelID; id != nil && ch.WebhookChannelID == *id {
					slackWebhookURL = ch.WebhookURL

					if ch.WebhookAccessToken != "" {
						isWebhookChannel = true
					}
					break
				}
			}

			if slackWebhookURL == "" && isWebhookChannel {
				log.WithFields(log.Fields{"workspace_id": input.Workspace.ID}).
					Error("requested channel has no matching slackWebhookURL")
				continue
			}

			msg.Channel = *channel.WebhookChannel
			slackChannelId := *channel.WebhookChannelID
			slackChannelName := *channel.WebhookChannel

			go func() {
				if isWebhookChannel {
					log.Printf("Sending Slack Webhook")
					err := slack.PostWebhook(
						slackWebhookURL,
						&msg,
					)
					if err != nil {
						log.WithFields(log.Fields{"workspace_id": input.Workspace.ID, "slack_webhook_url": slackWebhookURL, "message": fmt.Sprintf("%+v", msg)}).
							Error(e.Wrap(err, "error sending slack msg via webhook"))
					}
				} else {
					// The Highlight Slack bot needs to join the channel before it can send a message.
					// Slack handles a bot trying to join a channel it already is a part of, we don't need to handle it.
					log.Printf("Sending Slack Bot Message")
					if slackClient != nil {
						if strings.Contains(slackChannelName, "#") {
							_, _, _, err := slackClient.JoinConversation(slackChannelId)
							if err != nil {
								log.Error(e.Wrap(err, "failed to join slack channel"))
							}
						}
						_, _, err := slackClient.PostMessage(slackChannelId, slack.MsgOptionBlocks(blockSet...))
						if err != nil {
							log.WithFields(log.Fields{"workspace_id": input.Workspace.ID, "message": fmt.Sprintf("%+v", msg)}).
								Error(e.Wrap(err, "error sending slack msg via bot api"))
						}

					} else {
						log.Printf("Slack Bot Client was not defined")
					}
				}
			}()
		}
	}
	return nil
}
