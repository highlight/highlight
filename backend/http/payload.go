package http

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/private-graph/graph/model"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	semconv "go.opentelemetry.io/otel/semconv/v1.25.0"
	"strconv"
	"strings"
	"time"
)

type PayloadMessage interface {
	GetMessage() string
	GetLevel() string
	GetTimestamp() *time.Time
	SetLogAttributes(ctx context.Context, hl *hlog.Log, msg []byte) context.Context
}

type CloudWatchPayloadMessage struct {
	Payload   *CloudWatchPayload `json:",omitempty"`
	Id        string
	Timestamp int64
	Message   string
}

func (p *CloudWatchPayloadMessage) GetMessage() string {
	return p.Message
}

func (p *CloudWatchPayloadMessage) GetLevel() string {
	return model.LogLevelInfo.String()
}

func (p *CloudWatchPayloadMessage) GetTimestamp() *time.Time {
	return ptr.Time(time.UnixMilli(p.Timestamp))
}

func (p *CloudWatchPayloadMessage) SetLogAttributes(ctx context.Context, hl *hlog.Log, msg []byte) context.Context {
	hl.Attributes = map[string]string{
		string(semconv.ServiceNameKey): "firehose.cloudwatch",
		"message_type":                 p.Payload.MessageType,
		"owner":                        p.Payload.Owner,
		"log_group":                    p.Payload.LogGroup,
		"log_stream":                   p.Payload.LogStream,
	}
	return ctx
}

type Payload interface {
	Parse([]byte) bool
	GetMessages() []PayloadMessage
}

type CloudWatchPayload struct {
	MessageType         string
	Owner               string
	LogGroup            string
	LogStream           string
	SubscriptionFilters []string
	LogEvents           []CloudWatchPayloadMessage
}

func (p *CloudWatchPayload) Parse(msg []byte) bool {
	err := json.Unmarshal(msg, p)
	return err == nil && len(p.LogEvents) > 0
}

func (p *CloudWatchPayload) GetMessages() []PayloadMessage {
	return lo.Map(p.LogEvents, func(msg CloudWatchPayloadMessage, _ int) PayloadMessage {
		msg.Payload = p
		return PayloadMessage(&msg)
	})
}

type FireLensPayload struct {
	Log    string
	Source string
}

func (p *FireLensPayload) Parse(msg []byte) bool {
	err := json.Unmarshal(msg, p)
	return err == nil && len(p.Log) > 0
}

func (p *FireLensPayload) GetMessages() []PayloadMessage {
	return []PayloadMessage{p}
}

func (p *FireLensPayload) GetMessage() string {
	return p.Log
}

func (p *FireLensPayload) GetLevel() string {
	if p.Source == "stderr" {
		return model.LogLevelError.String()
	}
	return model.LogLevelInfo.String()
}

func (p *FireLensPayload) GetTimestamp() *time.Time {
	return nil
}

func (p *FireLensPayload) SetLogAttributes(ctx context.Context, hl *hlog.Log, msg []byte) context.Context {
	var lgAttrs map[string]interface{}
	if err := json.Unmarshal(msg, &lgAttrs); err != nil {
		log.WithContext(ctx).
			WithError(err).WithField("msg", msg).
			Error("invalid firelens log attributes")
	}
	for k, v := range lgAttrs {
		// skip the keys that are part of the message
		if has := map[string]bool{"log": true, "source": true}[k]; has {
			continue
		}
		for key, value := range hlog.FormatLogAttributes(k, v) {
			hl.Attributes[key] = value
		}
	}
	hl.Attributes[string(semconv.ServiceNameKey)] = hl.Attributes["container_name"]
	return ctx
}

type FireLensFluentBitPayload struct {
	Message   string
	Level     string
	Source    string
	Timestamp string `json:"@timestamp"`
}

func (p *FireLensFluentBitPayload) Parse(msg []byte) bool {
	err := json.Unmarshal(msg, p)
	return err == nil && len(p.Message) > 0
}

func (p *FireLensFluentBitPayload) GetMessages() []PayloadMessage {
	return []PayloadMessage{p}
}

func (p *FireLensFluentBitPayload) GetMessage() string {
	return p.Message
}

func (p *FireLensFluentBitPayload) GetLevel() string {
	return strings.ToLower(p.Level)
}

func (p *FireLensFluentBitPayload) GetTimestamp() *time.Time {
	t, err := time.Parse("2006-01-02T15:04:05-0700", p.Timestamp)
	if err != nil {
		return &t
	}
	return nil
}

func (p *FireLensFluentBitPayload) SetLogAttributes(ctx context.Context, hl *hlog.Log, msg []byte) context.Context {
	var lgAttrs map[string]interface{}
	if err := json.Unmarshal(msg, &lgAttrs); err != nil {
		log.WithContext(ctx).
			WithError(err).WithField("msg", msg).
			Error("invalid firelens fluentbit log attributes")
	}
	for k, v := range lgAttrs {
		// skip the keys that are part of the message
		if has := map[string]bool{"message": true, "source": true, "level": true, "@timestamp": true}[k]; has {
			continue
		}
		for key, value := range hlog.FormatLogAttributes(k, v) {
			hl.Attributes[key] = value
		}
	}
	hl.Attributes[string(semconv.ServiceNameKey)] = hl.Attributes["container_name"]
	hl.Attributes["source"] = p.Source
	return ctx
}

type FireLensPinoPayload struct {
	Message string `json:"msg"`
	Level   uint8  `json:"level"`
	Service string `json:"name"`
	Time    int64  `json:"time"`
}

func (p *FireLensPinoPayload) Parse(msg []byte) bool {
	err := json.Unmarshal(msg, p)
	return err == nil && len(p.Message) > 0
}

func (p *FireLensPinoPayload) GetMessages() []PayloadMessage {
	return []PayloadMessage{p}
}

func (p *FireLensPinoPayload) GetMessage() string {
	return p.Message
}

func (p *FireLensPinoPayload) GetLevel() string {
	return parsePinoLevel(p.Level)
}

func (p *FireLensPinoPayload) GetTimestamp() *time.Time {
	return ptr.Time(time.UnixMilli(p.Time))
}

func (p *FireLensPinoPayload) SetLogAttributes(ctx context.Context, hl *hlog.Log, msg []byte) context.Context {
	var lgAttrs map[string]interface{}
	if err := json.Unmarshal(msg, &lgAttrs); err != nil {
		log.WithContext(ctx).
			WithError(err).WithField("msg", msg).
			Error("invalid firelens fluentbit log attributes")
	}
	for k, v := range lgAttrs {
		// skip the keys that are part of the message
		if has := map[string]bool{"level": true, "time": true, "msg": true}[k]; has {
			continue
		}
		for key, value := range hlog.FormatLogAttributes(k, v) {
			hl.Attributes[key] = value
		}
	}
	hl.Attributes[string(semconv.ServiceNameKey)] = hl.Attributes["name"]
	return ctx
}

type JsonPayload struct {
	Message string `json:"msg"`
}

func (p *JsonPayload) Parse(msg []byte) bool {
	p.Message = string(msg)
	return true
}

func (p *JsonPayload) GetMessages() []PayloadMessage {
	return []PayloadMessage{p}
}

func (p *JsonPayload) GetMessage() string {
	return p.Message
}

func (p *JsonPayload) GetLevel() string {
	return model.LogLevelInfo.String()
}

func (p *JsonPayload) GetTimestamp() *time.Time {
	return nil
}

func (p *JsonPayload) SetLogAttributes(ctx context.Context, hl *hlog.Log, msg []byte) context.Context {
	hl.Attributes[string(semconv.ServiceNameKey)] = "firehose.json"
	return ctx
}

type CloudFrontJsonPayload struct {
	Timestamp               string `json:"timestamp"`      // optional
	DistributionId          string `json:"DistributionId"` // optional
	Date                    string `json:"date"`
	Time                    string `json:"time"`
	XEdgeLocation           string `json:"x-edge-location"`
	ScBytes                 string `json:"sc-bytes"`
	CIp                     string `json:"c-ip"`
	CsMethod                string `json:"cs-method"`
	CsHost                  string `json:"cs(Host)"`
	CsUriStem               string `json:"cs-uri-stem"`
	ScStatus                string `json:"sc-status"`
	CsReferer               string `json:"cs(Referer)"`
	CsUserAgent             string `json:"cs(User-Agent)"`
	CsUriQuery              string `json:"cs-uri-query"`
	CsCookie                string `json:"cs(Cookie)"`
	XEdgeResultType         string `json:"x-edge-result-type"`
	XEdgeRequestId          string `json:"x-edge-request-id"`
	XHostHeader             string `json:"x-host-header"`
	CsProtocol              string `json:"cs-protocol"`
	CsBytes                 string `json:"cs-bytes"`
	TimeTaken               string `json:"time-taken"`
	XForwardedFor           string `json:"x-forwarded-for"`
	SslProtocol             string `json:"ssl-protocol"`
	SslCipher               string `json:"ssl-cipher"`
	XEdgeResponseResultType string `json:"x-edge-response-result-type"`
	CsProtocolVersion       string `json:"cs-protocol-version"`
	FleStatus               string `json:"fle-status"`
	FleEncryptedFields      string `json:"fle-encrypted-fields"`
	CPort                   string `json:"c-port"`
	TimeToFirstByte         string `json:"time-to-first-byte"`
	XEdgeDetailedResultType string `json:"x-edge-detailed-result-type"`
	ScContentType           string `json:"sc-content-type"`
	ScContentLen            string `json:"sc-content-len"`
	ScRangeStart            string `json:"sc-range-start"`
	ScRangeEnd              string `json:"sc-range-end"`
	TimestampMs             string `json:"timestamp(ms)"` // optional
	OriginFbl               string `json:"origin-fbl"`    // optional
	OriginLbl               string `json:"origin-lbl"`    // optional
	Asn                     string `json:"asn"`           // optional
}

func (p *CloudFrontJsonPayload) Parse(msg []byte) bool {
	err := json.Unmarshal(msg, p)
	return err == nil && len(p.CsHost) > 0
}

func (p *CloudFrontJsonPayload) GetMessages() []PayloadMessage {
	return []PayloadMessage{p}
}

func (p *CloudFrontJsonPayload) GetMessage() string {
	return fmt.Sprintf("[%s] %s %s%s", p.ScStatus, p.CsHost, p.CsUriStem, p.CsUriQuery)
}

func (p *CloudFrontJsonPayload) GetLevel() string {
	return model.LogLevelInfo.String()
}

func (p *CloudFrontJsonPayload) GetTimestamp() *time.Time {
	if len(p.TimestampMs) > 0 {
		if ts, err := strconv.ParseInt(p.TimestampMs, 10, 64); err != nil {
			t := time.UnixMilli(ts)
			return &t
		}
	}
	if len(p.Timestamp) > 0 {
		if ts, err := strconv.ParseInt(p.Timestamp, 10, 64); err != nil {
			t := time.Unix(ts, 0)
			return &t
		}
	}
	if t, err := time.Parse("2006-01-02 15:04:05", fmt.Sprintf("%s %s", p.Date, p.Time)); err == nil {
		return &t
	}
	return nil
}

func (p *CloudFrontJsonPayload) SetLogAttributes(ctx context.Context, hl *hlog.Log, msg []byte) context.Context {
	hl.Attributes[string(semconv.ServiceNameKey)] = "firehose.cloudfront"
	return ctx
}
