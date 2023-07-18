package errorgroups

import (
	"context"
	"github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
	"github.com/sashabaranov/go-openai"
	log "github.com/sirupsen/logrus"
	"os"
)

func GetEmbeddings(ctx context.Context, error *model.ErrorObject) ([]float32, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, e.New("OPENAI_API_KEY is not set")
	}

	client := openai.NewClient(apiKey)
	resp, err := client.CreateEmbeddings(
		context.Background(),
		openai.EmbeddingRequest{
			// TODO(vkorolik) batch this?
			Input: []string{error.Event},
			Model: openai.AdaEmbeddingV2,
			User:  "highlight-io",
		},
	)

	if err != nil {
		return nil, err
	}

	log.WithContext(ctx).
		WithField("error_object_id", error.ID).
		WithField("response_index", resp.Data[0].Index).
		WithField("response_object", resp.Data[0].Object).
		WithField("response_embedding_len", len(resp.Data[0].Embedding)).
		Info("AI embedding generated.")

	return resp.Data[0].Embedding, nil
}
