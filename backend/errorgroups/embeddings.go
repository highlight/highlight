package errorgroups

import (
	"context"
	"github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
	"github.com/sashabaranov/go-openai"
	log "github.com/sirupsen/logrus"
	"os"
	"time"
)

func GetEmbeddings(ctx context.Context, errors []*model.ErrorObject) ([]*model.ErrorObjectEmbeddings, error) {
	start := time.Now()
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, e.New("OPENAI_API_KEY is not set")
	}

	var processedErrors []*model.ErrorObject
	var inputs []string
	for _, errorObject := range errors {
		var stackTrace *string
		if errorObject.MappedStackTrace != nil {
			stackTrace = errorObject.MappedStackTrace
		} else {
			stackTrace = errorObject.StackTrace
		}
		// only process errors with metadata and a stack trace
		if stackTrace == nil || errorObject.Payload == nil {
			continue
		}
		inputs = append(inputs, errorObject.Event)
		inputs = append(inputs, *stackTrace)
		inputs = append(inputs, *errorObject.Payload)
		processedErrors = append(processedErrors, errorObject)
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
		WithField("num_error_objects", len(processedErrors)).
		WithField("time", time.Since(start)).
		Info("AI embedding generated.")

	var results []*model.ErrorObjectEmbeddings
	for i := 0; i < len(resp.Data); i += 3 {
		errorObject := processedErrors[i/3]
		results = append(results, &model.ErrorObjectEmbeddings{
			ErrorObjectID:       errorObject.ID,
			TitleEmbedding:      resp.Data[i].Embedding,
			StackTraceEmbedding: resp.Data[i+1].Embedding,
			PayloadEmbedding:    resp.Data[i+2].Embedding,
		})
	}
	return results, nil
}
