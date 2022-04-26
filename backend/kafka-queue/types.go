package kafka_queue

import customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"

const (
	PushPayload       = iota
	InitializeSession = iota
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

type Message struct {
	Type              int // PayloadType
	PushPayload       *PushPayloadArgs
	InitializeSession *InitializeSessionArgs
}

type PartitionMessage struct {
	Message   *Message
	Partition int32
}
