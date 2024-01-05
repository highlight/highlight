package model

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	Email "github.com/highlight-run/highlight/backend/email"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
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
)

var (
	env     = os.Getenv("ENVIRONMENT")
	DevEnv  = "dev"
	TestEnv = "test"
)

func IsDevEnv() bool {
	return env == DevEnv
}

func IsTestEnv() bool {
	return env == TestEnv
}

func IsDevOrTestEnv() bool {
	return IsTestEnv() || IsDevEnv()
}

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
	ERROR_FEEDBACK   string
	RAGE_CLICK       string
	NEW_SESSION      string
	LOG              string
}{
	ERROR:            "ERROR_ALERT",
	NEW_USER:         "NEW_USER_ALERT",
	TRACK_PROPERTIES: "TRACK_PROPERTIES_ALERT",
	USER_PROPERTIES:  "USER_PROPERTIES_ALERT",
	ERROR_FEEDBACK:   "ERROR_FEEDBACK_ALERT",
	RAGE_CLICK:       "RAGE_CLICK_ALERT",
	NEW_SESSION:      "NEW_SESSION_ALERT",
	LOG:              "LOG",
}

var AdminRole = struct {
	ADMIN  string
	MEMBER string
}{
	ADMIN:  "ADMIN",
	MEMBER: "MEMBER",
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
	OAuthClientID  contextString
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
	&ErrorObjectEmbeddings{},
	&ErrorGroup{},
	&ErrorField{},
	&ErrorSegment{},
	&SavedSegment{},
	&Organization{},
	&Segment{},
	&Admin{},
	&Session{},
	&SessionInterval{},
	&SessionExport{},
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
	&ErrorAlertEvent{},
	&SessionAlert{},
	&SessionAlertEvent{},
	&LogAlert{},
	&LogAlertEvent{},
	&Project{},
	&RageClickEvent{},
	&Workspace{},
	&WorkspaceAdmin{},
	&WorkspaceInviteLink{},
	&WorkspaceAccessRequest{},
	&EnhancedUserDetails{},
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
	&OAuthOperation{},
	&ResthookSubscription{},
	&IntegrationProjectMapping{},
	&IntegrationWorkspaceMapping{},
	&EmailOptOut{},
	&BillingEmailHistory{},
	&Retryable{},
	&Service{},
	&SetupEvent{},
	&SessionAdminsView{},
	&ErrorGroupAdminsView{},
	&LogAdminsView{},
	&ProjectFilterSettings{},
	&AllWorkspaceSettings{},
	&ErrorGroupActivityLog{},
	&UserJourneyStep{},
	&SystemConfiguration{},
	&SessionInsight{},
	&ErrorTag{},
}

func init() {
	hd := hashids.NewData()
	hd.MinLength = 8
	hd.Alphabet = "abcdefghijklmnopqrstuvwxyz1234567890"
	hid, err := hashids.NewWithData(hd)
	if err != nil {
		log.WithContext(context.Background()).Fatalf("error creating hash id client: %v", err)
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
	Name         *string
	BillingEmail *string
	Secret       *string    `json:"-"`
	Admins       []Admin    `gorm:"many2many:organization_admins;"`
	TrialEndDate *time.Time `json:"trial_end_date"`
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
	JiraDomain                  *string
	JiraCloudID                 *string
	SlackChannels               *string
	LinearAccessToken           *string
	VercelAccessToken           *string
	VercelTeamID                *string
	Projects                    []Project
	MigratedFromProjectID       *int // Column can be removed after migration is done
	HubspotCompanyID            *int
	StripeCustomerID            *string
	PlanTier                    string `gorm:"default:Free"`
	UnlimitedMembers            bool   `gorm:"default:false"`
	BillingPeriodStart          *time.Time
	BillingPeriodEnd            *time.Time
	NextInvoiceDate             *time.Time
	MonthlySessionLimit         *int
	MonthlyMembersLimit         *int
	MonthlyErrorsLimit          *int
	MonthlyLogsLimit            *int
	MonthlyTracesLimit          *int
	RetentionPeriod             *modelInputs.RetentionPeriod
	ErrorsRetentionPeriod       *modelInputs.RetentionPeriod
	LogsRetentionPeriod         *modelInputs.RetentionPeriod
	TracesRetentionPeriod       *modelInputs.RetentionPeriod
	SessionsMaxCents            *int
	ErrorsMaxCents              *int
	LogsMaxCents                *int
	TracesMaxCents              *int
	StripeSessionOveragePriceID *string
	StripeErrorOveragePriceID   *string
	StripeLogOveragePriceID     *string
	StripeTracesOveragePriceID  *string
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

func (w *Workspace) GetRetentionPeriod() modelInputs.RetentionPeriod {
	if w.RetentionPeriod != nil {
		return *w.RetentionPeriod
	}
	// Retention period is six months for any workspace grandfathered in
	return modelInputs.RetentionPeriodSixMonths
}

func (w *Workspace) AdminEmailAddresses(db *gorm.DB) ([]struct {
	AdminID int
	Email   string
}, error) {
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
		`, w.ID).Scan(&toAddrs).Error; err != nil {
		return nil, e.Wrap(err, "error querying recipient emails")
	}
	return toAddrs, nil
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
	ErrorFilters        pq.StringArray `gorm:"type:text[]"`
	ErrorJsonPaths      pq.StringArray `gorm:"type:text[]"`

	// BackendSetup will be true if this is the session where HighlightBackend is run for the first time
	BackendSetup *bool         `json:"backend_setup"`
	SetupEvent   []*SetupEvent `gorm:"foreignKey:ProjectID"`

	// Maximum time window considered for a rage click event
	RageClickWindowSeconds int `gorm:"default:5"`
	// Maximum distance between clicks for a rage click event
	RageClickRadiusPixels int `gorm:"default:8"`
	// Minimum count of clicks in a rage click event
	RageClickCount int `gorm:"default:5"`

	// Applies to all browser extensions
	// TODO - rename to FilterBrowserExtension #5811
	FilterChromeExtension *bool `gorm:"default:false"`
}

type MarkBackendSetupType = string

const (
	// Generic is temporary and can be removed once all messages are processed.
	MarkBackendSetupTypeGeneric MarkBackendSetupType = "generic"
	MarkBackendSetupTypeSession MarkBackendSetupType = "session"
	MarkBackendSetupTypeError   MarkBackendSetupType = "error"
	MarkBackendSetupTypeLogs    MarkBackendSetupType = "logs"
	MarkBackendSetupTypeTraces  MarkBackendSetupType = "traces"
)

type SetupEvent struct {
	ID        int                  `gorm:"primary_key;type:serial" json:"id" deep:"-"`
	CreatedAt time.Time            `json:"created_at" deep:"-"`
	ProjectID int                  `gorm:"uniqueIndex:idx_project_id_type"`
	Type      MarkBackendSetupType `gorm:"uniqueIndex:idx_project_id_type"`
}

type ProjectFilterSettings struct {
	Model
	Project                           *Project
	ProjectID                         int
	FilterSessionsWithoutError        bool    `gorm:"default:false"`
	AutoResolveStaleErrorsDayInterval int     `gorm:"default:0"`
	SessionSamplingRate               float64 `gorm:"default:1"`
	ErrorSamplingRate                 float64 `gorm:"default:1"`
	LogSamplingRate                   float64 `gorm:"default:1"`
	TraceSamplingRate                 float64 `gorm:"default:1"`
	SessionMinuteRateLimit            *int64
	ErrorMinuteRateLimit              *int64
	LogMinuteRateLimit                *int64
	TraceMinuteRateLimit              *int64
	SessionExclusionQuery             *string
	ErrorExclusionQuery               *string
	LogExclusionQuery                 *string
	TraceExclusionQuery               *string
}

type AllWorkspaceSettings struct {
	Model
	WorkspaceID   int  `gorm:"uniqueIndex"`
	AIApplication bool `gorm:"default:true"`
	AIInsights    bool `gorm:"default:false"`

	// store embeddings for errors in this workspace
	ErrorEmbeddingsWrite bool `gorm:"default:false"`
	// use embeddings to group errors in this workspace
	ErrorEmbeddingsGroup bool `gorm:"default:true"`
	// use embeddings to tag error groups in this workspace
	ErrorEmbeddingsTagGroup bool `gorm:"default:true"`

	ErrorEmbeddingsThreshold  float64 `gorm:"default:0.2"`
	ReplaceAssets             bool    `gorm:"default:false"`
	StoreIP                   bool    `gorm:"default:false"`
	EnableSessionExport       bool    `gorm:"default:false"`
	EnableIngestSampling      bool    `gorm:"default:false"`
	EnableUnlistedSharing     bool    `gorm:"default:true"`
	EnableNetworkTraces       bool    `gorm:"default:true"`
	EnableBillingLimits       bool    `gorm:"default:false"` // old plans grandfathered in to true
	EnableDataDeletion        bool    `gorm:"default:true"`
	CanShowBillingIssueBanner bool    `gorm:"default:true"`
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
		log.WithContext(context.TODO()).Errorf("error generating hash id: %v", err)
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
	if ints, err := HashID.DecodeWithError(verboseId); err == nil {
		if len(ints) != 1 {
			return 1, e.Errorf("An unsupported verboseID was used: %s", verboseId)
		}
		return ints[0], nil
	}

	return 0, e.New(fmt.Sprintf("failed to decode %s", verboseId))
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
	Name                      *string
	FirstName                 *string
	LastName                  *string
	HubspotContactID          *int
	Email                     *string
	AboutYouDetailsFilled     *bool
	Phone                     *string
	NumberOfSessionsViewed    *int
	NumberOfErrorGroupsViewed *int
	NumberOfLogsViewed        *int
	EmailVerified             *bool            `gorm:"default:false"`
	PhotoURL                  *string          `json:"photo_url"`
	UID                       *string          `gorm:"uniqueIndex"`
	Organizations             []Organization   `gorm:"many2many:organization_admins;"`
	Projects                  []Project        `gorm:"many2many:project_admins;"`
	SessionComments           []SessionComment `gorm:"many2many:session_comment_admins;"`
	ErrorComments             []ErrorComment   `gorm:"many2many:error_comment_admins;"`
	Workspaces                []Workspace      `gorm:"many2many:workspace_admins;"`
	SlackIMChannelID          *string
	// How/where this user was referred from to sign up to Highlight.
	Referral *string `json:"referral"`
	// This is the role the Admin has specified. This is their role in their organization, not within Highlight. This should not be used for authorization checks.
	UserDefinedRole         *string `json:"user_defined_role"`
	UserDefinedTeamSize     *string `json:"user_defined_team_size"`
	UserDefinedPersona      *string `json:"user_defined_persona"`
	HeardAbout              *string `json:"heard_about"`
	PhoneHomeContactAllowed *bool   `json:"phone_home_contact_allowed"`
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
	ClientID string `json:"client_id" gorm:"not null;default:''"`
	// Whether a session has been identified.
	Identified  bool `json:"identified" gorm:"default:false;not null"`
	Fingerprint int  `json:"fingerprint"`
	// User provided identifier (see IdentifySession)
	Identifier     string  `json:"identifier"`
	OrganizationID int     `json:"organization_id"`
	ProjectID      int     `json:"project_id" gorm:"index:idx_project_id_email"`
	Email          *string `json:"email" gorm:"index:idx_project_id_email"`
	// Location data based off user ip (see InitializeSession)
	IP        string  `json:"ip"`
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
	AppVersion     *string  `json:"app_version"`
	ServiceName    string
	UserObject     JSONB  `json:"user_object" sql:"type:jsonb"`
	UserProperties string `json:"user_properties"`
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
	PrivacySetting                 *string `json:"privacy_setting"`
	EnableRecordingNetworkContents *bool   `json:"enable_recording_network_contents"`
	// The version of Highlight's Client.
	ClientVersion string `json:"client_version"`
	// The version of Highlight's Firstload.
	FirstloadVersion string `json:"firstload_version"`
	// The client configuration that the end-user sets up. This is used for debugging purposes.
	ClientConfig *string `json:"client_config" sql:"type:jsonb"`
	// Determines whether this session should be viewable. This enforces billing.
	WithinBillingQuota *bool `json:"within_billing_quota" gorm:"default:true"`
	// Used for shareable links. No authentication is needed if IsPublic is true
	IsPublic bool `json:"is_public" gorm:"default:false"`
	// EventCounts is a len()=100 slice that contains the count of events for the session normalized over 100 points
	EventCounts *string
	// Number of pages visited during a session
	PagesVisited int

	ObjectStorageEnabled  *bool  `json:"object_storage_enabled"`
	DirectDownloadEnabled bool   `json:"direct_download_enabled" gorm:"default:false"`
	AllObjectsCompressed  bool   `json:"all_resources_compressed" gorm:"default:false"`
	PayloadSize           *int64 `json:"payload_size"`
	VerboseID             string `json:"verbose_id"`

	// Excluded will be true when we would typically have deleted the session
	Excluded       bool `gorm:"default:false"`
	ExcludedReason *modelInputs.SessionExcludedReason

	// Lock is the timestamp at which a session was locked
	// - when selecting sessions, ignore Locks that are > 10 minutes old
	//   ex. SELECT * FROM sessions WHERE (lock IS NULL OR lock < NOW() - 10 * (INTERVAL '1 MINUTE'))
	Lock sql.NullTime

	RetryCount int

	// Represents the admins that have viewed this session.
	ViewedByAdmins []Admin `json:"viewed_by_admins" gorm:"many2many:session_admins_views;"`

	Chunked              *bool
	ProcessWithRedis     bool
	AvoidPostgresStorage bool
	Normalness           *float64
}

type SessionAdminsView struct {
	SessionID int       `gorm:"primaryKey"`
	AdminID   int       `gorm:"primaryKey"`
	ViewedAt  time.Time `gorm:"default:NOW()"`
}

type SessionInsight struct {
	Model
	SessionID int `gorm:"index"`
	Insight   string
}

type SessionExportFormat = string

const (
	SessionExportFormatMP4 SessionExportFormat = "video/mp4"
	SessionExportFormatGif SessionExportFormat = "image/gif"
	SessionExportFormatPng SessionExportFormat = "image/png"
)

type SessionExport struct {
	Model
	SessionID    int                 `gorm:"uniqueIndex:idx_session_exports"`
	Type         SessionExportFormat `gorm:"uniqueIndex:idx_session_exports"`
	URL          string
	Error        string
	TargetEmails pq.StringArray `gorm:"type:text[];"`
}

type EventChunk struct {
	Model
	SessionID  int `gorm:"index"`
	ChunkIndex int
	Timestamp  int64
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

type SessionData struct {
	Data string
}

func (sd *SessionData) Contents() string {
	return sd.Data
}

type MessagesObject struct {
	Model
	ID        int `json:"id"` // Shadow Model.ID to avoid creating a pkey constraint
	SessionID int
	Messages  string
	IsBeacon  bool `gorm:"default:false"`
}

type Metric struct {
	CreatedAt     time.Time `json:"created_at" deep:"-"`
	MetricGroupID int       `gorm:"index"`
	Name          string
	Value         float64
	Category      string
}

type MetricGroup struct {
	ID        int `gorm:"primary_key;type:bigserial" json:"id" deep:"-"`
	GroupName string
	SessionID int
	ProjectID int
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
type ErrorGroupingMethod string

const (
	ErrorGroupingMethodClassic             ErrorGroupingMethod = "Classic"
	ErrorGroupingMethodAdaEmbeddingV2      ErrorGroupingMethod = "AdaV2"
	ErrorGroupingMethodGteLargeEmbeddingV2 ErrorGroupingMethod = "thenlper/gte-large"
)

type ErrorObject struct {
	Model
	ID                      int `gorm:"primary_key;type:serial;index:idx_error_group_id_id,priority:2,option:CONCURRENTLY" json:"id" deep:"-"`
	OrganizationID          int
	ProjectID               int `json:"project_id"`
	SessionID               *int
	TraceID                 *string
	SpanID                  *string
	LogCursor               *string `gorm:"index:idx_error_object_log_cursor,option:CONCURRENTLY"`
	ErrorGroupID            int     `gorm:"index:idx_error_group_id_id,priority:1,option:CONCURRENTLY"`
	ErrorGroupIDAlternative int     // the alternative algorithm for grouping the object
	ErrorGroupingMethod     ErrorGroupingMethod
	ErrorGroup              ErrorGroup
	Event                   string
	Type                    string
	URL                     string
	Source                  string
	LineNumber              int
	ColumnNumber            int
	OS                      string
	Browser                 string
	Trace                   *string `json:"trace"` //DEPRECATED, USE STACKTRACE INSTEAD
	StackTrace              *string `json:"stack_trace"`
	MappedStackTrace        *string
	Timestamp               time.Time `json:"timestamp"`
	Payload                 *string   `json:"payload"`
	Environment             string
	RequestID               *string // From X-Highlight-Request header
	IsBeacon                bool    `gorm:"default:false"`
	ServiceName             string
	ServiceVersion          string
}

type ErrorObjectEmbeddings struct {
	Model
	ProjectID         int
	ErrorObjectID     int
	CombinedEmbedding Vector `gorm:"type:vector(1536)"` // 1536 dimensions in the AdaEmbeddingV2 model
	GteLargeEmbedding Vector `gorm:"type:vector(1024)"` // 1024 dimensions in the thenlper/gte-large model
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
	State            modelInputs.ErrorState `json:"state" gorm:"default:OPEN"`
	SnoozedUntil     *time.Time             `json:"snoozed_until"`
	Fields           []*ErrorField          `gorm:"many2many:error_group_fields;" json:"fields"`
	Fingerprints     []*ErrorFingerprint
	FieldGroup       *string
	Environments     string
	IsPublic         bool                                 `gorm:"default:false"`
	ErrorFrequency   []int64                              `gorm:"-"`
	ErrorMetrics     []*modelInputs.ErrorDistributionItem `gorm:"-"`
	FirstOccurrence  *time.Time                           `gorm:"-"`
	LastOccurrence   *time.Time                           `gorm:"-"`
	ErrorObjects     []ErrorObject
	ServiceName      string

	// manually migrate as gorm wants to make this have a default value otherwise
	ErrorTagID *int      `gorm:"-:migration"`
	ErrorTag   *ErrorTag `gorm:"-:migration"`

	// Represents the admins that have viewed this session.
	ViewedByAdmins []Admin `json:"viewed_by_admins" gorm:"many2many:error_group_admins_views;"`
	Viewed         *bool   `json:"viewed"`
}

type ErrorTag struct {
	Model
	Title       string `gorm:"uniqueIndex;not null"`
	Description string
	Embedding   Vector `gorm:"type:vector(1024)"` // 1024 dimensions in the thenlper/gte-large
}

type MatchedErrorObject struct {
	ErrorObject
	Score float64 `json:"score"`
}

type ErrorGroupEventType string

const (
	ErrorGroupResolvedEvent ErrorGroupEventType = "ErrorGroupResolved"
	ErrorGroupIgnoredEvent  ErrorGroupEventType = "ErrorGroupIgnored"
	ErrorGroupOpenedEvent   ErrorGroupEventType = "ErrorGroupOpened"
)

type ErrorGroupActivityLog struct {
	Model
	ErrorGroupID int `gorm:"index"`
	AdminID      int // when this is 0, it means the system generated the event
	Admin        *Admin
	EventType    ErrorGroupEventType
	EventData    JSONB
}

type ErrorGroupAdminsView struct {
	ErrorGroupID int       `gorm:"primaryKey"`
	AdminID      int       `gorm:"primaryKey"`
	ViewedAt     time.Time `gorm:"default:NOW()"`
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

type LogAdminsView struct {
	ID       int       `gorm:"primary_key;type:bigserial" json:"id" deep:"-"`
	ViewedAt time.Time `gorm:"default:NOW()"`
	AdminID  int       `gorm:"primaryKey"`
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

type OAuthClientStore struct {
	ID        string         `gorm:"primary_key;default:uuid_generate_v4()"`
	CreatedAt time.Time      `json:"created_at" deep:"-"`
	Secret    string         `gorm:"uniqueIndex;not null;default:uuid_generate_v4()"`
	Domains   pq.StringArray `gorm:"not null;type:text[]"`
	AppName   string

	AdminID int
	Admin   *Admin

	Operations []*OAuthOperation `gorm:"foreignKey:ClientID"`
}

type OAuthOperation struct {
	Model
	ClientID                   string
	AuthorizedGraphQLOperation string
	MinuteRateLimit            int64 `gorm:"default:600"`
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
	AdminID   int                             `gorm:"uniqueIndex:email_opt_out_admin_category_idx"`
	Category  modelInputs.EmailOptOutCategory `gorm:"uniqueIndex:email_opt_out_admin_category_idx"`
	ProjectID *int                            `gorm:"uniqueIndex:email_opt_out_admin_category_project_idx"`
}

type RawPayloadType string

const (
	PayloadTypeEvents          RawPayloadType = "raw-events"
	PayloadTypeResources       RawPayloadType = "raw-resources"
	PayloadTypeWebSocketEvents RawPayloadType = "raw-web-socket-events"
)

type BillingEmailHistory struct {
	Model
	Active      bool
	WorkspaceID int
	Type        Email.EmailType
}

type UserJourneyStep struct {
	CreatedAt time.Time `json:"created_at" deep:"-"`
	ProjectID int
	SessionID int `gorm:"primary_key;not null"`
	Index     int `gorm:"primary_key;not null"`
	Url       string
	NextUrl   string
}

type SystemConfiguration struct {
	Active            bool `gorm:"primary_key;default:true"`
	MaintenanceStart  time.Time
	MaintenanceEnd    time.Time
	ErrorFilters      pq.StringArray `gorm:"type:text[];default:'{\"ENOENT.*\", \"connect ECONNREFUSED.*\"}'"`
	IgnoredFiles      pq.StringArray `gorm:"type:text[];default:'{\".*\\/node_modules\\/.*\", \".*\\/go\\/pkg\\/mod\\/.*\", \".*\\/site-packages\\/.*\"}'"`
	MainWorkers       int            `gorm:"default:64"`
	LogsWorkers       int            `gorm:"default:1"`
	LogsFlushSize     int            `gorm:"type:bigint;default:1000"`
	LogsQueueSize     int            `gorm:"type:bigint;default:100"`
	LogsFlushTimeout  time.Duration  `gorm:"type:bigint;default:1000000000"`
	DataSyncWorkers   int            `gorm:"default:1"`
	DataSyncFlushSize int            `gorm:"type:bigint;default:1000"`
	DataSyncQueueSize int            `gorm:"type:bigint;default:100"`
	DataSyncTimeout   time.Duration  `gorm:"type:bigint;default:1000000000"`
	TraceWorkers      int            `gorm:"default:1"`
	TraceFlushSize    int            `gorm:"type:bigint;default:1000"`
	TraceQueueSize    int            `gorm:"type:bigint;default:100"`
	TraceFlushTimeout time.Duration  `gorm:"type:bigint;default:1000000000"`
}

type RetryableType string

const (
	RetryableOpensearchError RetryableType = "OPENSEARCH_ERROR"
)

type Retryable struct {
	Model
	Type        RetryableType
	PayloadType string
	PayloadID   string
	Payload     JSONB `sql:"type:jsonb"`
	Error       string
}

func SetupDB(ctx context.Context, dbName string) (*gorm.DB, error) {
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
			log.WithContext(ctx).Error(e.Wrap(err, "failed to compile regex"))
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
	log.WithContext(ctx).Printf("setting up db @ %s\n", host)
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
		CreateBatchSize:                          5000, // Postgres only allows 65535 parameters per insert - this would allow 5000 records with 13 inserted fields each.
	})

	if err != nil {
		return nil, e.Wrap(err, "Failed to connect to database")
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return nil, e.Wrap(err, "error retrieving underlying sql db")
	}
	sqlDB.SetMaxOpenConns(15)

	log.WithContext(ctx).Printf("Finished setting up DB. \n")
	return DB, nil
}

func MigrateDB(ctx context.Context, DB *gorm.DB) (bool, error) {
	log.WithContext(ctx).Printf("Running DB migrations... \n")
	if err := DB.Exec("CREATE EXTENSION IF NOT EXISTS pgcrypto;").Error; err != nil {
		return false, e.Wrap(err, "Error installing pgcrypto")
	}
	if err := DB.Exec("CREATE EXTENSION IF NOT EXISTS vector;").Error; err != nil {
		return false, e.Wrap(err, "Error installing vector")
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
			AND within_billing_quota
			AND (active_length >= 1000 OR (active_length is null and length >= 1000))
			AND processed = true
			AND created_at > now() - interval '3 months'
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

	if err := DB.Exec(`
		CREATE MATERIALIZED VIEW IF NOT EXISTS daily_error_counts_view AS
			SELECT project_id, DATE_TRUNC('day', created_at, 'UTC') as date, COUNT(*) as count
			FROM error_objects
			WHERE created_at > now() - interval '3 months'
			GROUP BY 1, 2;
	`).Error; err != nil {
		return false, e.Wrap(err, "Error creating daily_error_counts_view")
	}

	if err := DB.Exec(`
		DO $$
		BEGIN
			IF NOT EXISTS
				(select * from pg_indexes where indexname = 'idx_daily_error_counts_view_project_id_date')
			THEN
				CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_error_counts_view_project_id_date ON daily_error_counts_view (project_id, date);
			END IF;
		END $$;
	`).Error; err != nil {
		return false, e.Wrap(err, "Error creating idx_daily_error_counts_view_project_id_date")
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
		CREATE TABLE IF NOT EXISTS error_object_embeddings_partitioned
		(LIKE error_object_embeddings INCLUDING DEFAULTS INCLUDING IDENTITY)
		PARTITION BY LIST (project_id);
	`).Error; err != nil {
		return false, e.Wrap(err, "Error creating error_object_embeddings_partitioned")
	}

	var lastVal int
	if err := DB.Raw("SELECT coalesce(max(id), 1) FROM projects").Scan(&lastVal).Error; err != nil {
		return false, e.Wrap(err, "Error selecting max project id")
	}

	var lastCreatedPart int
	// ignore errors - an error means that there are no partitions, so we can safely use the zero-value.
	DB.Raw("select split_part(relname, '_', 5) from pg_stat_all_tables where relname like 'error_object_embeddings_partitioned%' order by relid desc limit 1").Scan(&lastCreatedPart)

	endPart := lastVal + 1000
	if IsDevOrTestEnv() {
		// limit the number of partitions created in dev or test to limit disk usage
		endPart = lastVal + 10
	}
	if IsTestEnv() {
		// create a 0 partition for tests
		lastCreatedPart = -1
	}

	// Make sure partitions are created for the next N projects, starting with the next partition needed
	for i := lastCreatedPart + 1; i < endPart; i++ {
		if err := DB.Exec(fmt.Sprintf(`
			CREATE TABLE IF NOT EXISTS error_object_embeddings_partitioned_%d
			(LIKE error_object_embeddings_partitioned INCLUDING DEFAULTS INCLUDING IDENTITY);
		`, i)).Error; err != nil {
			return false, e.Wrapf(err, "Error creating partitioned error_object_embeddings for index %d", i)
		}

		if err := DB.Exec(fmt.Sprintf(`
			CREATE INDEX ON error_object_embeddings_partitioned_%d
			USING ivfflat (gte_large_embedding vector_l2_ops) WITH (lists = 1000);
		`, i)).Error; err != nil {
			return false, e.Wrapf(err, "Error creating index error_object_embeddings for index %d", i)
		}

		// in case this partition was already attached by a previous failed migration, this will fail.
		// ignore errors
		DB.Exec(fmt.Sprintf(`
			ALTER TABLE error_object_embeddings_partitioned 
			ATTACH PARTITION error_object_embeddings_partitioned_%d
			FOR VALUES IN ('%d');
		`, i, i))
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

	if err := DB.Exec(`alter table error_groups add column IF NOT EXISTS error_tag_id integer`).Error; err != nil {
		return false, e.Wrap(err, "Error adding error_tag_id to error_groups")
	}
	// in case gorm still sets a default / not null constraint
	DB.Exec(`alter table error_groups alter column error_tag_id drop default`)
	DB.Exec(`alter table error_groups alter column error_tag_id drop not null`)

	log.WithContext(ctx).Printf("Finished running DB migrations.\n")

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

// Vector is serialized as '[-0.0123,0.456]' aka like a json list
type Vector []float32

func (j Vector) Value() (driver.Value, error) {
	if len(j) == 0 {
		return nil, nil
	}
	valueString, err := json.Marshal(j)
	return string(valueString), err
}

func (j *Vector) Scan(value interface{}) error {
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
	Name                 string
	Type                 *string `gorm:"index"`
	LastAdminToEditID    int     `gorm:"last_admin_to_edit_id"`
	Frequency            int     `gorm:"default:15"` // time in seconds
	Disabled             *bool   `gorm:"default:false"`
	Default              bool    `gorm:"default:false"` // alert created during setup flow
}

type ErrorAlert struct {
	Model
	Alert
	RegexGroups *string
	AlertIntegrations
}

type ErrorAlertEvent struct {
	ID            int64 `gorm:"primary_key;type:bigserial" json:"id" deep:"-"`
	ErrorAlertID  int   `gorm:"index:idx_error_alert_event"`
	ErrorObjectID int   `gorm:"index:idx_error_alert_event"`
	SentAt        time.Time
}

func SendBillingNotifications(ctx context.Context, db *gorm.DB, mailClient *sendgrid.Client, emailType Email.EmailType, workspace *Workspace) error {
	// Skip sending email if sending was attempted within the cache TTL
	cacheKey := fmt.Sprintf("%s;%d", emailType, workspace.ID)
	_, exists := emailHistoryCache.Get(cacheKey)
	if exists {
		return nil
	}
	emailHistoryCache.Set(cacheKey, true)

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

	toAddrs, err := workspace.AdminEmailAddresses(db)
	if err != nil {
		return err
	}
	var errors []string
	for _, toAddr := range toAddrs {
		err := Email.SendBillingNotificationEmail(ctx, mailClient, workspace.ID, workspace.Name, emailType, toAddr.Email, toAddr.AdminID)
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

type SessionAlertEvent struct {
	ID              int64  `gorm:"primary_key;type:bigserial" json:"id" deep:"-"`
	SessionAlertID  int    `gorm:"index:idx_session_alert_event"`
	SessionSecureID string `gorm:"index:idx_session_alert_event"`
	SentAt          time.Time
}

type Service struct {
	Model
	ProjectID          int                       `gorm:"not null;uniqueIndex:idx_project_id_name"`
	Name               string                    `gorm:"not null;uniqueIndex:idx_project_id_name"`
	Status             modelInputs.ServiceStatus `gorm:"not null;default:created"`
	GithubRepoPath     *string
	BuildPrefix        *string
	GithubPrefix       *string
	ErrorDetails       pq.StringArray `gorm:"type:text[]"`
	ProcessName        *string
	ProcessVersion     *string
	ProcessDescription *string
}

type LogAlert struct {
	Model
	Alert
	Query          string
	BelowThreshold bool
	AlertIntegrations
}

type LogAlertEvent struct {
	ID         int64     `gorm:"primary_key;type:bigserial" json:"id" deep:"-"`
	LogAlertID int       `gorm:"index:idx_log_alert_event"`
	Query      string    `gorm:"index:idx_log_alert_event"`
	StartDate  time.Time `gorm:"index:idx_log_alert_event"`
	EndDate    time.Time `gorm:"index:idx_log_alert_event"`
	SentAt     time.Time
}

type SavedSegment struct {
	Model
	Name       string
	EntityType modelInputs.SavedSegmentEntityType `gorm:"index:idx_saved_segment,priority:2"`
	Params     string                             `json:"params"`
	ProjectID  int                                `gorm:"index:idx_saved_segment,priority:1" json:"project_id"`
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

func (obj *Alert) GetName() string {
	return obj.Name
}

func (obj *Alert) GetEmailsToNotify() ([]*string, error) {
	if obj == nil {
		return nil, e.New("empty session alert object for emails to notify")
	}

	emailsToNotify, err := GetEmailsToNotify(obj.EmailsToNotify)

	return emailsToNotify, err
}

func (obj *Alert) GetDailyErrorEventFrequency(db *gorm.DB, id int) ([]*int64, error) {
	var dailyAlerts []*int64
	if err := db.Raw(`
		SELECT COUNT(e.id)
		FROM (
			SELECT to_char(date_trunc('day', (current_date - offs)), 'YYYY-MM-DD') AS date
			FROM generate_series(0, 6, 1)
			AS offs
		) d
		LEFT OUTER JOIN error_alert_events e
		ON d.date = to_char(date_trunc('day', e.sent_at), 'YYYY-MM-DD')
			AND e.error_alert_id=?
		GROUP BY d.date
		ORDER BY d.date;
	`, id).Scan(&dailyAlerts).Error; err != nil {
		return nil, e.Wrap(err, "error querying daily error event frequency")
	}

	return dailyAlerts, nil
}

func (obj *Alert) GetDailySessionEventFrequency(db *gorm.DB, id int) ([]*int64, error) {
	var dailyAlerts []*int64
	if err := db.Raw(`
		SELECT COUNT(e.id)
		FROM (
			SELECT to_char(date_trunc('day', (current_date - offs)), 'YYYY-MM-DD') AS date
			FROM generate_series(0, 6, 1)
			AS offs
		) d
		LEFT OUTER JOIN session_alert_events e
		ON d.date = to_char(date_trunc('day', e.sent_at), 'YYYY-MM-DD')
			AND e.session_alert_id=?
		GROUP BY d.date
		ORDER BY d.date;
	`, id).Scan(&dailyAlerts).Error; err != nil {
		return nil, e.Wrap(err, "error querying daily session event frequency")
	}

	return dailyAlerts, nil
}

func (obj *Alert) GetDailyLogEventFrequency(db *gorm.DB, id int) ([]*int64, error) {
	var dailyAlerts []*int64
	if err := db.Raw(`
		SELECT COUNT(e.id)
		FROM (
			SELECT to_char(date_trunc('day', (current_date - offs)), 'YYYY-MM-DD') AS date
			FROM generate_series(0, 6, 1)
			AS offs
		) d
		LEFT OUTER JOIN log_alert_events e
		ON d.date = to_char(date_trunc('day', e.sent_at), 'YYYY-MM-DD')
			AND e.log_alert_id=?
		GROUP BY d.date
		ORDER BY d.date;
	`, id).Scan(&dailyAlerts).Error; err != nil {
		return nil, e.Wrap(err, "error querying daily log event frequency")
	}

	return dailyAlerts, nil
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

func (obj *MetricMonitor) GetName() string {
	return obj.Name
}

func (obj *MetricMonitor) GetId() int {
	return obj.ID
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
	ID                   int
	Project              *Project
	IncludeEditLink      bool
	URLSlug              string
}

type DeleteSessionsTask struct {
	TaskID    string `gorm:"index:idx_task_id_batch_id"`
	BatchID   string `gorm:"index:idx_task_id_batch_id"`
	SessionID int
}

type IAlert interface {
	GetChannelsToNotify() ([]*modelInputs.SanitizedSlackChannel, error)
	GetName() string
}

func SendWelcomeSlackMessage(ctx context.Context, obj IAlert, input *SendWelcomeSlackMessageInput) error {
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
	if input.ID == 0 {
		return e.New("ID needs to be defined.")
	}
	if input.URLSlug == "" {
		return e.New("URLSlug needs to be defined.")
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
	alertUrl := fmt.Sprintf("%s/%d/%s/%d", frontendURL, input.Project.Model.ID, input.URLSlug, input.ID)
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
				log.WithContext(ctx).WithFields(log.Fields{"workspace_id": input.Workspace.ID}).
					Error("requested channel has no matching slackWebhookURL when sending welcome message")
				continue
			}

			message := fmt.Sprintf("👋 %s has %s the alert \"%s\". %s %s", *adminName, input.OperationName, obj.GetName(), input.OperationDescription, alertUrl)
			slackChannelId := *channel.WebhookChannelID
			slackChannelName := *channel.WebhookChannel

			go func() {
				// The Highlight Slack bot needs to join the channel before it can send a message.
				// Slack handles a bot trying to join a channel it already is a part of, we don't need to handle it.
				log.WithContext(ctx).Printf("Sending Slack Bot Message for welcome message")
				if slackClient != nil {
					if strings.Contains(slackChannelName, "#") {
						_, _, _, err := slackClient.JoinConversation(slackChannelId)
						if err != nil {
							log.WithContext(ctx).WithFields(log.Fields{"project_id": input.Project.ID}).Error(e.Wrap(err, "failed to join slack channel while sending welcome message"))
						}
					}
					_, _, err := slackClient.PostMessage(slackChannelId, slack.MsgOptionText(message, false),
						slack.MsgOptionDisableLinkUnfurl(),  /** Disables showing a preview of any links that are in the Slack message.*/
						slack.MsgOptionDisableMediaUnfurl(), /** Disables showing a preview of any links that are in the Slack message.*/
					)
					if err != nil {
						log.WithContext(ctx).WithFields(log.Fields{"workspace_id": input.Workspace.ID, "message": fmt.Sprintf("%+v", message)}).
							Error(e.Wrap(err, "error sending slack msg via bot api for welcome message"))
					}

				} else {
					log.WithContext(ctx).Printf("Slack Bot Client was not defined for sending welcome message")
				}
			}()
		}
	}

	return nil
}
