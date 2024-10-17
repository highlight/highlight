package embeddings

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/util"
	"io"
	"math"
	"net/http"
	"strings"
	"time"

	"gorm.io/gorm"

	e "github.com/pkg/errors"
	"github.com/samber/lo"
	"github.com/sashabaranov/go-openai"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

type EmbeddingType string

// InferenceTimeout is max time to do inference in case api is slow. p95 ~ 0.3s
const InferenceTimeout = 5 * time.Second

const CombinedEmbedding EmbeddingType = "CombinedEmbedding"
const EventEmbedding EmbeddingType = "EventEmbedding"
const StackTraceEmbedding EmbeddingType = "StackTraceEmbedding"
const PayloadEmbedding EmbeddingType = "PayloadEmbedding"

type Client interface {
	GetEmbeddings(ctx context.Context, errors []*model.ErrorObject) ([]*model.ErrorObjectEmbeddings, error)
	GetErrorTagEmbedding(ctx context.Context, title string, description string) (*model.ErrorTag, error)
	GetStringEmbedding(ctx context.Context, text string) ([]float32, error)
}

type OpenAIClient struct {
	client *openai.Client
}

func (c *OpenAIClient) GetEmbeddings(ctx context.Context, errors []*model.ErrorObject) ([]*model.ErrorObjectEmbeddings, error) {
	start := time.Now()
	var combinedErrors []*model.ErrorObject
	var combinedInputs []string
	for _, errorObject := range errors {
		combinedInputs = append(combinedInputs, GetErrorObjectQuery(errorObject))
		combinedErrors = append(combinedErrors, errorObject)
	}

	results := map[int]*model.ErrorObjectEmbeddings{}
	for _, inputs := range []struct {
		inputs    []string
		errors    []*model.ErrorObject
		embedding EmbeddingType
	}{
		{inputs: combinedInputs, errors: combinedErrors, embedding: CombinedEmbedding},
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
			ctx,
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
			WithField("time", time.Since(start).Seconds()).
			WithField("embedding", inputs.embedding).
			Info("AI embedding generated.")

		for idx, errorObject := range inputs.errors {
			if _, ok := results[errorObject.ID]; !ok {
				results[errorObject.ID] = &model.ErrorObjectEmbeddings{
					ProjectID:     errorObject.ProjectID,
					ErrorObjectID: errorObject.ID,
				}
			}
			switch inputs.embedding {
			case CombinedEmbedding:
				results[errorObject.ID].CombinedEmbedding = resp.Data[idx].Embedding
			}
		}
	}

	return lo.Values(results), nil
}

func (c *HuggingfaceModelClient) GetErrorTagEmbedding(ctx context.Context, title string, description string) (*model.ErrorTag, error) {
	input := title + " " + description
	embedding, err := c.GetStringEmbedding(ctx, input)

	if err != nil {
		return nil, err
	}

	errorTag := &model.ErrorTag{
		Title:       title,
		Description: description,
		Embedding:   embedding,
	}

	return errorTag, nil
}

func (c *HuggingfaceModelClient) GetStringEmbedding(ctx context.Context, input string) ([]float32, error) {
	b, err := json.Marshal(HuggingfaceModelInputs{Inputs: input})
	if err != nil {
		return nil, err
	}

	body, err := c.makeRequest(ctx, b)
	if err != nil {
		return nil, err
	}

	var resp struct{ Embeddings []float32 }
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}

	return resp.Embeddings, nil
}

type HuggingfaceModelClient struct {
	client *http.Client
	url    string
	token  string
}

type HuggingfaceModelInputs struct {
	Inputs string `json:"inputs"`
}

func (c *HuggingfaceModelClient) makeRequest(ctx context.Context, b []byte) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.url, bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Authorization", "Bearer "+c.token)
	req.Header.Add("Content-Type", "application/json")
	response, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	if response.StatusCode >= 400 {
		return nil, e.New(fmt.Sprintf("huggingface api request failed: %s", body))
	}
	return body, nil
}

func GetErrorObjectQuery(errorObj *model.ErrorObject) string {
	var stackTrace *string
	if errorObj.MappedStackTrace != nil {
		stackTrace = errorObj.MappedStackTrace
	} else {
		stackTrace = errorObj.StackTrace
	}

	var parts = []string{errorObj.Event, errorObj.Type, errorObj.Source}
	if stackTrace != nil {
		parts = append(parts, *stackTrace)
	}
	if errorObj.Payload != nil {
		parts = append(parts, *errorObj.Payload)
	}

	return strings.Join(parts, " ")
}

func (c *HuggingfaceModelClient) GetEmbeddings(ctx context.Context, errors []*model.ErrorObject) ([]*model.ErrorObjectEmbeddings, error) {
	span, ctx := util.StartSpanFromContext(ctx, "huggingface.GetEmbeddings", util.Tag("num_errors", len(errors)))
	defer span.Finish()
	start := time.Now()
	var combinedInputs []string
	for _, errorObject := range errors {
		combinedInputs = append(combinedInputs, GetErrorObjectQuery(errorObject))
	}

	var results []*model.ErrorObjectEmbeddings
	for idx, input := range combinedInputs {
		b, err := json.Marshal(HuggingfaceModelInputs{Inputs: input})
		if err != nil {
			return nil, err
		}
		body, err := c.makeRequest(ctx, b)
		if err != nil {
			return nil, err
		}

		var resp struct{ Embeddings []float32 }
		if err := json.Unmarshal(body, &resp); err != nil {
			return nil, err
		}

		results = append(results, &model.ErrorObjectEmbeddings{
			ProjectID:         errors[idx].ProjectID,
			ErrorObjectID:     errors[idx].ID,
			GteLargeEmbedding: resp.Embeddings,
		})
	}

	log.WithContext(ctx).
		WithField("time", time.Since(start).Seconds()).
		WithField("errors", len(errors)).
		WithField("type", "huggingface").
		Info("AI embedding generated.")

	return results, nil
}

func MatchErrorTag(ctx context.Context, db *gorm.DB, c Client, query string) ([]*modelInputs.MatchedErrorTag, error) {
	stringEmbedding, err := c.GetStringEmbedding(ctx, query)

	if err != nil {
		return nil, e.Wrap(err, "500: failed to get string embedding")
	}

	var matchedErrorTags []*modelInputs.MatchedErrorTag
	if err := db.WithContext(ctx).Raw(`
		select error_tags.embedding <-> @string_embedding as score,
					error_tags.id as id,
					error_tags.title as title,
					error_tags.description as description
		from error_tags
		order by score
		limit 5;
	`, sql.Named("string_embedding", model.Vector(stringEmbedding))).
		Scan(&matchedErrorTags).Error; err != nil {
		return nil, e.Wrap(err, "error querying nearest ErrorTag")
	}

	return matchedErrorTags, nil
}

func New() Client {
	return &HuggingfaceModelClient{
		client: &http.Client{},
		url:    env.Config.HuggingfaceModelUrl,
		token:  env.Config.HuggingfaceApiToken,
	}
}
