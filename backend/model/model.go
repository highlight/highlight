package model

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"reflect"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"time"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"

	"github.com/go-test/deep"
	Email "github.com/highlight-run/highlight/backend/email"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgerrcode"

	"github.com/ReneKroon/ttlcache"
	"github.com/lib/pq"
	"github.com/mitchellh/mapstructure"
	"github.com/rs/xid"
	"github.com/sendgrid/sendgrid-go"
	"github.com/slack-go/slack"
	"github.com/speps/go-hashids"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/logger"

	"github.com/pkg/errors"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

var (
	DB                *gorm.DB
	HashID            *hashids.HashID
	emailHistoryCache *ttlcache.Cache
	F                 = false
	T                 = true
)

const (
	SUGGESTION_LIMIT_CONSTANT       = 8
	EVENTS_OBJECTS_ADVISORY_LOCK_ID = 1337
	InternalMetricCategory          = "__internal"
	AWS_REGION_US_EAST_2            = "us-east-2"
)

// TODO(et) - replace this with generated SessionAlertType
var AlertType = struct {
	ERROR            string
	NEW_USER         string
	TRACK_PROPERTIES string
	USER_PROPERTIES  string
	SESSION_FEEDBACK string
	RAGE_CLICK       string
	NEW_SESSION      string
}{
	ERROR:            "ERROR_ALERT",
	NEW_USER:         "NEW_USER_ALERT",
	TRACK_PROPERTIES: "TRACK_PROPERTIES_ALERT",
	USER_PROPERTIES:  "USER_PROPERTIES_ALERT",
	SESSION_FEEDBACK: "SESSION_FEEDBACK_ALERT",
	RAGE_CLICK:       "RAGE_CLICK_ALERT",
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
	Email          contextString
	AcceptEncoding contextString
	ZapierToken    contextString
	ZapierProject  contextString
	SessionId      contextString
}{
	IP:             "ip",
	UserAgent:      "userAgent",
	AcceptLanguage: "acceptLanguage",
	UID:            "uid",
	Email:          "email",
	AcceptEncoding: "acceptEncoding",
	ZapierToken:    "parsedToken",
	ZapierProject:  "project",
	SessionId:      "sessionId",
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
	&SessionInterval{},
	&TimelineIndicatorEvent{},
	&DailySessionCount{},
	&DailyErrorCount{},
	&Field{},
	&EmailSignup{},
	&ResourcesObject{},
	&ExternalAttachment{},
	&SessionComment{},
	&SessionCommentTag{},
	&ErrorComment{},
	&CommentReply{},
	&CommentFollower{},
	&CommentSlackThread{},
	&ErrorAlert{},
	&SessionAlert{},
	&Project{},
	&RageClickEvent{},
	&Workspace{},
	&WorkspaceAdmin{},
	&WorkspaceInviteLink{},
	&WorkspaceAccessRequest{},
	&EnhancedUserDetails{},
	&AlertEvent{},
	&RegistrationData{},
	&MetricGroup{},
	&Metric{},
	&MetricMonitor{},
	&ErrorFingerprint{},
	&EventChunk{},
	&SavedAsset{},
	&Dashboard{},
	&DashboardMetric{},
	&DashboardMetricFilter{},
	&DeleteSessionsTask{},
	&VercelIntegrationConfig{},
	&OAuthClientStore{},
	&ResthookSubscription{},
	&IntegrationProjectMapping{},
	&IntegrationWorkspaceMapping{},
	&EmailOptOut{},
	&BillingEmailHistory{},
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

	emailHistoryCache = ttlcache.NewCache()
	emailHistoryCache.SetTTL(15 * time.Minute)
	emailHistoryCache.SkipTtlExtensionOnHit(true)
}

type Model struct {
	ID        int        `gorm:"primary_key;type:serial" json:"id" deep:"-"`
	CreatedAt time.Time  `json:"created_at" deep:"-"`
	UpdatedAt time.Time  `json:"updated_at" deep:"-"`
	DeletedAt *time.Time `json:"deleted_at" deep:"-"`
}

type Int64Model struct {
	ID        int64      `gorm:"primary_key;type:bigserial" json:"id" deep:"-"`
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
	Name                        *string
	Secret                      *string // Needed for workspace-level team
	Admins                      []Admin `gorm:"many2many:workspace_admins;"`
	SlackAccessToken            *string
	SlackWebhookURL             *string
	SlackWebhookChannel         *string
	SlackWebhookChannelID       *string
	SlackChannels               *string
	LinearAccessToken           *string
	VercelAccessToken           *string
	VercelTeamID                *string
	Projects                    []Project
	MigratedFromProjectID       *int // Column can be removed after migration is done
	HubspotCompanyID            *int
	StripeCustomerID            *string
	StripePriceID               *string
	PlanTier                    string `gorm:"default:Free"`
	UnlimitedMembers            bool   `gorm:"default:false"`
	BillingPeriodStart          *time.Time
	BillingPeriodEnd            *time.Time
	NextInvoiceDate             *time.Time
	MonthlySessionLimit         *int
	MonthlyMembersLimit         *int
	TrialEndDate                *time.Time `json:"trial_end_date"`
	AllowMeterOverage           bool       `gorm:"default:true"`
	AllowedAutoJoinEmailOrigins *string    `json:"allowed_auto_join_email_origins"`
	EligibleForTrialExtension   bool       `gorm:"default:false"`
	TrialExtensionEnabled       bool       `gorm:"default:false"`
	ClearbitEnabled             bool       `gorm:"default:false"`
	DiscordGuildId              *string
	ClickupAccessToken          *string
	PromoCode                   *string
}

type WorkspaceAdmin struct {
	AdminID     int        `gorm:"primaryKey"`
	WorkspaceID int        `gorm:"primaryKey"`
	CreatedAt   time.Time  `json:"created_at" deep:"-"`
	UpdatedAt   time.Time  `json:"updated_at" deep:"-"`
	DeletedAt   *time.Time `json:"deleted_at" deep:"-"`
	Role        *string    `json:"role" gorm:"default:ADMIN"`
}

type WorkspaceAdminRole struct {
	Admin *Admin
	Role  string
}

type WorkspaceInviteLink struct {
	Model
	WorkspaceID    *int
	InviteeEmail   *string
	InviteeRole    *string
	ExpirationDate *time.Time
	Secret         *string
}

type WorkspaceAccessRequest struct {
	Model
	AdminID                int `gorm:"uniqueIndex"`
	LastRequestedWorkspace int
}

type Project struct {
	Model
	Name                *string
	StripeCustomerID    *string
	StripePriceID       *string
	ZapierAccessToken   *string
	FrontAccessToken    *string
	FrontRefreshToken   *string
	FrontTokenExpiresAt *time.Time
	BillingEmail        *string
	Secret              *string    `json:"-"`
	Admins              []Admin    `gorm:"many2many:project_admins;"`
	TrialEndDate        *time.Time `json:"trial_end_date"`
	// Manual monthly session limit override
	MonthlySessionLimit *int
	WorkspaceID         int
	FreeTier            bool           `gorm:"default:false"`
	ExcludedUsers       pq.StringArray `json:"excluded_users" gorm:"type:text[]"`
	ErrorJsonPaths      pq.StringArray `gorm:"type:text[]"`

	// During metrics querying for network requests, only keep these relevant URLs
	BackendDomains pq.StringArray `gorm:"type:text[]"`

	// BackendSetup will be true if this is the session where HighlightBackend is run for the first time
	BackendSetup *bool `json:"backend_setup"`

	// Maximum time window considered for a rage click event
	RageClickWindowSeconds int `gorm:"default:5"`
	// Maximum distance between clicks for a rage click event
	RageClickRadiusPixels int `gorm:"default:8"`
	// Minimum count of clicks in a rage click event
	RageClickCount int `gorm:"default:5"`
}

type HasSecret interface {
	GetSecret() *string
}

func (project *Project) GetSecret() *string     { return project.Secret }
func (workspace *Workspace) GetSecret() *string { return workspace.Secret }

type EnhancedUserDetails struct {
	Model
	Email       *string `gorm:"uniqueIndex"`
	PersonJSON  *string
	CompanyJSON *string
}

type ResthookSubscription struct {
	Model
	ProjectID int     `json:"project_id"`
	Event     *string `json:"event"`
	TargetUrl *string `json:"target_url"`
}

type RegistrationData struct {
	Model
	WorkspaceID int
	TeamSize    *string
	Role        *string
	UseCase     *string
	HeardAbout  *string
	Pun         *string
}

type Dashboard struct {
	Model
	ProjectID         int `gorm:"index;not null;"`
	Name              string
	LastAdminToEditID *int
	Layout            *string
	Metrics           []*DashboardMetric `gorm:"foreignKey:DashboardID;"`
	IsDefault         *bool
}

type DashboardMetric struct {
	Model
	DashboardID              int `gorm:"index;not null;"`
	Name                     string
	Description              string
	ComponentType            *modelInputs.MetricViewComponentType
	ChartType                *modelInputs.DashboardChartType
	Aggregator               *modelInputs.MetricAggregator `gorm:"default:P50"`
	MaxGoodValue             *float64
	MaxNeedsImprovementValue *float64
	PoorValue                *float64
	Units                    *string
	HelpArticle              *string
	MinValue                 *float64
	MinPercentile            *float64
	MaxValue                 *float64
	MaxPercentile            *float64
	Filters                  []*DashboardMetricFilter `gorm:"foreignKey:MetricID"`
	Groups                   pq.StringArray           `gorm:"type:text[]"`
}

type DashboardMetricFilter struct {
	Model
	MetricID        int
	MetricMonitorID int
	Tag             string
	Op              modelInputs.MetricTagFilterOp `gorm:"default:equals"`
	Value           string
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

func FromVerboseID(verboseId string) (int, error) {
	// Try to convert the id to an integer in the case that the client is out of date.
	if projectID, err := strconv.Atoi(verboseId); err == nil {
		return projectID, nil
	}
	// Otherwise, decode with HashID library
	ints := HashID.Decode(verboseId)
	if len(ints) != 1 {
		return 1, e.Errorf("An unsupported verboseID was used: %s", verboseId)
	}
	return ints[0], nil
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
	Name                   *string
	FirstName              *string
	LastName               *string
	HubspotContactID       *int
	Email                  *string
	AboutYouDetailsFilled  *bool
	Phone                  *string
	NumberOfSessionsViewed *int
	EmailVerified          *bool            `gorm:"default:false"`
	PhotoURL               *string          `json:"photo_url"`
	UID                    *string          `gorm:"uniqueIndex"`
	Organizations          []Organization   `gorm:"many2many:organization_admins;"`
	Projects               []Project        `gorm:"many2many:project_admins;"`
	SessionComments        []SessionComment `gorm:"many2many:session_comment_admins;"`
	ErrorComments          []ErrorComment   `gorm:"many2many:error_comment_admins;"`
	Workspaces             []Workspace      `gorm:"many2many:workspace_admins;"`
	SlackIMChannelID       *string
	// How/where this user was referred from to sign up to Highlight.
	Referral *string `json:"referral"`
	// This is the role the Admin has specified. This is their role in their organization, not within Highlight. This should not be used for authorization checks.
	UserDefinedRole    *string `json:"user_defined_role"`
	UserDefinedPersona *string `json:"user_defined_persona"`
}

type EmailSignup struct {
	Model
	Email               string `gorm:"uniqueIndex"`
	ApolloData          string
	ApolloDataShortened string
}

type SessionsHistogram struct {
	BucketTimes           []time.Time `json:"bucket_times"`
	SessionsWithoutErrors []int64     `json:"sessions_without_errors"`
	SessionsWithErrors    []int64     `json:"sessions_with_errors"`
	TotalSessions         []int64     `json:"total_sessions"`
}

type SessionResults struct {
	Sessions   []Session
	TotalCount int64
}

type Session struct {
	Model
	// The ID used publicly for the URL on the client; used for sharing
	SecureID string `json:"secure_id" gorm:"uniqueIndex;not null;default:secure_id_generator()"`
	// For associating unidentified sessions with a user after identification
	ClientID string `json:"client_id" gorm:"index:idx_client_project,option:CONCURRENTLY;not null;default:''"`
	// Whether a session has been identified.
	Identified  bool `json:"identified" gorm:"default:false;not null"`
	Fingerprint int  `json:"fingerprint"`
	// User provided identifier (see IdentifySession)
	Identifier     string `json:"identifier"`
	OrganizationID int    `json:"organization_id"`
	ProjectID      int    `json:"project_id" gorm:"index:idx_client_project,option:CONCURRENTLY"`
	// Location data based off user ip (see InitializeSession)
	City      string  `json:"city"`
	State     string  `json:"state"`
	Postal    string  `json:"postal"`
	Country   string  `json:"country"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	// Details based off useragent (see Initialize Session)
	OSName         string `json:"os_name"`
	OSVersion      string `json:"os_version"`
	BrowserName    string `json:"browser_name"`
	BrowserVersion string `json:"browser_version"`
	Language       string `json:"language"`
	// Tells us if 'beforeunload' was fired on the client - note this is not necessarily fired on every session end
	HasUnloaded bool `gorm:"default:false"`
	// Tells us if the session has been parsed by a worker.
	Processed           *bool `json:"processed"`
	HasRageClicks       *bool `json:"has_rage_clicks"`
	HasErrors           *bool `json:"has_errors"`
	HasOutOfOrderEvents bool  `gorm:"default:false"`
	// The timestamp of the first payload received after the session got processed (if applicable)
	ResumedAfterProcessedTime *time.Time `json:"resumed_after_processed_time"`
	// The length of a session.
	Length         int64    `json:"length"`
	ActiveLength   int64    `json:"active_length"`
	Fields         []*Field `json:"fields" gorm:"many2many:session_fields;"`
	Environment    string   `json:"environment"`
	AppVersion     *string  `json:"app_version" gorm:"index"`
	UserObject     JSONB    `json:"user_object" sql:"type:jsonb"`
	UserProperties string   `json:"user_properties"`
	// Whether this is the first session created by this user.
	FirstTime               *bool      `json:"first_time" gorm:"default:false"`
	PayloadUpdatedAt        *time.Time `json:"payload_updated_at"`
	LastUserInteractionTime time.Time  `json:"last_user_interaction_time" gorm:"default:TIMESTAMP 'epoch'"`
	// Set if the last payload was a beacon; cleared on the next non-beacon payload
	BeaconTime *time.Time `json:"beacon_time"`
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
	// EventCounts is a len()=100 slice that contains the count of events for the session normalized over 100 points
	EventCounts *string
	// Number of pages visited during a session
	PagesVisited int

	ObjectStorageEnabled  *bool   `json:"object_storage_enabled"`
	DirectDownloadEnabled bool    `json:"direct_download_enabled" gorm:"default:false"`
	AllObjectsCompressed  bool    `json:"all_resources_compressed" gorm:"default:false"`
	PayloadSize           *int64  `json:"payload_size"`
	MigrationState        *string `json:"migration_state"`
	VerboseID             string  `json:"verbose_id"`

	// Excluded will be true when we would typically have deleted the session
	Excluded *bool `gorm:"default:false"`

	// Lock is the timestamp at which a session was locked
	// - when selecting sessions, ignore Locks that are > 10 minutes old
	//   ex. SELECT * FROM sessions WHERE (lock IS NULL OR lock < NOW() - 10 * (INTERVAL '1 MINUTE'))
	Lock sql.NullTime

	RetryCount int

	// Represents the admins that have viewed this session.
	ViewedByAdmins []Admin `json:"viewed_by_admins" gorm:"many2many:session_admins_views;"`

	Chunked          *bool
	ProcessWithRedis bool
}

type EventChunk struct {
	Model
	SessionID  int `gorm:"index"`
	ChunkIndex int
	Timestamp  int64
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
	Int64Model
	// 'user_property', 'session_property'.
	Type string `gorm:"uniqueIndex:idx_fields_type_name_value_project_id"`
	// 'email', 'identifier', etc.
	Name string `gorm:"uniqueIndex:idx_fields_type_name_value_project_id"`
	// 'email@email.com'
	Value     string    `gorm:"uniqueIndex:idx_fields_type_name_value_project_id"`
	ProjectID int       `json:"project_id" gorm:"uniqueIndex:idx_fields_type_name_value_project_id"`
	Sessions  []Session `gorm:"many2many:session_fields;"`
}

type ResourcesObject struct {
	Model
	ID        int `json:"id"` // Shadow Model.ID to avoid creating a pkey constraint
	SessionID int
	Resources string
	IsBeacon  bool `gorm:"default:false"`
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
	Query                   *string         `json:"query"`
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

const (
	SESSIONS_TBL                    = "sessions"
	DAILY_ERROR_COUNTS_TBL          = "daily_error_counts"
	DAILY_ERROR_COUNTS_UNIQ         = "date_project_id_error_type_uniq"
	METRIC_GROUPS_NAME_SESSION_UNIQ = "metric_groups_name_session_uniq"
	DASHBOARD_METRIC_FILTERS_UNIQ   = "dashboard_metric_filters_uniq"
)

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
	ID        int `json:"id"` // Shadow Model.ID to avoid creating a pkey constraint
	SessionID int
	Messages  string
	IsBeacon  bool `gorm:"default:false"`
}

type Metric struct {
	CreatedAt     time.Time `json:"created_at" deep:"-" gorm:"index"`
	MetricGroupID int       `gorm:"index"`
	Name          string    `gorm:"index;not null;"`
	Value         float64   `gorm:"index"`
	Category      string    `gorm:"index"`
}

type MetricGroup struct {
	ID        int       `gorm:"primary_key;type:bigserial" json:"id" deep:"-"`
	GroupName string    // index with session_id
	SessionID int       // index with Name
	ProjectID int       `gorm:"index;not null;"`
	Metrics   []*Metric `gorm:"foreignKey:MetricGroupID;"`
}

type MetricMonitor struct {
	Model
	ProjectID         int `gorm:"index;not null;"`
	Name              string
	Aggregator        modelInputs.MetricAggregator `gorm:"default:P50"`
	PeriodMinutes     *int                         // apply aggregator function on PeriodMinutes lookback
	Threshold         float64
	Units             *string // Threshold value is in these Units.
	MetricToMonitor   string
	ChannelsToNotify  *string                  `gorm:"channels_to_notify"`
	EmailsToNotify    *string                  `gorm:"emails_to_notify"`
	LastAdminToEditID int                      `gorm:"last_admin_to_edit_id"`
	Disabled          *bool                    `gorm:"default:false"`
	Filters           []*DashboardMetricFilter `gorm:"foreignKey:MetricMonitorID"`
	AlertIntegrations
}

func (m *MessagesObject) Contents() string {
	return m.Messages
}

type EventsObject struct {
	Model
	ID        int `json:"id"` // Shadow Model.ID to avoid creating a pkey constraint
	SessionID int
	Events    string
	IsBeacon  bool `gorm:"default:false"`
}

func (m *EventsObject) Contents() string {
	return m.Events
}

const PARTITION_SESSION_ID = 30000000

type ErrorsHistogram struct {
	BucketTimes  []time.Time `json:"bucket_times"`
	ErrorObjects []int64     `json:"error_objects"`
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
	Query      *string                 `json:"query"`
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
	ID               int `gorm:"primary_key;type:serial;index:idx_error_group_id_id,priority:2,option:CONCURRENTLY" json:"id" deep:"-"`
	OrganizationID   int
	ProjectID        int `json:"project_id"`
	SessionID        int
	ErrorGroupID     int `gorm:"index:idx_error_group_id_id,priority:1,option:CONCURRENTLY"`
	Event            string
	Type             string
	URL              string
	Source           string
	LineNumber       int
	ColumnNumber     int
	OS               string
	Browser          string
	Trace            *string `json:"trace"` //DEPRECATED, USE STACKTRACE INSTEAD
	StackTrace       *string `json:"stack_trace"`
	MappedStackTrace *string
	Timestamp        time.Time `json:"timestamp"`
	Payload          *string   `json:"payload"`
	Environment      string
	RequestID        *string // From X-Highlight-Request header
	IsBeacon         bool    `gorm:"default:false"`
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
	SnoozedUntil     *time.Time    `json:"snoozed_until"`
	Fields           []*ErrorField `gorm:"many2many:error_group_fields;" json:"fields"`
	Fingerprints     []*ErrorFingerprint
	FieldGroup       *string
	Environments     string
	IsPublic         bool    `gorm:"default:false"`
	ErrorFrequency   []int64 `gorm:"-"`
	ErrorMetrics     []*struct {
		ErrorGroupID int
		Date         time.Time
		Name         string
		Value        int64
	} `gorm:"-"`
	FirstOccurrence *time.Time `gorm:"-"`
	LastOccurrence  *time.Time `gorm:"-"`
}

type ErrorInstance struct {
	ErrorObject ErrorObject `json:"error_object"`
	NextID      *int        `json:"next_id"`
	PreviousID  *int        `json:"previous_id"`
}

type ErrorField struct {
	Model
	OrganizationID int
	ProjectID      int `json:"project_id"`
	Name           string
	Value          string
	ErrorGroups    []ErrorGroup `gorm:"many2many:error_group_fields;"`
}

type FingerprintType string

var Fingerprint = struct {
	StackFrameCode     FingerprintType
	StackFrameMetadata FingerprintType
	JsonResult         FingerprintType
}{
	StackFrameCode:     "CODE",
	StackFrameMetadata: "META",
	JsonResult:         "JSON",
}

type ErrorFingerprint struct {
	Model
	ProjectID    int
	ErrorGroupId int
	Type         FingerprintType
	Value        string
	Index        int
}

type ExternalAttachment struct {
	Model
	IntegrationType modelInputs.IntegrationType

	ExternalID string
	Title      string

	SessionCommentID int `gorm:"index"`
	ErrorCommentID   int `gorm:"index"`

	Removed bool `gorm:"default:false"`
}

type SessionCommentTag struct {
	Model
	SessionComments []SessionComment `json:"session_comments" gorm:"many2many:session_tags;"`
	ProjectID       int              `json:"project_id"`
	Name            string
}

type SessionComment struct {
	Model
	Admins          []Admin `gorm:"many2many:session_comment_admins;"`
	OrganizationID  int
	ProjectID       int `json:"project_id"`
	AdminId         int
	SessionId       int
	SessionSecureId string `gorm:"index;not null;default:''"`
	SessionImage    string
	Timestamp       int
	Text            string
	XCoordinate     float64
	YCoordinate     float64
	Type            string                `json:"type" gorm:"default:ADMIN"`
	Metadata        JSONB                 `json:"metadata" gorm:"type:jsonb"`
	Tags            []*SessionCommentTag  `json:"tags" gorm:"many2many:session_tags;"`
	Attachments     []*ExternalAttachment `gorm:"foreignKey:SessionCommentID"`
	Replies         []*CommentReply       `gorm:"foreignKey:SessionCommentID"`
	Followers       []*CommentFollower    `gorm:"foreignKey:SessionCommentID"`
	Threads         []*CommentSlackThread `gorm:"foreignKey:SessionCommentID"`
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
	Attachments    []*ExternalAttachment `gorm:"foreignKey:ErrorCommentID"`
	Replies        []*CommentReply       `gorm:"foreignKey:ErrorCommentID"`
	Followers      []*CommentFollower    `gorm:"foreignKey:ErrorCommentID"`
	Threads        []*CommentSlackThread `gorm:"foreignKey:ErrorCommentID"`
}

type CommentReply struct {
	Model
	SessionCommentID int `gorm:"index"`
	ErrorCommentID   int `gorm:"index"`

	Admins  []Admin `gorm:"many2many:comment_reply_admins;"`
	AdminId int
	Text    string
}

type CommentFollower struct {
	Model
	SessionCommentID int `gorm:"index"`
	ErrorCommentID   int `gorm:"index"`

	AdminId          int
	SlackChannelName string
	SlackChannelID   string
	HasMuted         *bool
}

type CommentSlackThread struct {
	Model
	SessionCommentID int `gorm:"index"`
	ErrorCommentID   int `gorm:"index"`

	SlackChannelID string
	ThreadTS       string
}

type SessionInterval struct {
	Model
	SessionSecureID string `gorm:"index" json:"secure_id"`
	StartTime       time.Time
	EndTime         time.Time
	Duration        int
	Active          bool
}

type TimelineIndicatorEvent struct {
	Model
	ID              int    `json:"id"` // Shadow Model.ID to avoid creating a pkey constraint
	SessionSecureID string `gorm:"index" json:"secure_id"`
	Timestamp       float64
	Type            int
	SID             float64
	Data            JSONB `json:"data" sql:"type:jsonb"`
}

type RageClickEvent struct {
	Model
	ProjectID       int    `deep:"-"`
	SessionSecureID string `deep:"-"`
	TotalClicks     int
	StartTimestamp  time.Time `deep:"-"`
	EndTimestamp    time.Time `deep:"-"`
}

type SessionPayload struct {
	Events                  []interface{}    `json:"events"`
	Errors                  []ErrorObject    `json:"errors"`
	RageClicks              []RageClickEvent `json:"rage_clicks"`
	SessionComments         []SessionComment `json:"session_comments"`
	LastUserInteractionTime time.Time        `json:"last_user_interaction_time"`
}

type SavedAsset struct {
	ProjectID   int    `gorm:"uniqueIndex:idx_saved_assets_project_id_original_url_date;index:idx_project_id_hash_val"`
	OriginalUrl string `gorm:"uniqueIndex:idx_saved_assets_project_id_original_url_date"`
	Date        string `gorm:"uniqueIndex:idx_saved_assets_project_id_original_url_date"`
	HashVal     string `gorm:"index:idx_project_id_hash_val"`
}

type VercelIntegrationConfig struct {
	WorkspaceID     int `gorm:"uniqueIndex:idx_workspace_id_vercel_project_id;index"`
	ProjectID       int
	VercelProjectID string `gorm:"uniqueIndex:idx_workspace_id_vercel_project_id"`
}

type IntegrationWorkspaceMapping struct {
	IntegrationType modelInputs.IntegrationType `gorm:"primary_key;not null"`
	WorkspaceID     int                         `gorm:"primary_key;not null"`
	AccessToken     string                      `gorm:"not null"`
	RefreshToken    string
	Expiry          time.Time
}

type IntegrationProjectMapping struct {
	IntegrationType modelInputs.IntegrationType `gorm:"uniqueIndex:idx_integration_project_mapping_project_id_integration_type"`
	ProjectID       int                         `gorm:"uniqueIndex:idx_integration_project_mapping_project_id_integration_type"`
	ExternalID      string
}

type AlertEvent struct {
	Model
	Type         string
	ProjectID    int
	AlertID      int
	ErrorGroupID *int
}

type OAuthClientStore struct {
	ID        string         `gorm:"primary_key;default:uuid_generate_v4()"`
	CreatedAt time.Time      `json:"created_at" deep:"-"`
	Secret    string         `gorm:"uniqueIndex;not null;default:uuid_generate_v4()"`
	Domains   pq.StringArray `gorm:"not null;type:text[]"`
	AppName   string
}

var ErrorType = struct {
	FRONTEND string
	BACKEND  string
}{
	FRONTEND: "Frontend",
	BACKEND:  "Backend",
}

type EmailOptOut struct {
	Model
	AdminID  int                             `gorm:"uniqueIndex:email_opt_out_admin_category_idx"`
	Category modelInputs.EmailOptOutCategory `gorm:"uniqueIndex:email_opt_out_admin_category_idx"`
}

type BillingEmailHistory struct {
	Model
	Active      bool
	WorkspaceID int
	Type        Email.EmailType
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
		CreateBatchSize:                          65535,
	})

	if err != nil {
		return nil, e.Wrap(err, "Failed to connect to database")
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return nil, e.Wrap(err, "error retrieving underlying sql db")
	}
	sqlDB.SetMaxOpenConns(15)

	log.Printf("Finished setting up DB. \n")
	return DB, nil
}

func MigrateDB(DB *gorm.DB) (bool, error) {
	log.Printf("Running DB migrations... \n")
	if err := DB.Exec("CREATE EXTENSION IF NOT EXISTS pgcrypto;").Error; err != nil {
		return false, e.Wrap(err, "Error installing pgcrypto")
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
		return false, e.Wrap(err, "Error creating secure_id_generator")
	}

	// allows using postgres native UUID functions
	if err := DB.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`).Error; err != nil {
		return false, e.Wrap(err, "failed to configure uuid extension")
	}

	if err := DB.AutoMigrate(
		Models...,
	); err != nil {
		return false, e.Wrap(err, "Error migrating db")
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
		return false, e.Wrap(err, "Error adding unique constraint on daily_error_counts")
	}

	// Drop the null constraint on error_fingerprints.error_group_id
	// This is necessary for replacing the error_groups.fingerprints association through GORM
	// (not sure if this is a GORM bug or due to our GORM / Postgres version)
	if err := DB.Exec(`
		DO $$
		BEGIN
			IF EXISTS
				(select * from information_schema.columns where table_name = 'error_fingerprints' and column_name = 'error_group_id' and is_nullable = 'NO')
			THEN
				ALTER TABLE error_fingerprints
    				ALTER COLUMN error_group_id DROP NOT NULL;
			END IF;
		END $$;
	`).Error; err != nil {
		return false, e.Wrap(err, "Error dropping null constraint on error_fingerprints.error_group_id")
	}

	if err := DB.Exec(`
		CREATE MATERIALIZED VIEW IF NOT EXISTS daily_session_counts_view AS
			SELECT project_id, DATE_TRUNC('day', created_at, 'UTC') as date, COUNT(*) as count
			FROM sessions
			WHERE excluded <> true
			AND (active_length >= 1000 OR (active_length is null and length >= 1000))
			AND processed = true
			GROUP BY 1, 2;
	`).Error; err != nil {
		return false, e.Wrap(err, "Error creating daily_session_counts_view")
	}

	if err := DB.Exec(`
		DO $$
		BEGIN
			IF NOT EXISTS
				(select * from pg_indexes where indexname = 'idx_daily_session_counts_view_project_id_date')
			THEN
				CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_session_counts_view_project_id_date ON daily_session_counts_view (project_id, date);
			END IF;
		END $$;
	`).Error; err != nil {
		return false, e.Wrap(err, "Error creating idx_daily_session_counts_view_project_id_date")
	}

	// Create unique conditional index for billing email history
	if err := DB.Exec(`
		DO $$
		BEGIN
			IF NOT EXISTS
				(select * from pg_indexes where indexname = 'email_history_active_workspace_type_idx')
			THEN
				CREATE UNIQUE INDEX email_history_active_workspace_type_idx ON billing_email_histories (active, workspace_id, type) WHERE (active = true);			
			END IF;
		END $$;
	`).Error; err != nil {
		return false, e.Wrap(err, "Error creating email_history_active_workspace_type_idx")
	}

	if err := DB.Exec(fmt.Sprintf(`
		DO $$
			BEGIN
				BEGIN
					IF NOT EXISTS
						(SELECT constraint_name from information_schema.constraint_column_usage where table_name = 'metric_groups' and constraint_name = '%s')
					THEN
						ALTER TABLE metric_groups
						ADD CONSTRAINT %s
							UNIQUE (group_name, session_id);
					END IF;
				EXCEPTION
					WHEN duplicate_table
					THEN RAISE NOTICE 'metric_groups.%s already exists';
				END;
			END $$;
	`, METRIC_GROUPS_NAME_SESSION_UNIQ, METRIC_GROUPS_NAME_SESSION_UNIQ, METRIC_GROUPS_NAME_SESSION_UNIQ)).Error; err != nil {
		return false, e.Wrap(err, "Error adding unique constraint on metric_groups")
	}

	if err := DB.Exec(fmt.Sprintf(`
		DO $$
		BEGIN
			BEGIN
				DROP INDEX IF EXISTS idx_metric_tag_filter_metric_id_tag;
				IF EXISTS
					(SELECT constraint_name
					 from information_schema.key_column_usage
					 where table_name = 'dashboard_metric_filters'
					   and constraint_name = 'dashboard_metric_filters_chart_id')
				THEN
					ALTER TABLE dashboard_metric_filters
						DROP CONSTRAINT dashboard_metric_filters_chart_id;
				END IF;
				IF NOT EXISTS
					(SELECT constraint_name
					 from information_schema.constraint_column_usage
					 where table_name = 'dashboard_metric_filters'
					   and constraint_name = '%s')
				THEN
					ALTER TABLE dashboard_metric_filters
						ADD CONSTRAINT %s
						UNIQUE (metric_id, metric_monitor_id, tag);
				END IF;
			EXCEPTION
				WHEN duplicate_table
					THEN RAISE NOTICE 'dashboard_metric_filters.%s already exists';
			END;
		END $$;
	`, DASHBOARD_METRIC_FILTERS_UNIQ, DASHBOARD_METRIC_FILTERS_UNIQ, DASHBOARD_METRIC_FILTERS_UNIQ)).Error; err != nil {
		return false, e.Wrap(err, "Error adding unique constraint on dashboard_metric_filters")
	}

	if err := DB.Exec(`
		CREATE INDEX CONCURRENTLY IF NOT EXISTS error_fields_md5_idx
		ON error_fields (project_id, name, CAST(md5(value) AS uuid));
	`).Error; err != nil {
		return false, e.Wrap(err, "Error creating error_fields_md5_idx")
	}

	// If sessions_id_seq is not greater than 30000000, set it
	if err := DB.Exec(`
		SELECT
		CASE
			WHEN not exists(SELECT last_value FROM sessions_id_seq WHERE last_value >= ?)
				THEN setval('sessions_id_seq', ?)
			ELSE 0
		END;
	`, PARTITION_SESSION_ID, PARTITION_SESSION_ID).Error; err != nil {
		return false, e.Wrap(err, "Error setting session id sequence to 30000000")
	}

	if err := DB.Exec(`
		CREATE TABLE IF NOT EXISTS events_objects_partitioned
		(LIKE events_objects INCLUDING DEFAULTS INCLUDING IDENTITY)
		PARTITION BY RANGE (session_id);
	`).Error; err != nil {
		return false, e.Wrap(err, "Error creating events_objects_partitioned")
	}

	// if err := DB.Exec(`
	// 	CREATE INDEX IF NOT EXISTS events_objects_partitioned_session_id
	// 	ON events_objects_partitioned (session_id);
	// `).Error; err != nil {
	// 	return false, e.Wrap(err, "Error creating events_objects_partitioned_session_id")
	// }

	var lastVal int
	if err := DB.Raw("SELECT last_value FROM sessions_id_seq").Scan(&lastVal).Error; err != nil {
		return false, e.Wrap(err, "Error selecting max session id")
	}
	partitionSize := 100000
	start := lastVal / partitionSize * partitionSize

	// Make sure partitions are created for the next 5m sessions
	for i := 0; i < 50; i++ {
		end := start + partitionSize
		sql := fmt.Sprintf(`
			DO $$
			BEGIN
				IF
					(SELECT pg_try_advisory_xact_lock(%d))
				THEN
					CREATE TABLE IF NOT EXISTS events_objects_partitioned_%d (
						LIKE events_objects_partitioned INCLUDING DEFAULTS INCLUDING CONSTRAINTS
					);
					IF NOT EXISTS (
						SELECT 1
						FROM pg_inherits
						JOIN pg_class parent            ON pg_inherits.inhparent = parent.oid
						JOIN pg_class child             ON pg_inherits.inhrelid   = child.oid
						WHERE parent.relname='events_objects_partitioned' and child.relname='events_objects_partitioned_%d')
					THEN
						ALTER TABLE events_objects_partitioned
						ATTACH PARTITION events_objects_partitioned_%d
						FOR VALUES FROM (%d) TO (%d);
					END IF;
				END IF;
			END $$;
		`, EVENTS_OBJECTS_ADVISORY_LOCK_ID, start, start, start, start, end)

		if err := DB.Exec(sql).Error; err != nil {
			return false, e.Wrapf(err, "Error creating partitioned events_objects for index %d", i)
		}

		start = end
	}

	// Create sequence for session_fields.id manually. This started as a join
	// table with no primary key. We use our own sequence to prevent assigning a
	// value to old records.
	if err := DB.Exec(`
		DO $$
			BEGIN
				IF NOT EXISTS
					(SELECT * FROM information_schema.sequences WHERE sequence_name = 'session_fields_id_seq')
				THEN
					CREATE SEQUENCE IF NOT EXISTS session_fields_id_seq;
				END IF;
		END $$;
	`).Error; err != nil {
		return false, e.Wrap(err, "Error creating session_fields_id_seq")
	}

	if err := DB.Exec(`
		DO $$
			BEGIN
				IF NOT EXISTS
					(SELECT * FROM information_schema.columns WHERE table_name = 'session_fields' AND column_name = 'id')
				THEN
					ALTER TABLE session_fields ADD COLUMN IF NOT EXISTS id BIGINT DEFAULT NULL;
				END IF;
		END $$;
	`).Error; err != nil {
		return false, e.Wrap(err, "Error creating session_fields.id column")
	}

	if err := DB.Exec(`
		DO $$
			BEGIN
				IF EXISTS
					(SELECT * FROM information_schema.columns WHERE table_name = 'session_fields' AND column_default IS NULL AND column_name = 'id')
				THEN
					ALTER TABLE session_fields ALTER COLUMN id SET DEFAULT nextval('session_fields_id_seq');
				END IF;
		END $$;
	`).Error; err != nil {
		return false, e.Wrap(err, "Error assigning default to session_fields.id")
	}

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

	log.Printf("Finished running DB migrations.\n")

	return true, nil
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
			return nil, e.Errorf("repeated param '%v' not supported", val)
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

func formatDuration(d time.Duration) string {
	ret := ""

	h := d / time.Hour
	d -= h * time.Hour

	m := d / time.Minute
	d -= m * time.Minute

	s := d / time.Second

	if h > 0 {
		ret += fmt.Sprintf("%dh ", h)
	}
	if m > 0 || len(ret) > 0 {
		ret += fmt.Sprintf("%dm ", m)
	}

	ret += fmt.Sprintf("%ds", s)

	return ret
}

func (e *ErrorGroup) GetSlackAttachment(attachment *slack.Attachment) error {
	errorTitle := e.Event
	errorDateStr := fmt.Sprintf("<!date^%d^{date} {time}|%s>", e.CreatedAt.Unix(), e.CreatedAt.Format(time.RFC1123))
	errorType := e.Type
	errorState := e.State

	frontendURL := os.Getenv("FRONTEND_URI")
	errorURL := fmt.Sprintf("%s/%d/errors/%s", frontendURL, e.ProjectID, e.SecureID)

	fields := []*slack.TextBlockObject{
		slack.NewTextBlockObject("mrkdwn", fmt.Sprintf("*Created:*\n%s", errorDateStr), false, false),
		slack.NewTextBlockObject("mrkdwn", fmt.Sprintf("*State:*\n%s", errorState), false, false),
		slack.NewTextBlockObject("mrkdwn", fmt.Sprintf("*Type:*\n%s", errorType), false, false),
	}

	mainSection := slack.NewSectionBlock(
		slack.NewTextBlockObject(
			"mrkdwn",
			fmt.Sprintf("<%s|*Error: %s*>", errorURL, errorTitle),
			false,
			false,
		),
		fields,
		nil,
	)

	openBtn := slack.NewButtonBlockElement("view_error", "", slack.NewTextBlockObject("plain_text", "Open in Highlight", false, false))
	openBtn.URL = errorURL
	actionBtns := slack.NewActionBlock("action_block", openBtn)

	attachment.Blocks.BlockSet = append(attachment.Blocks.BlockSet, mainSection, actionBtns)

	return nil
}

func (s *Session) GetSlackAttachment(attachment *slack.Attachment) error {
	sessionTitle := s.Identifier
	if sessionTitle == "" {
		sessionTitle = fmt.Sprintf("#%d", s.Fingerprint)
	}
	sessionActiveDuration := formatDuration(time.Duration(s.ActiveLength * 10e5).Round(time.Second))
	sessionTotalDuration := formatDuration(time.Duration(s.Length * 10e5).Round(time.Second))
	sessionDateStr := fmt.Sprintf("<!date^%d^{date} {time}|%s>", s.CreatedAt.Unix(), s.CreatedAt.Format(time.RFC1123))

	frontendURL := os.Getenv("FRONTEND_URI")
	sessionURL := fmt.Sprintf("%s/%d/sessions/%s", frontendURL, s.ProjectID, s.SecureID)
	sessionImg := ""
	userProps, err := s.GetUserProperties()
	if err == nil && userProps["avatar"] != "" {
		sessionImg = userProps["avatar"]
	}

	fields := []*slack.TextBlockObject{
		slack.NewTextBlockObject("mrkdwn", fmt.Sprintf("*User:*\n%s", sessionTitle), false, false),
		slack.NewTextBlockObject("mrkdwn", fmt.Sprintf("*Created:*\n%s", sessionDateStr), false, false),
		slack.NewTextBlockObject("mrkdwn", fmt.Sprintf("*Active Duration:*\n%s", sessionActiveDuration), false, false),
		slack.NewTextBlockObject("mrkdwn", fmt.Sprintf("*Total Duration:*\n%s", sessionTotalDuration), false, false),
		slack.NewTextBlockObject("mrkdwn", fmt.Sprintf("*Browser:*\n%s", s.BrowserName), false, false),
		slack.NewTextBlockObject("mrkdwn", fmt.Sprintf("*OS:*\n%s", s.OSName), false, false),
	}

	var sideImg *slack.ImageBlockElement
	if sessionImg != "" {
		sideImg = slack.NewImageBlockElement(sessionImg, "user avatar")
	}

	var mainSection *slack.SectionBlock
	if sideImg != nil {
		mainSection = slack.NewSectionBlock(nil, fields, slack.NewAccessory(sideImg))
	} else {
		mainSection = slack.NewSectionBlock(nil, fields, nil)
	}

	openBtn := slack.NewButtonBlockElement("view_session", "", slack.NewTextBlockObject("plain_text", "Open in Highlight", false, false))
	openBtn.URL = sessionURL
	actionBtns := slack.NewActionBlock("action_block", openBtn)

	attachment.Blocks.BlockSet = append(attachment.Blocks.BlockSet, mainSection, actionBtns)

	return nil
}

func (s *Session) GetUserProperties() (map[string]string, error) {
	var userProperties map[string]string
	if err := json.Unmarshal([]byte(s.UserProperties), &userProperties); err != nil {
		return nil, e.Wrapf(err, "[project_id: %d] error unmarshalling user properties map into bytes", s.ProjectID)
	}
	return userProperties, nil
}

type Alert struct {
	OrganizationID       int
	ProjectID            int
	ExcludedEnvironments *string
	CountThreshold       int
	ThresholdWindow      *int // TODO(geooot): [HIG-2351] make this not a pointer or change graphql struct field to be nullable
	ChannelsToNotify     *string
	EmailsToNotify       *string
	Name                 *string
	Type                 *string `gorm:"index"`
	LastAdminToEditID    int     `gorm:"last_admin_to_edit_id"`
	Frequency            int     `gorm:"default:15"` // time in seconds
	Disabled             *bool   `gorm:"default:false"`
}

type ErrorAlert struct {
	Model
	Alert
	RegexGroups *string
	AlertIntegrations
}

func (obj *ErrorAlert) SendAlerts(db *gorm.DB, mailClient *sendgrid.Client, input *SendSlackAlertInput) {
	if err := obj.sendSlackAlert(db, obj.ID, input); err != nil {
		log.Error(err)
	}
	emailsToNotify, err := GetEmailsToNotify(obj.EmailsToNotify)
	if err != nil {
		log.Error(err)
	}

	frontendURL := os.Getenv("FRONTEND_URI")
	errorURL := fmt.Sprintf("%s/%d/errors/%s", frontendURL, obj.ProjectID, input.Group.SecureID)
	sessionURL := fmt.Sprintf("%s/%d/sessions/%s", frontendURL, obj.ProjectID, input.SessionSecureID)

	for _, email := range emailsToNotify {
		message := fmt.Sprintf("<b>%s</b><br>The following error is being thrown on your app<br>%s<br><br><a href=\"%s\">View Error</a>  <a href=\"%s\">View Session</a>", *obj.Name, input.Group.Event, errorURL, sessionURL)
		if err := Email.SendAlertEmail(mailClient, *email, message, "Errors", fmt.Sprintf("%s: %s", *obj.Name, input.Group.Event)); err != nil {
			log.Error(err)
		}
	}
}

func SendBillingNotifications(db *gorm.DB, mailClient *sendgrid.Client, emailType Email.EmailType, workspace *Workspace) error {
	// Skip sending email if sending was attempted within the cache TTL
	cacheKey := fmt.Sprintf("%s;%d", emailType, workspace.ID)
	_, exists := emailHistoryCache.Get(cacheKey)
	if exists {
		return nil
	}
	emailHistoryCache.Set(cacheKey, true)

	var toAddrs []struct {
		AdminID int
		Email   string
	}
	if err := db.Raw(`
		SELECT a.id as admin_id, a.email
		FROM workspace_admins wa
		INNER JOIN admins a
		ON wa.admin_id = a.id
		WHERE wa.workspace_id = ?
		AND NOT EXISTS (
			SELECT *
			FROM email_opt_outs eoo
			WHERE eoo.admin_id = a.id
			AND eoo.category IN ('All', 'Billing')
		)
	`, workspace.ID).Scan(&toAddrs).Error; err != nil {
		return e.Wrap(err, "error querying recipient emails")
	}

	history := BillingEmailHistory{
		WorkspaceID: workspace.ID,
		Type:        emailType,
		Active:      true,
	}
	if err := db.Create(&history).Error; err != nil {
		if err != nil {
			var pgErr *pgconn.PgError
			// An active BillingEmailHistory may already exist -
			// in this case, don't send users another email.
			if errors.As(err, &pgErr) && pgErr.Code == pgerrcode.UniqueViolation {
				return nil
			}
		}
		return e.Wrap(err, "error creating BillingEmailHistory")
	}

	errors := []string{}
	for _, toAddr := range toAddrs {
		err := Email.SendBillingNotificationEmail(mailClient, emailType, workspace.ID, workspace.Name, toAddr.Email, toAddr.AdminID)
		if err != nil {
			errors = append(errors, err.Error())
		}
	}

	if len(errors) > 0 {
		return e.New(strings.Join(errors, "\n"))
	}

	return nil
}

func (obj *ErrorAlert) GetRegexGroups() ([]*string, error) {
	var regexGroups []*string
	if obj.RegexGroups == nil || *obj.RegexGroups == "" {
		return regexGroups, nil
	}

	err := json.Unmarshal([]byte(*obj.RegexGroups), &regexGroups)
	if err != nil {
		return nil, err
	}
	return regexGroups, nil
}

type SessionAlert struct {
	Model
	Alert
	TrackProperties *string
	UserProperties  *string
	ExcludeRules    *string
	AlertIntegrations
}

func (obj *SessionAlert) SendAlerts(db *gorm.DB, mailClient *sendgrid.Client, input *SendSlackAlertInput) {
	if err := obj.sendSlackAlert(db, obj.ID, input); err != nil {
		log.Error(err)
	}

	emailsToNotify, err := GetEmailsToNotify(obj.EmailsToNotify)
	if err != nil {
		log.Error(err)
	}

	frontendURL := os.Getenv("FRONTEND_URI")
	sessionURL := fmt.Sprintf("%s/%d/sessions/%s", frontendURL, obj.ProjectID, input.SessionSecureID)
	alertType := ""
	message := ""
	subjectLine := ""
	identifier := input.UserIdentifier
	if val, ok := input.UserObject["email"].(string); ok && len(val) > 0 {
		identifier = val
	}
	if val, ok := input.UserObject["highlightDisplayName"].(string); ok && len(val) > 0 {
		identifier = val
	}
	if identifier == "" {
		identifier = "Someone"
	}

	switch *obj.Type {
	case AlertType.NEW_SESSION:
		alertType = "New Session"
		message = fmt.Sprintf("<b>%s</b> just started a new session.<br><br><a href=\"%s\">View Session</a>", identifier, sessionURL)
		subjectLine = fmt.Sprintf("%s just started a new session", identifier)
	case AlertType.NEW_USER:
		alertType = "New User"
		message = fmt.Sprintf("<b>%s</b> just started their first session.<br><br><a href=\"%s\">View Session</a>", identifier, sessionURL)
		subjectLine = fmt.Sprintf("%s just started their first session", identifier)
	case AlertType.RAGE_CLICK:
		alertType = "Rage Click"
		message = fmt.Sprintf("<b>%s</b> has been rage clicking in a session.<br><br><a href=\"%s\">View Session</a>", identifier, sessionURL)
		subjectLine = fmt.Sprintf("%s has been rage clicking in a session.", identifier)
	case AlertType.SESSION_FEEDBACK:
		alertType = "Session Feedback"
		message = fmt.Sprintf("<b>%s</b> just left feedback.<br><br><a href=\"%s\">View Session</a>", identifier, sessionURL)
		subjectLine = fmt.Sprintf("%s just left feedback.", identifier)
	case AlertType.TRACK_PROPERTIES:
		alertType = "Track Property"
		message = fmt.Sprintf("The following track events have been created by <b>%s</b>", identifier)
		for _, addr := range input.MatchedFields {
			message = fmt.Sprintf("%s<br>%s", message, fmt.Sprintf("{name: <b>%s</b>, value: <b>%s</b>}", addr.Name, addr.Value))
		}
		message = fmt.Sprintf("%s<br><br><a href=\"%s\">View Session</a>", message, sessionURL)
		subjectLine = fmt.Sprintf("%s triggered some track events.", identifier)
	case AlertType.USER_PROPERTIES:
		alertType = "User Property"
		message = fmt.Sprintf("The following user properties have been created by <b>%s</b>", identifier)
		for _, addr := range input.MatchedFields {
			message = fmt.Sprintf("%s<br>%s", message, fmt.Sprintf("{name: <b>%s</b>, value: <b>%s</b>}", addr.Name, addr.Value))
		}
		message = fmt.Sprintf("%s<br><br><a href=\"%s\">View Session</a>", message, sessionURL)
	default:
		return
	}

	for _, email := range emailsToNotify {
		if err := Email.SendAlertEmail(mailClient, *email, message, alertType, subjectLine); err != nil {
			log.Error(err)

		}
	}
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

func (obj *Alert) GetEmailsToNotify() ([]*string, error) {
	if obj == nil {
		return nil, e.New("empty session alert object for emails to notify")
	}

	emailsToNotify, err := GetEmailsToNotify(obj.EmailsToNotify)

	return emailsToNotify, err
}

func GetEmailsToNotify(emails *string) ([]*string, error) {
	emailString := "[]"
	if emails != nil {
		emailString = *emails
	}
	var emailsToNotify []*string
	if err := json.Unmarshal([]byte(emailString), &emailsToNotify); err != nil {
		return nil, e.Wrap(err, "error unmarshalling emails")
	}
	return emailsToNotify, nil

}

func (obj *MetricMonitor) GetChannelsToNotify() ([]*modelInputs.SanitizedSlackChannel, error) {
	if obj == nil {
		return nil, e.New("empty metric monitor object for channels to notify")
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

func (obj *SessionAlert) GetExcludeRules() ([]*string, error) {
	if obj == nil {
		return nil, e.New("empty session alert object for exclude rules")
	}
	excludeRulesString := "[]"
	if obj.ExcludeRules != nil {
		excludeRulesString = *obj.ExcludeRules
	}
	var sanitizedExcludeRules []*string
	if err := json.Unmarshal([]byte(excludeRulesString), &sanitizedExcludeRules); err != nil {
		return nil, e.Wrap(err, "error unmarshalling sanitized exclude rules")
	}
	return sanitizedExcludeRules, nil
}

// For a given session, an EventCursor is the address of an event in the list of events,
// that can be used for incremental fetching.
// The EventIndex must always be specified, with the EventObjectIndex optionally
// specified for optimization purposes.
type EventsCursor struct {
	EventIndex       int
	EventObjectIndex *int
}

type SendWelcomeSlackMessageInput struct {
	Workspace            *Workspace
	Admin                *Admin
	OperationName        string
	OperationDescription string
	Project              *Project
	AlertID              *int
	IncludeEditLink      bool
}

type DeleteSessionsTask struct {
	TaskID    string `gorm:"index:idx_task_id_batch_id"`
	BatchID   string `gorm:"index:idx_task_id_batch_id"`
	SessionID int
}

func (obj *Alert) SendWelcomeSlackMessage(input *SendWelcomeSlackMessageInput) error {
	if obj == nil {
		return e.New("Alert needs to be defined.")
	}
	if input.Workspace == nil {
		return e.New("Workspace needs to be defined.")
	}
	if input.Admin == nil {
		return e.New("Admin needs to be defined.")
	}
	if input.Project == nil {
		return e.New("Project needs to be defined.")
	}
	if input.AlertID == nil {
		return e.New("AlertID needs to be defined.")
	}

	// get alerts channels
	channels, err := obj.GetChannelsToNotify()
	if err != nil {
		return e.Wrap(err, "error getting channels to notify welcome slack message")
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
	var slackClient *slack.Client
	if input.Workspace.SlackAccessToken != nil {
		slackClient = slack.New(*input.Workspace.SlackAccessToken)
	}

	frontendURL := os.Getenv("FRONTEND_URI")
	alertUrl := fmt.Sprintf("%s/%d/alerts/%d", frontendURL, input.Project.Model.ID, *input.AlertID)
	if !input.IncludeEditLink {
		alertUrl = ""
	}
	adminName := input.Admin.Name

	if adminName == nil {
		adminName = input.Admin.Email
	}

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
					Error("requested channel has no matching slackWebhookURL when sending welcome message")
				continue
			}

			message := fmt.Sprintf("👋 %s has %s the alert \"%s\". %s %s", *adminName, input.OperationName, *obj.Name, input.OperationDescription, alertUrl)
			slackChannelId := *channel.WebhookChannelID
			slackChannelName := *channel.WebhookChannel

			go func() {
				// The Highlight Slack bot needs to join the channel before it can send a message.
				// Slack handles a bot trying to join a channel it already is a part of, we don't need to handle it.
				log.Printf("Sending Slack Bot Message for welcome message")
				if slackClient != nil {
					if strings.Contains(slackChannelName, "#") {
						_, _, _, err := slackClient.JoinConversation(slackChannelId)
						if err != nil {
							log.Error(e.Wrap(err, "failed to join slack channel while sending welcome message"))
						}
					}
					_, _, err := slackClient.PostMessage(slackChannelId, slack.MsgOptionText(message, false),
						slack.MsgOptionDisableLinkUnfurl(),  /** Disables showing a preview of any links that are in the Slack message.*/
						slack.MsgOptionDisableMediaUnfurl(), /** Disables showing a preview of any links that are in the Slack message.*/
					)
					if err != nil {
						log.WithFields(log.Fields{"workspace_id": input.Workspace.ID, "message": fmt.Sprintf("%+v", message)}).
							Error(e.Wrap(err, "error sending slack msg via bot api for welcome message"))
					}

				} else {
					log.Printf("Slack Bot Client was not defined for sending welcome message")
				}
			}()
		}
	}

	return nil
}

type SendWelcomeSlackMessageForMetricMonitorInput struct {
	Workspace            *Workspace
	Admin                *Admin
	OperationName        string
	OperationDescription string
	Project              *Project
	MonitorID            *int
	IncludeEditLink      bool
}

func (obj *MetricMonitor) SendWelcomeSlackMessage(input *SendWelcomeSlackMessageForMetricMonitorInput) error {
	if obj == nil {
		return e.New("metric monitor needs to be defined.")
	}
	if input.Workspace == nil {
		return e.New("Workspace needs to be defined.")
	}
	if input.Admin == nil {
		return e.New("Admin needs to be defined.")
	}
	if input.Project == nil {
		return e.New("Project needs to be defined.")
	}
	if input.MonitorID == nil {
		return e.New("AlertID needs to be defined.")
	}

	// get alerts channels
	channels, err := obj.GetChannelsToNotify()
	if err != nil {
		return e.Wrap(err, "error getting channels to notify welcome slack message")
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
	var slackClient *slack.Client
	if input.Workspace.SlackAccessToken != nil {
		slackClient = slack.New(*input.Workspace.SlackAccessToken)
	}

	frontendURL := os.Getenv("FRONTEND_URI")
	alertUrl := fmt.Sprintf("%s/%d/alerts/monitor/%d", frontendURL, input.Project.Model.ID, *input.MonitorID)
	if !input.IncludeEditLink {
		alertUrl = ""
	}
	adminName := input.Admin.Name

	if adminName == nil {
		adminName = input.Admin.Email
	}

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
					Error("requested channel has no matching slackWebhookURL when sending welcome message")
				continue
			}

			message := fmt.Sprintf("👋 %s has %s the alert \"%s\". %s %s", *adminName, input.OperationName, obj.Name, input.OperationDescription, alertUrl)
			slackChannelId := *channel.WebhookChannelID
			slackChannelName := *channel.WebhookChannel

			go func() {
				// The Highlight Slack bot needs to join the channel before it can send a message.
				// Slack handles a bot trying to join a channel it already is a part of, we don't need to handle it.
				log.Printf("Sending Slack Bot Message for welcome message")
				if slackClient != nil {
					if strings.Contains(slackChannelName, "#") {
						_, _, _, err := slackClient.JoinConversation(slackChannelId)
						if err != nil {
							log.Error(e.Wrap(err, "failed to join slack channel while sending welcome message"))
						}
					}
					_, _, err := slackClient.PostMessage(slackChannelId, slack.MsgOptionText(message, false),
						slack.MsgOptionDisableLinkUnfurl(),  /** Disables showing a preview of any links that are in the Slack message.*/
						slack.MsgOptionDisableMediaUnfurl(), /** Disables showing a preview of any links that are in the Slack message.*/
					)
					if err != nil {
						log.WithFields(log.Fields{"workspace_id": input.Workspace.ID, "message": fmt.Sprintf("%+v", message)}).
							Error(e.Wrap(err, "error sending slack msg via bot api for welcome message"))
					}

				} else {
					log.Printf("Slack Bot Client was not defined for sending welcome message")
				}
			}()
		}
	}

	return nil
}

type SendSlackAlertForMetricMonitorInput struct {
	Message   string
	Workspace *Workspace
}

func (obj *MetricMonitor) SendSlackAlert(input *SendSlackAlertForMetricMonitorInput) error {
	if obj == nil {
		return e.New("metric monitor needs to be defined.")
	}
	if input.Workspace == nil {
		return e.New("workspace needs to be defined.")
	}

	channels, err := obj.GetChannelsToNotify()
	if err != nil {
		return e.Wrap(err, "error getting channels to send MetricMonitor Slack Alert")
	}
	if len(channels) <= 0 {
		return nil
	}

	var slackClient *slack.Client
	if input.Workspace.SlackAccessToken != nil {
		slackClient = slack.New(*input.Workspace.SlackAccessToken)
	}

	frontendURL := os.Getenv("FRONTEND_URI")
	alertUrl := fmt.Sprintf("%s/%d/alerts/monitor/%d", frontendURL, obj.ProjectID, obj.ID)

	log.Info("Sending Slack Alert for Metric Monitor")

	// send message
	for _, channel := range channels {
		if channel.WebhookChannel != nil {
			message := fmt.Sprintf("%s\n<%s|View Monitor>", input.Message, alertUrl)
			slackChannelId := *channel.WebhookChannelID
			slackChannelName := *channel.WebhookChannel

			// The Highlight Slack bot needs to join the channel before it can send a message.
			// Slack handles a bot trying to join a channel it already is a part of, we don't need to handle it.
			if slackClient != nil {
				if strings.Contains(slackChannelName, "#") {
					_, _, _, err := slackClient.JoinConversation(slackChannelId)
					if err != nil {
						log.Error(e.Wrap(err, "failed to join slack channel while sending welcome message"))
					}
				}
				_, _, err := slackClient.PostMessage(slackChannelId, slack.MsgOptionText(message, false),
					slack.MsgOptionDisableLinkUnfurl(),  /** Disables showing a preview of any links that are in the Slack message.*/
					slack.MsgOptionDisableMediaUnfurl(), /** Disables showing a preview of any links that are in the Slack message.*/
				)
				if err != nil {
					log.WithFields(log.Fields{"workspace_id": input.Workspace.ID, "message": fmt.Sprintf("%+v", message)}).
						Error(e.Wrap(err, "error sending slack msg via bot api for welcome message"))
				}

			} else {
				log.Printf("Slack Bot Client was not defined for sending welcome message")
			}
		}
	}

	return nil
}

type SendSlackAlertInput struct {
	// Workspace is a required parameter
	Workspace *Workspace
	// SessionSecureID is a required parameter
	SessionSecureID string
	// UserIdentifier is a required parameter for New User, Error, and SessionFeedback alerts
	UserIdentifier string
	// UserObject is a required parameter for alerts that relate to a session
	UserObject JSONB
	// Group is a required parameter for Error alerts
	Group *ErrorGroup
	// URL is an optional parameter for Error alerts
	URL *string
	// ErrorsCount is a required parameter for Error alerts
	ErrorsCount *int64
	// MatchedFields is a required parameter for Track Properties and User Properties alerts
	MatchedFields []*Field
	// RelatedFields is an optional parameter for Track Properties and User Properties alerts
	RelatedFields []*Field
	// UserProperties is a required parameter for User Properties alerts
	UserProperties map[string]string
	// CommentID is a required parameter for SessionFeedback alerts
	CommentID *int
	// CommentText is a required parameter for SessionFeedback alerts
	CommentText string
	// QueryParams is a map of query params to be appended to the url suffix
	// `key:value` will be converted to `key=value` in the url with the appropriate separator (`?` or `&`)
	// - tsAbs is required for rage click alerts
	QueryParams map[string]string
	// RageClicksCount is a required parameter for Rage Click Alerts
	RageClicksCount *int64
	// Timestamp is an optional value for all session alerts.
	Timestamp *time.Time
}

func getUserPropertiesBlock(identifier string, userProperties map[string]string) ([]*slack.TextBlockObject, *slack.Accessory) {
	messageBlock := []*slack.TextBlockObject{}
	if identifier != "" {
		messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*User:*\n"+identifier, false, false))
	} else {
		messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*User:*\n_unidentified_", false, false))
	}
	var accessory *slack.Accessory
	for k, v := range userProperties {
		if k == "" {
			continue
		}
		if v == "" {
			v = "_empty_"
		}
		caser := cases.Title(language.AmericanEnglish)
		key := caser.String(strings.ToLower(k))
		if key == "Avatar" {
			_, err := url.ParseRequestURI(v)
			if err != nil {
				// If not a valid URL, append to the body like any other property
				messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*%s:*\n%s", key, v), false, false))
			} else {
				// If it is valid, create an accessory from the image
				accessory = slack.NewAccessory(slack.NewImageBlockElement(v, "avatar"))
			}
		} else {
			messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*%s:*\n%s", key, v), false, false))
		}
	}
	return messageBlock, accessory
}

func (obj *Alert) sendSlackAlert(db *gorm.DB, alertID int, input *SendSlackAlertInput) error {
	// TODO: combine `error_alerts` and `session_alerts` tables and create composite index on (project_id, type)
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
	if input.QueryParams == nil {
		input.QueryParams = make(map[string]string)
	}
	if input.CommentID != nil {
		input.QueryParams["commentId"] = fmt.Sprintf("%d", *input.CommentID)
	}
	if len(input.QueryParams) > 0 {
		for k, v := range input.QueryParams {
			if len(suffix) == 0 {
				suffix += "?"
			} else {
				suffix += "&"
			}
			suffix += fmt.Sprintf("%s=%s", k, v)
		}
	}
	sessionLink := fmt.Sprintf("<%s/%d/sessions/%s%s|View Thread>", frontendURL, obj.ProjectID, input.SessionSecureID, suffix)
	messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*Session:*\n"+sessionLink, false, false))

	identifier := input.UserIdentifier
	if val, ok := input.UserObject["email"].(string); ok && len(val) > 0 {
		identifier = val
	}
	if val, ok := input.UserObject["highlightDisplayName"].(string); ok && len(val) > 0 {
		identifier = val
	}

	var previewText string
	if obj.Type == nil {
		if input.Group != nil {
			obj.Type = &AlertType.ERROR
		} else {
			obj.Type = &AlertType.NEW_USER
		}
	}
	alertEvent := &AlertEvent{Type: *obj.Type, ProjectID: obj.ProjectID, AlertID: alertID}
	switch *obj.Type {
	case AlertType.ERROR:
		shortEvent := input.Group.Event
		if len(input.Group.Event) > 50 {
			shortEvent = input.Group.Event[:50] + "..."
		}
		errorLink := fmt.Sprintf("%s/%d/errors/%s", frontendURL, obj.ProjectID, input.Group.SecureID)
		// construct Slack message
		previewText = fmt.Sprintf("Highlight: Error Alert: %s", shortEvent)
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Highlight Error Alert: %d Recent Occurrences*\n\n%s\n<%s/|View Thread>", *input.ErrorsCount, shortEvent, errorLink), false, false)
		messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*User:*\n"+identifier, false, false))
		if input.URL != nil && *input.URL != "" {
			messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*Visited Url:*\n"+*input.URL, false, false))
		}
		caser := cases.Title(language.AmericanEnglish)
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
					caser.String(strings.ToLower(titleStr))+" Error",
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
		alertEvent.ErrorGroupID = &input.Group.ID
	case AlertType.NEW_USER:
		// construct Slack message
		previewText = "Highlight: New User Alert"
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, "*Highlight New User Alert:*\n\n", false, false)
		userPropertiesBlock, accessory := getUserPropertiesBlock(identifier, input.UserProperties)
		messageBlock = append(messageBlock, userPropertiesBlock...)
		blockSet = append(blockSet, slack.NewSectionBlock(textBlock, messageBlock, accessory))
		blockSet = append(blockSet, slack.NewDividerBlock())
		msg.Blocks = &slack.Blocks{BlockSet: blockSet}
	case AlertType.TRACK_PROPERTIES:
		// format matched properties
		var matchedFormattedFields string
		var relatedFormattedFields string
		for index, addr := range input.MatchedFields {
			matchedFormattedFields = matchedFormattedFields + fmt.Sprintf("%d. *%s*: `%s`\n", index+1, addr.Name, addr.Value)
		}
		for index, addr := range input.RelatedFields {
			relatedFormattedFields = relatedFormattedFields + fmt.Sprintf("%d. *%s*: `%s`\n", index+1, addr.Name, addr.Value)
		}
		// construct Slack message
		previewText = fmt.Sprintf("Highlight: Track Properties Alert (%s)", identifier)
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Highlight Track Properties Alert (`%s`):*\n\n", identifier), false, false)
		messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Matched Track Properties:*\n%+v", matchedFormattedFields), false, false))
		messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Related Track Properties:*\n%+v", relatedFormattedFields), false, false))
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
		if identifier == "" {
			identifier = "User"
		}
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*%s Left Feedback*\n\n%s", identifier, input.CommentText), false, false)
		blockSet = append(blockSet, slack.NewSectionBlock(textBlock, messageBlock, nil))
		blockSet = append(blockSet, slack.NewDividerBlock())
		msg.Blocks = &slack.Blocks{BlockSet: blockSet}
	case AlertType.RAGE_CLICK:
		previewText = "Highlight: Rage Clicks Alert"
		if input.RageClicksCount == nil {
			return nil
		}
		if identifier != "" {
			messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*User Identifier:*\n%s", identifier), false, false))
		}
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Rage Clicks Detected:* %d Recent Occurrences\n\n", *input.RageClicksCount), false, false)
		blockSet = append(blockSet, slack.NewSectionBlock(textBlock, messageBlock, nil))
		blockSet = append(blockSet, slack.NewDividerBlock())
		msg.Blocks = &slack.Blocks{BlockSet: blockSet}
	case AlertType.NEW_SESSION:
		previewText = "Highlight: New Session Created"
		textBlock = slack.NewTextBlockObject(slack.MarkdownType, "*New Session Created:*\n\n", false, false)
		userPropertiesBlock, accessory := getUserPropertiesBlock(identifier, input.UserProperties)
		messageBlock = append(messageBlock, userPropertiesBlock...)
		if input.URL != nil {
			messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Visited URL:*\n%s", *input.URL), false, false))
		}
		blockSet = append(blockSet, slack.NewSectionBlock(textBlock, messageBlock, accessory))
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
				defer func() {
					if rec := recover(); rec != nil {
						buf := make([]byte, 64<<10)
						buf = buf[:runtime.Stack(buf, false)]
						log.Errorf("panic: %+v\n%s", rec, buf)
					}
				}()
				if isWebhookChannel {
					log.WithFields(log.Fields{"session_secure_id": input.SessionSecureID, "project_id": obj.ProjectID}).Infof("Sending Slack Webhook with preview_text: %s", msg.Text)
					err := slack.PostWebhook(
						slackWebhookURL,
						&msg,
					)
					if err != nil {
						log.WithFields(log.Fields{"workspace_id": input.Workspace.ID, "slack_webhook_url": slackWebhookURL, "message": fmt.Sprintf("%+v", msg)}).
							Error(e.Wrap(err, "error sending slack msg via webhook"))
						return
					}
				} else if slackClient != nil {
					log.WithFields(log.Fields{"session_secure_id": input.SessionSecureID, "project_id": obj.ProjectID}).Infof("Sending Slack Bot Message with preview_text: %s", msg.Text)
					if strings.Contains(slackChannelName, "#") {
						_, _, _, err := slackClient.JoinConversation(slackChannelId)
						if err != nil {
							log.Error(e.Wrap(err, "failed to join slack channel"))
							return
						}
					}
					_, _, err := slackClient.PostMessage(slackChannelId, slack.MsgOptionText(previewText, false), slack.MsgOptionBlocks(blockSet...),
						slack.MsgOptionDisableLinkUnfurl(),  /** Disables showing a preview of any links that are in the Slack message.*/
						slack.MsgOptionDisableMediaUnfurl(), /** Disables showing a preview of any links that are in the Slack message.*/
					)
					if err != nil {
						log.WithFields(log.Fields{"workspace_id": input.Workspace.ID, "message": fmt.Sprintf("%+v", msg)}).
							Error(e.Wrap(err, "error sending slack msg via bot api"))
						return
					}
				} else {
					log.Error("couldn't send slack alert, slack client isn't setup AND not webhook channel")
					return
				}
				if err := db.Create(alertEvent).Error; err != nil {
					log.Error(e.Wrap(err, "error creating alert event"))
				}
			}()
		}
	}
	return nil
}

// Returns the first filename from a stack trace, or nil if
// the stack trace cannot be unmarshalled or doesn't have a filename.
func GetFirstFilename(stackTraceString string) *string {
	var unmarshalled []*modelInputs.ErrorTrace
	if err := json.Unmarshal([]byte(stackTraceString), &unmarshalled); err != nil {
		// Stack trace may not be able to be unmarshalled as the format may differ,
		// should not be treated as an error
		return nil
	}

	// Return the first non empty frame's filename
	empty := modelInputs.ErrorTrace{}
	for _, frame := range unmarshalled {
		if frame != nil && *frame != empty {
			return frame.FileName
		}
	}

	return nil
}
