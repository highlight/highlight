package worker

import (
	"context"

	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	hmetric "github.com/highlight/highlight/sdk/highlight-go/metric"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/attribute"
)

// MessageHandler defines the interface for handling different message types
type MessageHandler interface {
	Handle(ctx context.Context, w *Worker, task *kafkaqueue.Message) error
	CanHandle(task *kafkaqueue.Message) bool
}

// BaseMessageHandler provides common functionality for all handlers
type BaseMessageHandler struct {
	messageType kafkaqueue.PayloadType
}

// logTaskError logs error with consistent format across all handlers
func logTaskError(ctx context.Context, err error, task *kafkaqueue.Message) {
	log.WithContext(ctx).
		WithError(err).
		WithField("type", task.Type).
		WithField("key", string(task.KafkaMessage.Key)).
		Error("failed to process task")
}

// PushPayloadHandler handles PushPayload messages
type PushPayloadHandler struct {
	BaseMessageHandler
}

func NewPushPayloadHandler() *PushPayloadHandler {
	return &PushPayloadHandler{
		BaseMessageHandler: BaseMessageHandler{messageType: kafkaqueue.PushPayload},
	}
}

func (h *PushPayloadHandler) CanHandle(task *kafkaqueue.Message) bool {
	return task.Type == h.messageType && task.PushPayload != nil
}

func (h *PushPayloadHandler) Handle(ctx context.Context, w *Worker, task *kafkaqueue.Message) error {
	payload := task.PushPayload
	err := w.PublicResolver.ProcessPayload(
		ctx,
		payload.SessionSecureID,
		payload.Events,
		payload.Messages,
		payload.Resources,
		payload.WebSocketEvents,
		payload.Errors,
		payload.IsBeacon != nil && *payload.IsBeacon,
		payload.HasSessionUnloaded != nil && *payload.HasSessionUnloaded,
		payload.HighlightLogs,
		payload.PayloadID,
	)
	if err != nil {
		logTaskError(ctx, err, task)
		return err
	}
	return nil
}

// PushCompressedPayloadHandler handles PushCompressedPayload messages
type PushCompressedPayloadHandler struct {
	BaseMessageHandler
}

func NewPushCompressedPayloadHandler() *PushCompressedPayloadHandler {
	return &PushCompressedPayloadHandler{
		BaseMessageHandler: BaseMessageHandler{messageType: kafkaqueue.PushCompressedPayload},
	}
}

func (h *PushCompressedPayloadHandler) CanHandle(task *kafkaqueue.Message) bool {
	return task.Type == h.messageType && task.PushCompressedPayload != nil
}

func (h *PushCompressedPayloadHandler) Handle(ctx context.Context, w *Worker, task *kafkaqueue.Message) error {
	payload := task.PushCompressedPayload
	err := w.PublicResolver.ProcessCompressedPayload(
		ctx,
		payload.SessionSecureID,
		payload.PayloadID,
		payload.Data,
	)
	if err != nil {
		logTaskError(ctx, err, task)
		return err
	}
	return nil
}

// InitializeSessionHandler handles InitializeSession messages
type InitializeSessionHandler struct {
	BaseMessageHandler
}

func NewInitializeSessionHandler() *InitializeSessionHandler {
	return &InitializeSessionHandler{
		BaseMessageHandler: BaseMessageHandler{messageType: kafkaqueue.InitializeSession},
	}
}

func (h *InitializeSessionHandler) CanHandle(task *kafkaqueue.Message) bool {
	return task.Type == h.messageType && task.InitializeSession != nil
}

func (h *InitializeSessionHandler) Handle(ctx context.Context, w *Worker, task *kafkaqueue.Message) error {
	_, err := w.PublicResolver.InitializeSessionImpl(ctx, task.InitializeSession)
	hmetric.Incr(ctx, "worker.session.initialize.count", []attribute.KeyValue{
		attribute.Bool("success", err == nil),
	}, 1)
	if err != nil {
		logTaskError(ctx, err, task)
		return err
	}
	return nil
}

// IdentifySessionHandler handles IdentifySession messages
type IdentifySessionHandler struct {
	BaseMessageHandler
}

func NewIdentifySessionHandler() *IdentifySessionHandler {
	return &IdentifySessionHandler{
		BaseMessageHandler: BaseMessageHandler{messageType: kafkaqueue.IdentifySession},
	}
}

func (h *IdentifySessionHandler) CanHandle(task *kafkaqueue.Message) bool {
	return task.Type == h.messageType && task.IdentifySession != nil
}

func (h *IdentifySessionHandler) Handle(ctx context.Context, w *Worker, task *kafkaqueue.Message) error {
	payload := task.IdentifySession
	err := w.PublicResolver.IdentifySessionImpl(
		ctx,
		payload.SessionSecureID,
		payload.UserIdentifier,
		payload.UserObject,
		false,
	)
	if err != nil {
		logTaskError(ctx, err, task)
		return err
	}
	return nil
}

// AddTrackPropertiesHandler handles AddTrackProperties messages
type AddTrackPropertiesHandler struct {
	BaseMessageHandler
}

func NewAddTrackPropertiesHandler() *AddTrackPropertiesHandler {
	return &AddTrackPropertiesHandler{
		BaseMessageHandler: BaseMessageHandler{messageType: kafkaqueue.AddTrackProperties},
	}
}

func (h *AddTrackPropertiesHandler) CanHandle(task *kafkaqueue.Message) bool {
	return task.Type == h.messageType && task.AddTrackProperties != nil
}

func (h *AddTrackPropertiesHandler) Handle(ctx context.Context, w *Worker, task *kafkaqueue.Message) error {
	payload := task.AddTrackProperties
	err := w.PublicResolver.AddTrackPropertiesImpl(
		ctx,
		payload.SessionSecureID,
		payload.PropertiesObject,
	)
	if err != nil {
		logTaskError(ctx, err, task)
		return err
	}
	return nil
}

// AddSessionPropertiesHandler handles AddSessionProperties messages
type AddSessionPropertiesHandler struct {
	BaseMessageHandler
}

func NewAddSessionPropertiesHandler() *AddSessionPropertiesHandler {
	return &AddSessionPropertiesHandler{
		BaseMessageHandler: BaseMessageHandler{messageType: kafkaqueue.AddSessionProperties},
	}
}

func (h *AddSessionPropertiesHandler) CanHandle(task *kafkaqueue.Message) bool {
	return task.Type == h.messageType && task.AddSessionProperties != nil
}

func (h *AddSessionPropertiesHandler) Handle(ctx context.Context, w *Worker, task *kafkaqueue.Message) error {
	payload := task.AddSessionProperties
	err := w.PublicResolver.AddSessionPropertiesImpl(
		ctx,
		payload.SessionSecureID,
		payload.PropertiesObject,
	)
	if err != nil {
		logTaskError(ctx, err, task)
		return err
	}
	return nil
}

// PushBackendPayloadHandler handles PushBackendPayload messages
type PushBackendPayloadHandler struct {
	BaseMessageHandler
}

func NewPushBackendPayloadHandler() *PushBackendPayloadHandler {
	return &PushBackendPayloadHandler{
		BaseMessageHandler: BaseMessageHandler{messageType: kafkaqueue.PushBackendPayload},
	}
}

func (h *PushBackendPayloadHandler) CanHandle(task *kafkaqueue.Message) bool {
	return task.Type == h.messageType && task.PushBackendPayload != nil
}

func (h *PushBackendPayloadHandler) Handle(ctx context.Context, w *Worker, task *kafkaqueue.Message) error {
	payload := task.PushBackendPayload
	// Note: ProcessBackendPayloadImpl doesn't return an error
	w.PublicResolver.ProcessBackendPayloadImpl(
		ctx,
		payload.SessionSecureID,
		payload.ProjectVerboseID,
		payload.Errors,
	)
	return nil
}

// PushMetricsHandler handles PushMetrics messages
type PushMetricsHandler struct {
	BaseMessageHandler
}

func NewPushMetricsHandler() *PushMetricsHandler {
	return &PushMetricsHandler{
		BaseMessageHandler: BaseMessageHandler{messageType: kafkaqueue.PushMetrics},
	}
}

func (h *PushMetricsHandler) CanHandle(task *kafkaqueue.Message) bool {
	return task.Type == h.messageType && task.PushMetrics != nil
}

func (h *PushMetricsHandler) Handle(ctx context.Context, w *Worker, task *kafkaqueue.Message) error {
	payload := task.PushMetrics
	err := w.PublicResolver.PushMetricsImpl(
		ctx,
		payload.ProjectVerboseID,
		payload.SessionSecureID,
		payload.Metrics,
	)
	if err != nil {
		logTaskError(ctx, err, task)
		return err
	}
	return nil
}

// AddSessionFeedbackHandler handles AddSessionFeedback messages
type AddSessionFeedbackHandler struct {
	BaseMessageHandler
}

func NewAddSessionFeedbackHandler() *AddSessionFeedbackHandler {
	return &AddSessionFeedbackHandler{
		BaseMessageHandler: BaseMessageHandler{messageType: kafkaqueue.AddSessionFeedback},
	}
}

func (h *AddSessionFeedbackHandler) CanHandle(task *kafkaqueue.Message) bool {
	return task.Type == h.messageType && task.AddSessionFeedback != nil
}

func (h *AddSessionFeedbackHandler) Handle(ctx context.Context, w *Worker, task *kafkaqueue.Message) error {
	err := w.PublicResolver.AddSessionFeedbackImpl(ctx, task.AddSessionFeedback)
	if err != nil {
		logTaskError(ctx, err, task)
		return err
	}
	return nil
}

// HealthCheckHandler handles HealthCheck messages
type HealthCheckHandler struct {
	BaseMessageHandler
}

func NewHealthCheckHandler() *HealthCheckHandler {
	return &HealthCheckHandler{
		BaseMessageHandler: BaseMessageHandler{messageType: kafkaqueue.HealthCheck},
	}
}

func (h *HealthCheckHandler) CanHandle(task *kafkaqueue.Message) bool {
	return task.Type == h.messageType
}

func (h *HealthCheckHandler) Handle(ctx context.Context, w *Worker, task *kafkaqueue.Message) error {
	// Health check is a no-op
	return nil
}

// MessageHandlerRegistry manages all message handlers
type MessageHandlerRegistry struct {
	handlers []MessageHandler
}

// NewMessageHandlerRegistry creates and initializes the handler registry
func NewMessageHandlerRegistry() *MessageHandlerRegistry {
	return &MessageHandlerRegistry{
		handlers: []MessageHandler{
			NewPushPayloadHandler(),
			NewPushCompressedPayloadHandler(),
			NewInitializeSessionHandler(),
			NewIdentifySessionHandler(),
			NewAddTrackPropertiesHandler(),
			NewAddSessionPropertiesHandler(),
			NewPushBackendPayloadHandler(),
			NewPushMetricsHandler(),
			NewAddSessionFeedbackHandler(),
			NewHealthCheckHandler(),
		},
	}
}

// GetHandler returns the appropriate handler for the given task
func (r *MessageHandlerRegistry) GetHandler(task *kafkaqueue.Message) MessageHandler {
	for _, handler := range r.handlers {
		if handler.CanHandle(task) {
			return handler
		}
	}
	return nil
}