package handlers

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/lambda-functions/sessionInsights/utils"
	log "github.com/sirupsen/logrus"
)

func TestHandlerChaining(t *testing.T) {
	h := NewHandlers()

	ctx := context.TODO()
	input := utils.ProjectIdResponse{
		ProjectId: 1,
		Start:     time.Now().AddDate(0, 0, -7),
		End:       time.Now().AddDate(0, 0, 0),
		DryRun:    true,
	}

	res, err := h.GetSessionInsightsData(ctx, input)
	if err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	fmt.Println(res)

	// input := utils.SessionInsightsData{
	// 	ProjectId:   1,
	// 	EndFmt:      "07/11",
	// 	StartFmt:    "07/04",
	// 	ProjectName: "Highlight Production (app.highlight.io)",
	// 	UseHarold:   true,
	// 	InterestingSessions: []utils.InterestingSession{
	// 		{
	// 			Identifier:   "jay@highlight.io",
	// 			AvatarUrl:    "https://lh3.googleusercontent.com/a-/AOh14Gg3zY3_wfixRrZjjMuj2eTrBAOKDZrDWeYlHsjL=s96-c",
	// 			Country:      "United States",
	// 			ActiveLength: "27m",
	// 			URL:          "https://app.highlight.io/1/sessions/RiOZwNK2IpvQ3jFfHycDkVjZNjXf",
	// 			Insights:     []string{},
	// 			Id:           253715667,
	// 		},
	// 		{
	// 			Identifier:   "julian@highlight.io",
	// 			AvatarUrl:    "https://lh3.googleusercontent.com/a/ALm5wu0WKi8uPbzypvzb8uT9lDChjShv0rLSaGYUiqTH=s96-c",
	// 			Country:      "Germany",
	// 			ActiveLength: "1h12m",
	// 			URL:          "https://app.highlight.io/1/sessions/obVAwehoKU5wNp970jSeEuoC2MZ4",
	// 			Insights:     []string{},
	// 			Id:           253593337,
	// 		},
	// 		{
	// 			Identifier:   "angel.gonzalez@resuelve.mx",
	// 			AvatarUrl:    "https://lh3.googleusercontent.com/a/AAcHTtfW36jgqLzCQa_c4QYYDekHEBPKu6_dvholwWwgYvNszQ=s96-c",
	// 			Country:      "Mexico",
	// 			ActiveLength: "18m",
	// 			URL:          "https://app.highlight.io/1/sessions/tXuKMXQpgt9DWRIYGpTMOIRbQ36S",
	// 			Insights:     []string{},
	// 			Id:           253556204,
	// 		},
	// 	},
	// 	DryRun:         true,
	// 	ToEmail:        "",
	// 	UnsubscribeUrl: "",
	// }

	// err := h.SendSessionInsightsEmails(ctx, input)
	// if err != nil {
	// 	log.WithContext(ctx).Fatal(err)
	// }
}
