package kafka_queue

import customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"

type PayloadType = int

const (
	PushPayload          PayloadType = iota
	InitializeSession    PayloadType = iota
	IdentifySession      PayloadType = iota
	AddTrackProperties   PayloadType = iota
	AddSessionProperties PayloadType = iota
	PushBackendPayload   PayloadType = iota
)

type PushPayloadArgs struct {
	SessionID          int
	Events             customModels.ReplayEventsInput
	Messages           string
	Resources          string
	Errors             []*customModels.ErrorObjectInput
	IsBeacon           *bool
	HasSessionUnloaded *bool
	HighlightLogs      *string
}

type InitializeSessionArgs struct {
	SessionID int
	IP        string
}

type IdentifySessionArgs struct {
	SessionID      int
	UserIdentifier string
	UserObject     interface{}
}
type AddTrackPropertiesArgs struct {
	SessionID        int
	PropertiesObject interface{}
}
type AddSessionPropertiesArgs struct {
	SessionID        int
	PropertiesObject interface{}
}
type PushBackendPayloadArgs struct {
	SessionSecureID string
	Errors          []*customModels.BackendErrorObjectInput
}

type Message struct {
	Type                 PayloadType
	PushPayload          *PushPayloadArgs
	InitializeSession    *InitializeSessionArgs
	IdentifySession      *IdentifySessionArgs
	AddTrackProperties   *AddTrackPropertiesArgs
	AddSessionProperties *AddSessionPropertiesArgs
	PushBackendPayload   *PushBackendPayloadArgs
}

type PartitionMessage struct {
	Message   *Message
	Partition int32
}
