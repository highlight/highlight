package stepfunctions

import (
	"context"
	"encoding/json"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sfn"
	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/openlyinc/pointy"
)

var (
	deleteSessionsArn = os.Getenv("DELETE_SESSIONS_ARN")
)

type Client struct {
	client *sfn.Client
}

func NewClient() *Client {
	if util.IsDevOrTestEnv() {
		return nil
	}

	cfg, err := config.LoadDefaultConfig(context.Background(), config.WithRegion(model.AWS_REGION_US_EAST_2))
	if err != nil {
		return nil
	}

	return &Client{
		client: sfn.New(sfn.Options{
			Credentials: cfg.Credentials,
			Region:      model.AWS_REGION_US_EAST_2,
		}),
	}
}

func (c *Client) DeleteSessionsByQuery(ctx context.Context, input utils.QuerySessionsInput) (*string, error) {
	marshaled, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}

	output, err := c.client.StartExecution(context.Background(), &sfn.StartExecutionInput{
		StateMachineArn: &deleteSessionsArn,
		Input:           pointy.String(string(marshaled)),
		Name:            pointy.String(uuid.New().String()),
	})
	return output.ExecutionArn, err
}
