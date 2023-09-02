package utils

import (
	"github.com/highlight-run/highlight/backend/model"
)

type SendEmailInput struct {
	ProjectId       int      `json:"projectId"`
	SessionSecureId string   `json:"sessionSecureId"`
	User            string   `json:"user"`
	TargetEmails    []string `json:"targetEmails"`
}

type SaveSessionExportInput struct {
	SessionID    int                       `json:"sessionId"`
	Type         model.SessionExportFormat `json:"type"`
	URL          string                    `json:"url"`
	TargetEmails []string                  `json:"targetEmails"`
}
