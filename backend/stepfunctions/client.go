package stepfunctions

import (
	"context"
	"encoding/json"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sfn"
	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/openlyinc/pointy"
	"github.com/pkg/errors"

	"github.com/highlight-run/highlight/backend/lambda-functions/deleteSessions/utils"
	utils2 "github.com/highlight-run/highlight/backend/lambda-functions/sessionExport/utils"
	"github.com/highlight-run/highlight/backend/model"
)

var (
	deleteSessionsArn = env.Config.DeleteSessionsArn
	sessionExportArn  = "arn:aws:states:us-east-2:173971919437:stateMachine:SessionExport"
)

type Client struct {
	client *sfn.Client
}

func NewClient() *Client {
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
		return nil, errors.Wrap(err, "error marshaling DeleteSessionsByQuery input")
	}

	output, err := c.client.StartExecution(context.Background(), &sfn.StartExecutionInput{
		StateMachineArn: &deleteSessionsArn,
		Input:           pointy.String(string(marshaled)),
		Name:            pointy.String(uuid.New().String()),
	})
	return output.ExecutionArn, err
}

func (c *Client) SessionExport(ctx context.Context, input utils2.SessionExportInput) (*string, error) {
	marshaled, err := json.Marshal(input)
	if err != nil {
		return nil, errors.Wrap(err, "error marshaling SessionExport input")
	}

	output, err := c.client.StartExecution(context.Background(), &sfn.StartExecutionInput{
		StateMachineArn: &sessionExportArn,
		Input:           pointy.String(string(marshaled)),
		Name:            pointy.String(uuid.New().String()),
	})
	return output.ExecutionArn, err
}
