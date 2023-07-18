package errorgroups

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
	"github.com/sashabaranov/go-openai"
	log "github.com/sirupsen/logrus"
	"os"
	"time"
)

func GetEmbeddings(ctx context.Context, errors []*model.ErrorObject) (map[int][]float32, error) {
	start := time.Now()
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, e.New("OPENAI_API_KEY is not set")
	}

	var inputs []string
	for _, errorObject := range errors {
		var stackTrace *string
		if errorObject.MappedStackTrace != nil {
			stackTrace = errorObject.MappedStackTrace
		} else {
			stackTrace = errorObject.StackTrace
		}
		inputs = append(inputs, fmt.Sprintf(`Title: '%s' Stack trace: '%v'`, errorObject.Event, *stackTrace))
	}

	client := openai.NewClient(apiKey)
	resp, err := client.CreateEmbeddings(
		context.Background(),
		openai.EmbeddingRequest{
			Input: inputs,
			Model: openai.AdaEmbeddingV2,
			User:  "highlight-io",
		},
	)

	if err != nil {
		return nil, err
	}

	log.WithContext(ctx).
		WithField("num_error_objects", len(errors)).
		WithField("time", time.Since(start)).
		Info("AI embedding generated.")

	results := map[int][]float32{}
	for idx, errorObject := range errors {
		results[errorObject.ID] = resp.Data[idx].Embedding
	}
	return results, nil
}
