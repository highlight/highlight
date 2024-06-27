package openai_client

import (
	"context"
	"errors"

	"github.com/sashabaranov/go-openai"
)

const IrrelevantQuery = "who is kim kardashian's husband?"
const IrrelevantQueryFunctionalityIndicator = "If the input query has nothing to do with this prompt, return an empty string."

var MalformedPromptError = errors.New("empty or incorrect input query")

type OpenAiInterface interface {
	InitClient(string) error
	CreateChatCompletion(context context.Context, request openai.ChatCompletionRequest) (openai.ChatCompletionResponse, error)
}

type OpenAiImpl struct {
	client *openai.Client
}

func (o *OpenAiImpl) InitClient(apiKey string) error {
	o.client = openai.NewClient(apiKey)
	if o.client == nil {
		return errors.New("openai client is empty, api key may be incorrect")
	}
	return nil
}

func (o *OpenAiImpl) CreateChatCompletion(context context.Context, r openai.ChatCompletionRequest) (openai.ChatCompletionResponse, error) {
	if o.client == nil {
		return openai.ChatCompletionResponse{}, errors.New("openai client is nil")
	}
	return o.client.CreateChatCompletion(context, r)
}
