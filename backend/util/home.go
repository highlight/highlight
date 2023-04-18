package util

import (
	"context"
	"github.com/highlight/highlight/sdk/highlight-go"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/attribute"
	"runtime"
	"time"
)

func IsOptedOut(ctx context.Context) bool {
	cfg, err := GetConfig()
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get opt out status")
		return true
	}
	return cfg.PhoneHomeOptOut
}

func PhoneHome(ctx context.Context) error {
	if IsOptedOut(ctx) {
		return nil
	}

	cfg, err := GetConfig()
	if err != nil {
		return err
	}
	if cfg.PhoneHomeDeploymentID == "" {
		cfg.PhoneHomeDeploymentID = GenerateRandomString(32)
	}
	if err = SaveConfig(cfg); err != nil {
		return err
	}

	if !highlight.IsRunning() {
		log.WithContext(ctx).Warn("phone home expected highlight sdk to be running")
	}

	go func() {
		ctx := context.Background()
		for range time.Tick(time.Second) {
			highlight.RecordMetric(ctx, "num-cpu", float64(runtime.NumCPU()))
			s, _ := highlight.StartTrace(
				ctx, "phone-home-interval",
				attribute.String(highlight.ProjectIDAttribute, "1"),
				attribute.String("deployment", cfg.PhoneHomeDeploymentID),
			)
			highlight.EndTrace(s)
		}
	}()
	return nil
}
