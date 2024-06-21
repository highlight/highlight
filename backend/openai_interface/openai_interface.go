package openai_interface

import (
	"context"
	"errors"
	"strings"

	"github.com/sashabaranov/go-openai"
)

const IrrelevantQuery = "who is kim kardashian's husband?"
const IrrelevantQueryFunctionalityIndicator = "If the input query has nothing to do with this prompt, return an empty string."
const defaultQueryResponse = `{"query":"environment=production AND secure_session_id EXISTS","date_range":{"start_date":"","end_date":""}}`

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

type OpenAiTestImpl struct {
}

func (o *OpenAiTestImpl) InitClient(apiKey string) {
}

func (o *OpenAiTestImpl) CreateChatCompletion(request openai.ChatCompletionRequest) (openai.ChatCompletionResponse, error) {
	respMessage := openai.ChatCompletionResponse{
		Choices: []openai.ChatCompletionChoice{
			{
				Index: 0,
				Message: openai.ChatCompletionMessage{
					Content: defaultQueryResponse,
				},
			},
		},
	}

	// find the system prompt
	systemPrompt := ""
	for _, message := range request.Messages {
		if message.Role == "system" {
			systemPrompt = message.Content
			break
		}
	}

	// if an empty query is inputted, return an empty response in the 'query' field
	if request.Messages[len(request.Messages)-1].Content == "" {
		respMessage.Choices[0].Message.Content = `{"query":"","date_range":{"start_date":"","end_date":""}}`
	}

	// if a bad query is inputted, and the prompt handles these inputs, return an empty response in the 'query' field
	if request.Messages[len(request.Messages)-1].Content == IrrelevantQuery && strings.Contains(systemPrompt, IrrelevantQueryFunctionalityIndicator) {
		respMessage.Choices[0].Message.Content = `{"query":"","date_range":{"start_date":"","end_date":""}}`
	}

	return respMessage, nil

}
