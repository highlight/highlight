package handlers

import (
	"context"
	"fmt"
	"log"
	"testing"

	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
)

func TestHandlers(t *testing.T) {
	h := NewHandlers()
	input := utils.QuerySessionsInput{
		ProjectId:    1,
		Email:        "zane@highlight.io",
		FirstName:    "Zane",
		Query:        "{\"bool\":{\"must\":[{\"bool\":{\"should\":[{\"term\":{\"processed\":\"false\"}}]}},{\"bool\":{\"should\":[{\"range\":{\"created_at\":{\"gte\":\"2022-07-14T16:59:11.000Z\",\"lte\":\"2022-08-13T16:59:18.000Z\"}}}]}}]}}",
		SessionCount: 256,
	}
	out, err := h.GetSessionIdsByQuery(context.TODO(), input)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(out)
}
