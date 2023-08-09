package embeddings

import (
	"context"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/samber/lo"
	"github.com/sashabaranov/go-openai"
	log "github.com/sirupsen/logrus"
	"math"
	"os"
	"time"
)

type EmbeddingType string

const CombinedEmbedding EmbeddingType = "CombinedEmbedding"
const EventEmbedding EmbeddingType = "EventEmbedding"
const StackTraceEmbedding EmbeddingType = "StackTraceEmbedding"
const PayloadEmbedding EmbeddingType = "PayloadEmbedding"

type Client interface {
	GetEmbeddings(ctx context.Context, errors []*model.ErrorObject) ([]*model.ErrorObjectEmbeddings, error)
}

type OpenAIClient struct {
	client *openai.Client
}

func New() Client {
	return &OpenAIClient{client: openai.NewClient(os.Getenv("OPENAI_API_KEY"))}
}

func (c *OpenAIClient) GetEmbeddings(ctx context.Context, errors []*model.ErrorObject) ([]*model.ErrorObjectEmbeddings, error) {
	start := time.Now()
	var combinedErrors, eventErrors, stacktraceErrors, payloadErrors []*model.ErrorObject
	var combinedInputs, eventInputs, stacktraceInputs, payloadInputs []string
	for _, errorObject := range errors {
		var stackTrace *string
		if errorObject.MappedStackTrace != nil {
			stackTrace = errorObject.MappedStackTrace
		} else {
			stackTrace = errorObject.StackTrace
		}
		combinedInput := errorObject.Event
		if stackTrace != nil {
			stacktraceInputs = append(stacktraceInputs, *stackTrace)
			stacktraceErrors = append(stacktraceErrors, errorObject)
			combinedInput = combinedInput + " " + *stackTrace
		}
		if errorObject.Payload != nil {
			payloadInputs = append(payloadInputs, *errorObject.Payload)
			payloadErrors = append(payloadErrors, errorObject)
			combinedInput = combinedInput + " " + *errorObject.Payload
		}
		combinedInputs = append(combinedInputs, combinedInput)
		combinedErrors = append(combinedErrors, errorObject)
		if combinedInput != errorObject.Event {
			eventInputs = append(eventInputs, errorObject.Event)
			eventErrors = append(eventErrors, errorObject)
		}
	}

	results := map[int]*model.ErrorObjectEmbeddings{}
	for _, inputs := range []struct {
		inputs    []string
		errors    []*model.ErrorObject
		embedding EmbeddingType
	}{
		{inputs: combinedInputs, errors: combinedErrors, embedding: CombinedEmbedding},
		{inputs: eventInputs, errors: eventErrors, embedding: EventEmbedding},
		{inputs: stacktraceInputs, errors: stacktraceErrors, embedding: StackTraceEmbedding},
		{inputs: payloadInputs, errors: payloadErrors, embedding: PayloadEmbedding},
	} {
		if len(inputs.inputs) == 0 {
			continue
		}
		inputs.inputs = lo.Map(inputs.inputs, func(item string, index int) string {
			if math.Ceil(float64(len(item))/4.0) >= 8191 {
				log.WithContext(ctx).WithField("length", len(item)).WithField("item", item).Warn("truncating embedding input")
				return item[:32760]
			}
			return item
		})
		resp, err := c.client.CreateEmbeddings(
			context.Background(),
			openai.EmbeddingRequest{
				Input: inputs.inputs,
				Model: openai.AdaEmbeddingV2,
				User:  "highlight-io",
			},
		)
		if err != nil {
			return nil, err
		}
		log.WithContext(ctx).
			WithField("num_inputs", len(inputs.inputs)).
			WithField("time", time.Since(start)).
			WithField("embedding", inputs.embedding).
			Info("AI embedding generated.")

		for idx, errorObject := range inputs.errors {
			if _, ok := results[errorObject.ID]; !ok {
				results[errorObject.ID] = &model.ErrorObjectEmbeddings{ErrorObjectID: errorObject.ID}
			}
			switch inputs.embedding {
			case CombinedEmbedding:
				results[errorObject.ID].CombinedEmbedding = resp.Data[idx].Embedding
			case EventEmbedding:
				results[errorObject.ID].EventEmbedding = resp.Data[idx].Embedding
			case StackTraceEmbedding:
				results[errorObject.ID].StackTraceEmbedding = resp.Data[idx].Embedding
			case PayloadEmbedding:
				results[errorObject.ID].PayloadEmbedding = resp.Data[idx].Embedding
			}
		}
	}

	return lo.Values(results), nil
}
