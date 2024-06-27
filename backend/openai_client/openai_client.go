package openai_client

import (
	"context"
	"errors"
	"os"

	"github.com/sashabaranov/go-openai"
)

const IrrelevantQuery = "who is kim kardashian's husband?"
const IrrelevantQueryFunctionalityIndicator = "If the input query has nothing to do with this prompt, return an empty string."

var MalformedPromptError = errors.New("empty or incorrect input query")

type OpenAiInterface interface {
	CreateChatCompletion(context context.Context, request openai.ChatCompletionRequest) (openai.ChatCompletionResponse, error)
}

type OpenAiImpl struct {
	client *openai.Client
}

func InitClient() (*OpenAiImpl, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, errors.New("OPENAI_API_KEY is not set")
	}

	client := openai.NewClient(apiKey)
	if client == nil {
		return nil, errors.New("openai client is empty")
	}

	return &OpenAiImpl{
		client: client,
	}, nil
}

func (o *OpenAiImpl) CreateChatCompletion(context context.Context, r openai.ChatCompletionRequest) (openai.ChatCompletionResponse, error) {
	if o.client == nil {
		return openai.ChatCompletionResponse{}, errors.New("openai client is nil")
	}
	return o.client.CreateChatCompletion(context, r)
}
