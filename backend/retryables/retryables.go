package retryables

import (
	"context"
	"github.com/highlight-run/highlight/backend/model"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type Client interface {
	ReportError(ctx context.Context, t model.RetryableType, path, function string, payload map[string]interface{}, e error)
}

type RetryableClient struct {
	DB *gorm.DB
}

func (c *RetryableClient) ReportError(ctx context.Context, t model.RetryableType, path, function string, payload map[string]interface{}, e error) {
	log.WithContext(ctx).
		WithField("Type", t).
		WithField("Path", path).
		WithField("Function", function).
		WithField("Payload", payload).
		WithError(e).
		Errorf("RetryableError %s [%s::%s] - %+v, %+v", t, path, function, payload, e)
	r := model.Retryable{
		Type:     t,
		Path:     path,
		Function: function,
		Payload:  payload,
		Error:    e.Error(),
	}
	if err := c.DB.Create(r).Error; err != nil {
		log.WithContext(ctx).WithError(err).Error("error writing retryable error")
	}
}

type DummyClient struct {
	DB *gorm.DB
}

func (c *DummyClient) ReportError(ctx context.Context, t model.RetryableType, path, function string, payload map[string]interface{}, e error) {
	log.WithContext(ctx).
		WithField("Type", t).
		WithField("Path", path).
		WithField("Function", function).
		WithField("Payload", payload).
		WithError(e).
		Errorf("RetryableError %s [%s::%s] - %+v, %+v", t, path, function, payload, e)
}
