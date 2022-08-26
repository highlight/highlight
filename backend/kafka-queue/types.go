package kafka_queue

import (
	"time"

	customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/segmentio/kafka-go"
)

type PayloadType = int

const (
	PushPayload          PayloadType = 0
	InitializeSession    PayloadType = 1
	IdentifySession      PayloadType = 2
	AddSessionProperties PayloadType = 4
	PushBackendPayload   PayloadType = 5
	PushMetrics          PayloadType = 6
	MarkBackendSetup     PayloadType = 7
	AddSessionFeedback   PayloadType = 8
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
}

type IdentifySessionArgs struct {
	SessionSecureID string
	UserIdentifier  string
	UserObject      interface{}
}
type AddSessionPropertiesArgs struct {
	SessionSecureID  string
	PropertiesObject interface{}
}
type PushBackendPayloadArgs struct {
	SessionSecureID string
	Errors          []*customModels.BackendErrorObjectInput
}

type PushMetricsArgs struct {
	SecureID  string
	SessionID int
	ProjectID int
	Metrics   []*customModels.MetricInput
}

type MarkBackendSetupArgs struct {
	SecureID  string
	ProjectID int
}

type AddSessionFeedbackArgs struct {
	SecureID  string
	UserName  *string
	UserEmail *string
	Verbatim  string
	Timestamp time.Time
}

type Message struct {
	Type                 PayloadType
	Failures             int
	MaxRetries           int
	KafkaMessage         *kafka.Message
	PushPayload          *PushPayloadArgs
	InitializeSession    *InitializeSessionArgs
	IdentifySession      *IdentifySessionArgs
	AddSessionProperties *AddSessionPropertiesArgs
	PushBackendPayload   *PushBackendPayloadArgs
	PushMetrics          *PushMetricsArgs
	MarkBackendSetup     *MarkBackendSetupArgs
	AddSessionFeedback   *AddSessionFeedbackArgs
}

type PartitionMessage struct {
	Message   *Message
	Partition int32
}
