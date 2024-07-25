package destinationsV2

import (
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

type AlertInput struct {
	Alert        *model.Alert
	AlertValue   float64
	Group        string
	GroupValue   string
	SessionInput *SessionInput
	ErrorInput   *ErrorInput
	LogInput     *LogInput
	TraceInput   *TraceInput
	MetricInput  *MetricInput
	WorkspaceID  int
}

type SessionInput struct {
	SecureID         string
	Identifier       string
	SessionLink      string
	MoreSessionsLink string
}

type ErrorInput struct {
	Event             string
	State             modelInputs.ErrorState
	Stacktrace        string
	ErrorLink         string
	ProjectName       string
	ServiceName       string
	SessionSecureID   string
	SessionIdentifier string
	SessionLink       string
	SessionExcluded   bool
}

type LogInput struct {
	LogsLink string
}

type TraceInput struct {
	TracesLink string
}

type MetricInput struct {
	DashboardLink string
}
