package kafka_queue

import (
	"context"
	"math"
	"time"

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
	PushLogs                               PayloadType = iota // Deprecated: use a LogRowMessage with payload type PushLogsFlattened
	PushTraces                             PayloadType = iota
	HubSpotCreateContactForAdmin           PayloadType = iota // Deprecated: noop
	HubSpotCreateCompanyForWorkspace       PayloadType = iota // Deprecated: noop
	HubSpotUpdateContactProperty           PayloadType = iota // Deprecated: noop
	HubSpotUpdateCompanyProperty           PayloadType = iota // Deprecated: noop
	HubSpotCreateContactCompanyAssociation PayloadType = iota // Deprecated: noop
	SessionDataSync                        PayloadType = iota
	ErrorGroupDataSync                     PayloadType = iota
	ErrorObjectDataSync                    PayloadType = iota
	PushCompressedPayload                  PayloadType = iota
	PushLogsFlattened                      PayloadType = iota
	PushTracesFlattened                    PayloadType = iota
	HealthCheck                            PayloadType = math.MaxInt
)

type PushCompressedPayloadArgs struct {
	SessionSecureID string
	PayloadID       int
	Data            string `json:"data"`
}

type PushPayloadArgs struct {
	SessionSecureID    string
	PayloadID          *int
	Events             customModels.ReplayEventsInput   `json:"events"`
	Messages           string                           `json:"messages"`
	Resources          string                           `json:"resources"`
	WebSocketEvents    *string                          `json:"web_socket_events"`
	Errors             []*customModels.ErrorObjectInput `json:"errors"`
	IsBeacon           *bool                            `json:"is_beacon"`
	HasSessionUnloaded *bool                            `json:"has_session_unloaded"`
	HighlightLogs      *string                          `json:"highlight_logs"`
}

type InitializeSessionArgs struct {
	SessionSecureID                string
	CreatedAt                      time.Time
	ProjectVerboseID               string
	EnableStrictPrivacy            bool
	PrivacySetting                 *string
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
	ServiceName                    string
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
	ProjectVerboseID *string
	SessionSecureID  *string
	Metrics          []*customModels.MetricInput
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

type SessionDataSyncArgs struct {
	SessionID int
}

type ErrorGroupDataSyncArgs struct {
	ErrorGroupID int
}

type ErrorObjectDataSyncArgs struct {
	ErrorObjectID int
}

type RetryableMessage interface {
	GetType() PayloadType
	GetFailures() int
	SetFailures(value int)
	GetMaxRetries() int
	SetMaxRetries(value int)
	GetKafkaMessage() *kafka.Message
	SetKafkaMessage(value *kafka.Message)
}

type Message struct {
	Type                  PayloadType
	Failures              int
	MaxRetries            int
	KafkaMessage          *kafka.Message             `json:",omitempty"`
	PushPayload           *PushPayloadArgs           `json:",omitempty"`
	InitializeSession     *InitializeSessionArgs     `json:",omitempty"`
	IdentifySession       *IdentifySessionArgs       `json:",omitempty"`
	AddTrackProperties    *AddTrackPropertiesArgs    `json:",omitempty"`
	AddSessionProperties  *AddSessionPropertiesArgs  `json:",omitempty"`
	PushBackendPayload    *PushBackendPayloadArgs    `json:",omitempty"`
	PushMetrics           *PushMetricsArgs           `json:",omitempty"`
	AddSessionFeedback    *AddSessionFeedbackArgs    `json:",omitempty"`
	PushLogs              *PushLogsArgs              `json:",omitempty"`
	PushTraces            *PushTracesArgs            `json:",omitempty"`
	SessionDataSync       *SessionDataSyncArgs       `json:",omitempty"`
	ErrorGroupDataSync    *ErrorGroupDataSyncArgs    `json:",omitempty"`
	ErrorObjectDataSync   *ErrorObjectDataSyncArgs   `json:",omitempty"`
	PushCompressedPayload *PushCompressedPayloadArgs `json:",omitempty"`
}

func (m *Message) GetType() PayloadType {
	return m.Type
}

func (m *Message) GetFailures() int {
	return m.Failures
}

func (m *Message) SetFailures(value int) {
	m.Failures = value
}

func (m *Message) GetMaxRetries() int {
	return m.MaxRetries
}

func (m *Message) SetMaxRetries(value int) {
	m.MaxRetries = value
}

func (m *Message) GetKafkaMessage() *kafka.Message {
	return m.KafkaMessage
}

func (m *Message) SetKafkaMessage(value *kafka.Message) {
	m.KafkaMessage = value
}

type LogRowMessage struct {
	Type         PayloadType
	Failures     int
	MaxRetries   int
	KafkaMessage *kafka.Message `json:",omitempty"`
	*clickhouse.LogRow
}

func (m *LogRowMessage) GetType() PayloadType {
	return PushLogsFlattened
}

func (m *LogRowMessage) GetFailures() int {
	return m.Failures
}

func (m *LogRowMessage) SetFailures(value int) {
	m.Failures = value
}

func (m *LogRowMessage) GetMaxRetries() int {
	return m.MaxRetries
}

func (m *LogRowMessage) SetMaxRetries(value int) {
	m.MaxRetries = value
}

func (m *LogRowMessage) GetKafkaMessage() *kafka.Message {
	return m.KafkaMessage
}
func (m *LogRowMessage) SetKafkaMessage(value *kafka.Message) {
	m.KafkaMessage = value
}

type TraceRowMessage struct {
	Type         PayloadType
	Failures     int
	MaxRetries   int
	KafkaMessage *kafka.Message `json:",omitempty"`
	*clickhouse.ClickhouseTraceRow
}

func (m *TraceRowMessage) GetType() PayloadType {
	return PushTracesFlattened
}

func (m *TraceRowMessage) GetFailures() int {
	return m.Failures
}

func (m *TraceRowMessage) SetFailures(value int) {
	m.Failures = value
}

func (m *TraceRowMessage) GetMaxRetries() int {
	return m.MaxRetries
}

func (m *TraceRowMessage) SetMaxRetries(value int) {
	m.MaxRetries = value
}

func (m *TraceRowMessage) GetKafkaMessage() *kafka.Message {
	return m.KafkaMessage
}
func (m *TraceRowMessage) SetKafkaMessage(value *kafka.Message) {
	m.KafkaMessage = value
}

type MockMessageQueue struct{}

func (k *MockMessageQueue) Stop(context.Context) {

}

func (k *MockMessageQueue) Receive(context.Context) RetryableMessage {
	return nil
}

func (k *MockMessageQueue) Submit(context.Context, string, ...RetryableMessage) error {
	return nil
}

func (k *MockMessageQueue) LogStats() {

}
