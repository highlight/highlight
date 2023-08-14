package kafka_queue

import (
	"math"
	"time"

	"github.com/leonelquinteros/hubspot"

	"github.com/highlight-run/highlight/backend/clickhouse"

	customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/segmentio/kafka-go"
)

type PayloadType = int

const (
	PushPayload                            PayloadType = iota
	InitializeSession                      PayloadType = iota
	IdentifySession                        PayloadType = iota
	AddTrackProperties                     PayloadType = iota // Deprecated: track events are now processed in pushPayload
	AddSessionProperties                   PayloadType = iota
	PushBackendPayload                     PayloadType = iota
	PushMetrics                            PayloadType = iota
	MarkBackendSetup                       PayloadType = iota // Deprecated: setup events are written from other payload processing
	AddSessionFeedback                     PayloadType = iota
	PushLogs                               PayloadType = iota
	PushTraces                             PayloadType = iota
	HubSpotCreateContactForAdmin           PayloadType = iota
	HubSpotCreateCompanyForWorkspace       PayloadType = iota
	HubSpotUpdateContactProperty           PayloadType = iota
	HubSpotUpdateCompanyProperty           PayloadType = iota
	HubSpotCreateContactCompanyAssociation PayloadType = iota
	SessionDataSync                        PayloadType = iota
	HealthCheck                            PayloadType = math.MaxInt
)

type PushPayloadArgs struct {
	SessionSecureID    string
	Events             customModels.ReplayEventsInput
	Messages           string
	Resources          string
	WebSocketEvents    *string
	Errors             []*customModels.ErrorObjectInput
	IsBeacon           *bool
	HasSessionUnloaded *bool
	HighlightLogs      *string
	PayloadID          *int
}

type InitializeSessionArgs struct {
	SessionSecureID                string
	CreatedAt                      time.Time
	ProjectVerboseID               string
	EnableStrictPrivacy            bool
	EnableRecordingNetworkContents bool
	ClientVersion                  string
	FirstloadVersion               string
	ClientConfig                   string
	Environment                    string
	AppVersion                     *string
	Fingerprint                    string
	UserAgent                      string
	AcceptLanguage                 string
	IP                             string
	ClientID                       string
	NetworkRecordingDomains        []string
	DisableSessionRecording        *bool
}

type IdentifySessionArgs struct {
	SessionSecureID string
	UserIdentifier  string
	UserObject      interface{}
}
type AddTrackPropertiesArgs struct {
	SessionSecureID  string
	PropertiesObject interface{}
}

type AddSessionPropertiesArgs struct {
	SessionSecureID  string
	PropertiesObject interface{}
}
type PushBackendPayloadArgs struct {
	ProjectVerboseID *string
	SessionSecureID  *string
	Errors           []*customModels.BackendErrorObjectInput
}

type PushMetricsArgs struct {
	SessionSecureID string
	SessionID       int
	ProjectID       int
	Metrics         []*customModels.MetricInput
}

type AddSessionFeedbackArgs struct {
	SessionSecureID string
	UserName        *string
	UserEmail       *string
	Verbatim        string
	Timestamp       time.Time
}

type PushLogsArgs struct {
	LogRow *clickhouse.LogRow
}

type PushTracesArgs struct {
	TraceRow *clickhouse.TraceRow
}

type HubSpotCreateContactForAdminArgs struct {
	AdminID            int
	Email              string
	UserDefinedRole    string
	UserDefinedPersona string
	First              string
	Last               string
	Phone              string
	Referral           string
}

type HubSpotCreateCompanyForWorkspaceArgs struct {
	WorkspaceID int
	AdminEmail  string
	Name        string
}

type HubSpotUpdateContactPropertyArgs struct {
	AdminID    int
	Properties []hubspot.Property
}

type HubSpotUpdateCompanyPropertyArgs struct {
	WorkspaceID int
	Properties  []hubspot.Property
}

type HubSpotCreateContactCompanyAssociationArgs struct {
	AdminID     int
	WorkspaceID int
}

type SessionDataSyncArgs struct {
	SessionID int
}

type Message struct {
	Type                                   PayloadType
	Failures                               int
	MaxRetries                             int
	KafkaMessage                           *kafka.Message                              `json:",omitempty"`
	PushPayload                            *PushPayloadArgs                            `json:",omitempty"`
	InitializeSession                      *InitializeSessionArgs                      `json:",omitempty"`
	IdentifySession                        *IdentifySessionArgs                        `json:",omitempty"`
	AddTrackProperties                     *AddTrackPropertiesArgs                     `json:",omitempty"`
	AddSessionProperties                   *AddSessionPropertiesArgs                   `json:",omitempty"`
	PushBackendPayload                     *PushBackendPayloadArgs                     `json:",omitempty"`
	PushMetrics                            *PushMetricsArgs                            `json:",omitempty"`
	AddSessionFeedback                     *AddSessionFeedbackArgs                     `json:",omitempty"`
	PushLogs                               *PushLogsArgs                               `json:",omitempty"`
	PushTraces                             *PushTracesArgs                             `json:",omitempty"`
	HubSpotCreateContactForAdmin           *HubSpotCreateContactForAdminArgs           `json:",omitempty"`
	HubSpotCreateCompanyForWorkspace       *HubSpotCreateCompanyForWorkspaceArgs       `json:",omitempty"`
	HubSpotUpdateContactProperty           *HubSpotUpdateContactPropertyArgs           `json:",omitempty"`
	HubSpotUpdateCompanyProperty           *HubSpotUpdateCompanyPropertyArgs           `json:",omitempty"`
	HubSpotCreateContactCompanyAssociation *HubSpotCreateContactCompanyAssociationArgs `json:",omitempty"`
	SessionDataSync                        *SessionDataSyncArgs                        `json:",omitempty"`
}

type PartitionMessage struct {
	Message   *Message
	Partition int32
}
