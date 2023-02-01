package kafka_queue

import (
	"github.com/highlight-run/highlight/backend/clickhouse"
	"math"
	"time"

	customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/segmentio/kafka-go"
)

type PayloadType = int

const (
	PushPayload          PayloadType = iota
	InitializeSession    PayloadType = iota
	IdentifySession      PayloadType = iota
	AddTrackProperties   PayloadType = iota // Deprecated: track events are now processed in pushPayload
	AddSessionProperties PayloadType = iota
	PushBackendPayload   PayloadType = iota
	PushMetrics          PayloadType = iota
	MarkBackendSetup     PayloadType = iota
	AddSessionFeedback   PayloadType = iota
	PushLogs             PayloadType = iota
	HealthCheck          PayloadType = math.MaxInt
)

type PushPayloadArgs struct {
	SessionSecureID    string
	Events             customModels.ReplayEventsInput
	Messages           string
	Resources          string
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

type MarkBackendSetupArgs struct {
	ProjectVerboseID *string
	SessionSecureID  *string
	ProjectID        int
}

type AddSessionFeedbackArgs struct {
	SessionSecureID string
	UserName        *string
	UserEmail       *string
	Verbatim        string
	Timestamp       time.Time
}

type PushLogsArgs struct {
	SessionSecureID string
	LogRows         []*clickhouse.LogRow
}

type Message struct {
	Type                 PayloadType
	Failures             int
	MaxRetries           int
	KafkaMessage         *kafka.Message
	PushPayload          *PushPayloadArgs
	InitializeSession    *InitializeSessionArgs
	IdentifySession      *IdentifySessionArgs
	AddTrackProperties   *AddTrackPropertiesArgs
	AddSessionProperties *AddSessionPropertiesArgs
	PushBackendPayload   *PushBackendPayloadArgs
	PushMetrics          *PushMetricsArgs
	MarkBackendSetup     *MarkBackendSetupArgs
	AddSessionFeedback   *AddSessionFeedbackArgs
	PushLogs             *PushLogsArgs
}

type PartitionMessage struct {
	Message   *Message
	Partition int32
}
