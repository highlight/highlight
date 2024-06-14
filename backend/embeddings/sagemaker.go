package embeddings

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sagemakerruntime"
	"github.com/highlight-run/highlight/backend/model"
)

type SagemakerModelClient struct {
	client *sagemakerruntime.Client
}

type SagemakerModelInputs struct {
	TextInputs []string `json:"text_inputs"`
	Mode       string   `json:"mode"`
}

func (c *SagemakerModelClient) GetStringEmbeddings(ctx context.Context, input []string) ([][]float32, error) {
	b, err := json.Marshal(SagemakerModelInputs{TextInputs: input, Mode: "embedding"})
	if err != nil {
		return nil, err
	}

	out, err := c.client.InvokeEndpoint(ctx, &sagemakerruntime.InvokeEndpointInput{
		Body:         b,
		ContentType:  aws.String("application/json"),
		EndpointName: aws.String("jumpstart-dft-hf-sentencesimilarity-20240611-185933"),
	})
	if err != nil {
		return nil, err
	}

	var resp struct{ Embedding [][]float32 }
	if err := json.Unmarshal(out.Body, &resp); err != nil {
		return nil, err
	}

	return resp.Embedding, nil
}

func NewSagemakerModelClient(ctx context.Context) (*SagemakerModelClient, error) {
	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(model.AWS_REGION_US_EAST_2))
	if err != nil {
		return nil, err
	}

	// creds, err := cfg.Credentials.Retrieve(ctx)
	// if err != nil {
	// 	return nil, err
	// }

	return &SagemakerModelClient{
		client: sagemakerruntime.New(sagemakerruntime.Options{
			Region:      "us-east-2",
			Credentials: cfg.Credentials,
		}),
	}, err
}
