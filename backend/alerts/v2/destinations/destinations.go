package destinationsV2

import (
	"time"

	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

type NotificationType string

const (
	NotificationTypeAlertCreated NotificationType = "alert_created"
	NotificationTypeAlertUpdated NotificationType = "alert_updated"
)

type NotificationInput struct {
	NotificationType NotificationType
	WorkspaceID      int
	AlertUpsertInput *AlertUpsertInput
}

type AlertUpsertInput struct {
	Alert *model.Alert
	Admin *model.Admin
}

// specific to alert notifications
type AlertInput struct {
	Alert        *model.Alert
	AlertLink    string
	AlertValue   float64
	Group        string
	GroupValue   string
	ProjectName  string
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
	LogsLink  string
	StartDate time.Time
	EndDate   time.Time
}

type TraceInput struct {
	TracesLink string
	StartDate  time.Time
	EndDate    time.Time
}

type MetricInput struct {
	DashboardLink string
}
