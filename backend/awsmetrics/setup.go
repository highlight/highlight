package awsmetrics

import (
	"context"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/metric"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
)

// Setup initializes and starts the AWS metrics collection
func Setup(ctx context.Context, db *gorm.DB, otlpEndpoint string, tracer trace.Tracer) (*Poller, error) {
	log.WithContext(ctx).WithField("endpoint", otlpEndpoint).Info("Setting up AWS metrics collection")
	ctx, span := tracer.Start(ctx, "awsmetrics.Setup")
	defer span.End()

	// Create resource for AWS metrics
	awsRes, err := resource.New(ctx,
		resource.WithAttributes(
			semconv.ServiceName("aws-metrics-collector"),
			semconv.ServiceVersion("1.0.0"),
		),
	)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	// Strip any trailing slashes
	otlpEndpoint = strings.TrimSuffix(otlpEndpoint, "/")

	// Create OTeL exporter for AWS metrics
	awsMetricsExp, err := otlpmetrichttp.New(ctx,
		otlpmetrichttp.WithEndpoint(strings.TrimPrefix(strings.TrimPrefix(otlpEndpoint, "http://"), "https://")),
		otlpmetrichttp.WithInsecure(),
		otlpmetrichttp.WithCompression(otlpmetrichttp.GzipCompression),
		otlpmetrichttp.WithURLPath("/v1/metrics"),
	)
	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	reader := sdkmetric.NewPeriodicReader(
		awsMetricsExp,
		sdkmetric.WithInterval(30*time.Second),
	)

	// Create meter provider for AWS metrics
	awsMeterProvider := sdkmetric.NewMeterProvider(
		sdkmetric.WithResource(awsRes),
		sdkmetric.WithReader(reader),
	)

	// Create collector using the meter interface
	var awsMeter metric.Meter = awsMeterProvider.Meter("aws-metrics")
	collector := NewCollector(awsMeter, db, tracer)
	poller := NewPoller(collector)

	// Start polling in a goroutine
	go func() {
		if err := poller.Start(ctx); err != nil {
			log.WithContext(ctx).WithError(err).Error("AWS metrics collector failed")
		} else {
			log.WithContext(ctx).Info("AWS metrics collector started")
		}
	}()

	return poller, nil
}
