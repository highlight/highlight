package handlers

import (
	"context"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/lambda-functions/sessionInsights/utils"
	log "github.com/sirupsen/logrus"
)

func TestHandlerChaining(t *testing.T) {
	h := NewHandlers()
	input := utils.ProjectIdResponse{
		ProjectId: 1,
		Start:     time.Now().AddDate(0, 0, -7),
		End:       time.Now().AddDate(0, 0, 0),
		DryRun:    true,
	}

	ctx := context.TODO()

	data, err := h.GetSessionInsightsData(ctx, input)
	if err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	err = h.SendSessionInsightsEmails(ctx, *data)
	if err != nil {
		log.WithContext(ctx).Fatal(err)
	}
}
