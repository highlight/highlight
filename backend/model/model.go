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
}{
	ERROR:            "ERROR_ALERT",
	NEW_USER:         "NEW_USER_ALERT",
	TRACK_PROPERTIES: "TRACK_PROPERTIES_ALERT",
	USER_PROPERTIES:  "USER_PROPERTIES_ALERT",
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
	ID        int        `gorm:"primary_key;type:serial" json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at"`
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

type Alert struct {
	OrganizationID       int
	ExcludedEnvironments *string
	CountThreshold       int
	ThresholdWindow      *int
	ChannelsToNotify     *string
	Type                 *string `gorm:"index"`
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

func (u *Organization) IntegratedSlackChannels() ([]SlackChannel, error) {
	parsedChannels := []SlackChannel{}
	if u.SlackChannels != nil {
		err := json.Unmarshal([]byte(*u.SlackChannels), &parsedChannels)
		if err != nil {
			return nil, e.Wrap(err, "error parsing details json")
		}
	}
	repeat := false
	for _, c := range parsedChannels {
		if u.SlackWebhookChannelID != nil && c.WebhookChannelID == *u.SlackWebhookChannelID {
			repeat = true
		}
	}
	if u.SlackWebhookChannel != nil && !repeat {
		parsedChannels = append(parsedChannels, SlackChannel{
			WebhookAccessToken: *u.SlackAccessToken,
			WebhookURL:         *u.SlackWebhookURL,
			WebhookChannel:     *u.SlackWebhookChannel,
			WebhookChannelID:   *u.SlackWebhookChannelID,
		})
	}
	return parsedChannels, nil
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
	Name            *string
	Email           *string
	PhotoURL        *string          `json:"photo_url"`
	UID             *string          `gorm:"unique_index"`
	Organizations   []Organization   `gorm:"many2many:organization_admins;"`
	SessionComments []SessionComment `gorm:"many2many:session_comment_admins;"`
	ErrorComments   []ErrorComment   `gorm:"many2many:error_comment_admins;"`
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
	UserID      int `json:"user_id"`
	Fingerprint int `json:"fingerprint"`
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

// AreModelsWeaklyEqual compares two structs of the same type while ignoring the Model field
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
	aField := aReflection.Elem().FieldByName("Model")

	bReflection := reflect.ValueOf(b)
	// Check if the passed interface is a pointer
	if bReflection.Type().Kind() != reflect.Ptr {
		return false, nil, e.New("`b` is not a pointer")
	}
	// 'dereference' with Elem() and get the field by name
	bField := bReflection.Elem().FieldByName("Model")

	if aField.IsValid() && bField.IsValid() {
		// override Model on b with a's model
		bField.Set(aField)
	} else if aField.IsValid() || bField.IsValid() {
		// return error if one has a model and the other doesn't
		return false, nil, e.New("one interface has a model and the other doesn't")
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
	Value          string
	OrganizationID int       `json:"organization_id"`
	Sessions       []Session `gorm:"many2many:session_fields;"`
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
	OrganizationID int
}

type DailySessionCount struct {
	Model
	Date           *time.Time `json:"date"`
	Count          int64      `json:"count"`
	OrganizationID int
}

type DailyErrorCount struct {
	Model
	Date           *time.Time `json:"date"`
	Count          int64      `json:"count"`
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
	Trace          *string   `json:"trace"` //DEPRECATED, USE STACKTRACE INSTEAD
	StackTrace     *string   `json:"stack_trace"`
	Timestamp      time.Time `json:"timestamp"`
	Payload        *string   `json:"payload"`
	Environment    string
	Fields         []*ErrorField `gorm:"many2many:error_object_fields;"`
}

type ErrorGroup struct {
	Model
	OrganizationID   int
	Event            string
	Type             string
	Trace            string //DEPRECATED, USE STACKTRACE INSTEAD
	StackTrace       string
	MappedStackTrace *string
	State            string `json:"state" gorm:"default:OPEN"`
	MetadataLog      *string
	Fields           []*ErrorField `gorm:"many2many:error_group_fields;"`
	FieldGroup       *string       // DEPRECATED, USE FIELDS INSTEAD
	Environments     string
}

type ErrorField struct {
	Model
	OrganizationID int
	Type           *string       `gorm:"index"` // types: meta, payload
	Name           string        `gorm:"uniqueIndex:idx_error_field_name_value,priority:1"`
	Value          string        `gorm:"uniqueIndex:idx_error_field_name_value,priority:2"`
	ErrorGroups    []ErrorGroup  `gorm:"many2many:error_group_fields;"`
	ErrorObjects   []ErrorObject `gorm:"many2many:error_object_fields;"`
}

var ErrorFieldType = struct {
	META_DATA string
	PAYLOAD   string
}{
	META_DATA: "META",
	PAYLOAD:   "PAYLOAD",
}

type SessionComment struct {
	Model
	Admins         []Admin `gorm:"many2many:session_comment_admins;"`
	OrganizationID int
	AdminId        int
	SessionId      int
	Timestamp      int
	Text           string
	XCoordinate    float64
	YCoordinate    float64
}

type ErrorComment struct {
	Model
	Admins         []Admin `gorm:"many2many:error_comment_admins;"`
	OrganizationID int
	AdminId        int
	ErrorId        int
	Text           string
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
	if err := DB.AutoMigrate(
		Models...,
	); err != nil {
		return nil, e.Wrap(err, "Error migrating db")
	}
	sqlDB, err := DB.DB()
	if err != nil {
		return nil, e.Wrap(err, "error retrieving underlying sql db")
	}
	sqlDB.SetMaxOpenConns(15)
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
		return e.Wrapf(err, "[org_id: %d] error marshalling user properties map into bytes", s.OrganizationID)
	}
	s.UserProperties = string(user)
	return nil
}

func (s *Session) GetUserProperties() (map[string]string, error) {
	var userProperties map[string]string
	if err := json.Unmarshal([]byte(s.UserProperties), &userProperties); err != nil {
		return nil, e.Wrapf(err, "[org_id: %d] error unmarshalling user properties map into bytes", s.OrganizationID)
	}
	return userProperties, nil
}

func (obj *Alert) SendSlackAlert(organization *Organization, sessionId int, userIdentifier string, group *ErrorGroup, url *string, matchedFields []*Field, userProperties map[string]string, numErrors *int64) error {
	if obj == nil {
		return e.New("alert is nil")
	}
	// get alerts channels
	channels, err := obj.GetChannelsToNotify()
	if err != nil {
		return e.Wrap(err, "error getting channels to notify from user properties alert")
	}
	// get organization's channels
	integratedSlackChannels, err := organization.IntegratedSlackChannels()
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
	sessionLink := fmt.Sprintf("<%s/%d/sessions/%d/>", frontendURL, obj.OrganizationID, sessionId)
	messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*Session:*\n"+sessionLink, false, false))

	if obj.Type == nil {
		if group != nil {
			obj.Type = &AlertType.ERROR
		} else {
			obj.Type = &AlertType.NEW_USER
		}
	}
	switch *obj.Type {
	case AlertType.ERROR:
		if group == nil || group.State == ErrorGroupStates.IGNORED {
			return nil
		}
		shortEvent := group.Event
		if len(group.Event) > 50 {
			shortEvent = group.Event[:50] + "..."
		}
		errorLink := fmt.Sprintf("%s/%d/errors/%d", frontendURL, obj.OrganizationID, group.ID)
		// construct slack message
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Highlight Error Alert: %d Recent Occurrences*\n\n%s\n<%s/>", *numErrors, shortEvent, errorLink), false, false)
		messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*User:*\n"+userIdentifier, false, false))
		if url != nil {
			messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*Visited Url:*\n"+*url, false, false))
		}
		blockSet = append(blockSet, slack.NewSectionBlock(textBlock, messageBlock, nil))
		var actionBlock []slack.BlockElement
		for _, action := range modelInputs.AllErrorState {
			if group.State == string(action) {
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
		// construct slack message
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, "*Highlight New User Alert:*\n\n", false, false)
		if userIdentifier != "" {
			messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*User:*\n"+userIdentifier, false, false))
		}
		for k, v := range userProperties {
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
		for _, addr := range matchedFields {
			formattedFields = append(formattedFields, fmt.Sprintf("{name: %s, value: %s}", addr.Name, addr.Value))
		}
		// construct slack message
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, "*Highlight Track Properties Alert:*\n\n", false, false)
		messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Matched Track Properties:*\n%+v", formattedFields), false, false))
		blockSet = append(blockSet, slack.NewSectionBlock(textBlock, messageBlock, nil))
		blockSet = append(blockSet, slack.NewDividerBlock())
		msg.Blocks = &slack.Blocks{BlockSet: blockSet}
	case AlertType.USER_PROPERTIES:
		// format matched properties
		var formattedFields []string
		for _, addr := range matchedFields {
			formattedFields = append(formattedFields, fmt.Sprintf("{name: %s, value: %s}", addr.Name, addr.Value))
		}
		// construct slack message
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, "*Highlight User Properties Alert:*\n\n", false, false)
		messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Matched User Properties:*\n%+v", formattedFields), false, false))
		blockSet = append(blockSet, slack.NewSectionBlock(textBlock, messageBlock, nil))
		blockSet = append(blockSet, slack.NewDividerBlock())
		msg.Blocks = &slack.Blocks{BlockSet: blockSet}
	}

	// send message
	for _, channel := range channels {
		if channel.WebhookChannel != nil {
			var slackWebhookURL string
			for _, ch := range integratedSlackChannels {
				if id := channel.WebhookChannelID; id != nil && ch.WebhookChannelID == *id {
					slackWebhookURL = ch.WebhookURL
					break
				}
			}
			if slackWebhookURL == "" {
				log.WithFields(log.Fields{"org_id": organization.ID}).
					Error("requested channel has no matching slackWebhookURL")
				continue
			}
			msg.Channel = *channel.WebhookChannel
			go func() {
				err := slack.PostWebhook(
					slackWebhookURL,
					&msg,
				)
				if err != nil {
					log.WithFields(log.Fields{"org_id": organization.ID, "slack_webhook_url": slackWebhookURL, "message": fmt.Sprintf("%+v", msg)}).
						Error(e.Wrap(err, "error sending slack msg"))
				}
			}()
		}
	}
	return nil
}
