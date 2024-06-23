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
	InitClient(string)
	CreateChatCompletion(request openai.ChatCompletionRequest) (openai.ChatCompletionResponse, error)
}

type OpenAiImpl struct {
	client *openai.Client
}

func (o *OpenAiImpl) InitClient(apiKey string) {
	o.client = openai.NewClient(apiKey)
}

func (o *OpenAiImpl) CreateChatCompletion(request openai.ChatCompletionRequest) (openai.ChatCompletionResponse, error) {
	if o.client == nil {
		return openai.ChatCompletionResponse{}, errors.New("openai client is nil")
	}
	return o.client.CreateChatCompletion(context.Background(), request)
}
