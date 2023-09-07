package utils

import (
	"github.com/highlight-run/highlight/backend/model"
)

type SessionExportInput struct {
	Project      int      `json:"project"`
	Session      int      `json:"session"`
	Format       string   `json:"format"`
	TargetEmails []string `json:"targetEmails"`
}

type SaveSessionExportInput struct {
	SessionID    int                       `json:"sessionId"`
	Type         model.SessionExportFormat `json:"type"`
	URL          string                    `json:"url"`
	TargetEmails []string                  `json:"targetEmails"`
}

type SendEmailInput struct {
	ProjectId       int      `json:"projectId"`
	SessionSecureId string   `json:"sessionSecureId"`
	User            string   `json:"user"`
	URL             string   `json:"url"`
	TargetEmails    []string `json:"targetEmails"`
}
