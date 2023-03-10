package retryables

import (
	"context"
	"github.com/highlight-run/highlight/backend/model"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type Client interface {
	ReportError(ctx context.Context, t model.RetryableType, payloadType, payloadID string, payload map[string]interface{}, e error)
}

type RetryableClient struct {
	DB *gorm.DB
}

func (c *RetryableClient) ReportError(ctx context.Context, t model.RetryableType, payloadType, payloadID string, payload map[string]interface{}, e error) {
	log.WithContext(ctx).
		WithField("Type", t).
		WithField("PayloadType", payloadType).
		WithField("PayloadID", payloadID).
		WithField("Payload", payload).
		WithError(e).
		Errorf("RetryableError %s [%s::%s] - %+v, %+v", t, payloadType, payloadID, payload, e)
	r := &model.Retryable{
		Type:        t,
		PayloadType: payloadType,
		PayloadID:   payloadID,
		Payload:     payload,
	}
	if e != nil {
		r.Error = e.Error()
	}
	if err := c.DB.Create(r).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("error writing retryable error")
	}
}

type DummyClient struct {
	DB *gorm.DB
}

func (c *DummyClient) ReportError(ctx context.Context, t model.RetryableType, payloadType, payloadID string, payload map[string]interface{}, e error) {
	log.WithContext(ctx).
		WithField("Type", t).
		WithField("PayloadType", payloadType).
		WithField("PayloadID", payloadID).
		WithField("Payload", payload).
		WithError(e).
		Errorf("RetryableError %s [%s::%s] - %+v, %+v", t, payloadType, payloadID, payload, e)
}
