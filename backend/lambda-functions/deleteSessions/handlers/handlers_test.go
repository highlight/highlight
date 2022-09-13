package handlers

import (
	"testing"

	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
)

func TestHandlers(t *testing.T) {
	h := NewHandlers()
	input := utils.QuerySessionsInput{
		ProjectId: 1,
		Email: "zane@highlight.io",
		FirstName: "Zane", 
		Query: "",
		SessionCount:,
	}
	h.GetSessionIdsByQuery()
}
