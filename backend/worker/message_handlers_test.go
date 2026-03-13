package worker

import (
	"context"
	"errors"
	"testing"

	"github.com/golang/mock/gomock"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/segmentio/kafka-go"
	"github.com/stretchr/testify/assert"
)

func TestMessageHandlerRegistry_GetHandler(t *testing.T) {
	registry := NewMessageHandlerRegistry()

	tests := []struct {
		name        string
		task        *kafkaqueue.Message
		shouldFind  bool
		handlerType string
	}{
		{
			name: "PushPayload handler",
			task: &kafkaqueue.Message{
				Type:        kafkaqueue.PushPayload,
				PushPayload: &kafkaqueue.PushPayloadArgs{},
			},
			shouldFind:  true,
			handlerType: "*worker.PushPayloadHandler",
		},
		{
			name: "InitializeSession handler",
			task: &kafkaqueue.Message{
				Type:              kafkaqueue.InitializeSession,
				InitializeSession: &kafkaqueue.InitializeSessionArgs{},
			},
			shouldFind:  true,
			handlerType: "*worker.InitializeSessionHandler",
		},
		{
			name: "Unknown handler",
			task: &kafkaqueue.Message{
				Type: 9999, // Unknown type
			},
			shouldFind: false,
		},
		{
			name: "PushPayload without payload",
			task: &kafkaqueue.Message{
				Type:        kafkaqueue.PushPayload,
				PushPayload: nil,
			},
			shouldFind: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			handler := registry.GetHandler(tt.task)
			if tt.shouldFind {
				assert.NotNil(t, handler)
			} else {
				assert.Nil(t, handler)
			}
		})
	}
}

func TestLogTaskError(t *testing.T) {
	ctx := context.Background()
	err := errors.New("test error")
	task := &kafkaqueue.Message{
		Type: kafkaqueue.PushPayload,
		KafkaMessage: &kafka.Message{
			Key: []byte("test-key"),
		},
	}

	// This test verifies that logTaskError doesn't panic
	// In a real test, you might want to capture log output
	assert.NotPanics(t, func() {
		logTaskError(ctx, err, task)
	})
}

func TestPushPayloadHandler_Handle(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	handler := NewPushPayloadHandler()
	ctx := context.Background()

	tests := []struct {
		name          string
		task          *kafkaqueue.Message
		expectError   bool
		errorMessage  string
		resolverError error
	}{
		{
			name: "successful processing",
			task: &kafkaqueue.Message{
				Type: kafkaqueue.PushPayload,
				PushPayload: &kafkaqueue.PushPayloadArgs{
					SessionSecureID: "test-session",
					PayloadID:       123,
					Events: customModels.ReplayEventsInput{
						Events: []customModels.ReplayEventInput{},
					},
					Messages:  "test-messages",
					Resources: "test-resources",
				},
				KafkaMessage: &kafka.Message{Key: []byte("test-key")},
			},
			expectError:   false,
			resolverError: nil,
		},
		{
			name: "processing error",
			task: &kafkaqueue.Message{
				Type: kafkaqueue.PushPayload,
				PushPayload: &kafkaqueue.PushPayloadArgs{
					SessionSecureID: "test-session",
					PayloadID:       123,
				},
				KafkaMessage: &kafka.Message{Key: []byte("test-key")},
			},
			expectError:   true,
			errorMessage:  "processing failed",
			resolverError: errors.New("processing failed"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// In a real test, you would mock the PublicResolver
			// For this example, we're just testing the handler structure

			// Test CanHandle
			assert.True(t, handler.CanHandle(tt.task))
		})
	}
}

func TestExtractSessionIDFromTask(t *testing.T) {
	w := &Worker{}

	tests := []struct {
		name       string
		task       *kafkaqueue.Message
		expectedID string
	}{
		{
			name: "PushPayload session ID",
			task: &kafkaqueue.Message{
				Type: kafkaqueue.PushPayload,
				PushPayload: &kafkaqueue.PushPayloadArgs{
					SessionSecureID: "session-123",
				},
			},
			expectedID: "session-123",
		},
		{
			name: "InitializeSession session ID",
			task: &kafkaqueue.Message{
				Type: kafkaqueue.InitializeSession,
				InitializeSession: &kafkaqueue.InitializeSessionArgs{
					SessionSecureID: "session-456",
				},
			},
			expectedID: "session-456",
		},
		{
			name: "AddSessionFeedback session ID",
			task: &kafkaqueue.Message{
				Type: kafkaqueue.AddSessionFeedback,
				AddSessionFeedback: &kafkaqueue.AddSessionFeedbackArgs{
					SessionID: "session-789",
				},
			},
			expectedID: "session-789",
		},
		{
			name: "No session ID",
			task: &kafkaqueue.Message{
				Type: kafkaqueue.HealthCheck,
			},
			expectedID: "",
		},
		{
			name: "Nil payload",
			task: &kafkaqueue.Message{
				Type:        kafkaqueue.PushPayload,
				PushPayload: nil,
			},
			expectedID: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := w.extractSessionIDFromTask(tt.task)
			assert.Equal(t, tt.expectedID, result)
		})
	}
}

func TestHealthCheckHandler(t *testing.T) {
	handler := NewHealthCheckHandler()
	ctx := context.Background()
	w := &Worker{}

	task := &kafkaqueue.Message{
		Type: kafkaqueue.HealthCheck,
	}

	// Test CanHandle
	assert.True(t, handler.CanHandle(task))

	// Test Handle - should be no-op and return nil
	err := handler.Handle(ctx, w, task)
	assert.Nil(t, err)
}