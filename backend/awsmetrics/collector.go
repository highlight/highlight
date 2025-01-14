package awsmetrics

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatch"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatch/types"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight/highlight/sdk/highlight-go"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
)

var ec2Metrics = []types.Metric{
	{
		MetricName: aws.String("CPUUtilization"),
		Namespace:  aws.String("AWS/EC2"),
	},
	{
		MetricName: aws.String("DiskReadOps"),
		Namespace:  aws.String("AWS/EC2"),
	},
	{
		MetricName: aws.String("DiskWriteOps"),
		Namespace:  aws.String("AWS/EC2"),
	},
	{
		MetricName: aws.String("DiskReadBytes"),
		Namespace:  aws.String("AWS/EC2"),
	},
	{
		MetricName: aws.String("DiskWriteBytes"),
		Namespace:  aws.String("AWS/EC2"),
	},
	{
		MetricName: aws.String("NetworkIn"),
		Namespace:  aws.String("AWS/EC2"),
	},
	{
		MetricName: aws.String("NetworkOut"),
		Namespace:  aws.String("AWS/EC2"),
	},
}

type Collector struct {
	db     *gorm.DB
	meter  metric.Meter
	tracer trace.Tracer
	gauges map[string]metric.Float64ObservableGauge
	mu     sync.RWMutex
	values map[string]float64
}

func NewCollector(meter metric.Meter, db *gorm.DB, tracer trace.Tracer) *Collector {
	return &Collector{
		meter:  meter,
		db:     db,
		tracer: tracer,
		gauges: make(map[string]metric.Float64ObservableGauge),
		values: make(map[string]float64),
	}
}

func (c *Collector) getOrCreateGauge(metricName string) (metric.Float64ObservableGauge, error) {
	c.mu.RLock()
	if gauge, ok := c.gauges[metricName]; ok {
		c.mu.RUnlock()
		return gauge, nil
	}
	c.mu.RUnlock()

	c.mu.Lock()
	defer c.mu.Unlock()

	// Double check in case another goroutine created it while we were waiting for the lock
	if gauge, ok := c.gauges[metricName]; ok {
		return gauge, nil
	}

	// Create a callback function that will be called when the metric needs to be observed
	callback := func(ctx context.Context, o metric.Float64Observer) error {
		c.mu.RLock()
		defer c.mu.RUnlock()

		metricsCount := 0

		for key, value := range c.values {
			if strings.HasPrefix(key, metricName+":") {
				// Extract attributes from the key
				parts := strings.Split(key, ":")
				if len(parts) != 3 {
					continue
				}
				accountID := parts[1]
				instanceID := parts[2]

				// Temporary way of storing metrics so we can build a chart with them.
				// For some reason calling highlight.RecordMetric wasn't working.
				span, _ := highlight.StartTraceWithTimestamp(
					ctx,
					highlight.MetricSpanName,
					time.Now(),
					[]trace.SpanStartOption{trace.WithSpanKind(trace.SpanKindClient)},
					attribute.String("highlight.project_id", accountID),
					attribute.String("metric_name", metricName),
					attribute.Float64("metric_value", value),
					attribute.String("account_id", accountID),
					attribute.String("instance_id", instanceID),
				)
				span.AddEvent(highlight.MetricEvent, trace.WithAttributes(
					attribute.String(highlight.MetricEventName, metricName),
					attribute.Float64(highlight.MetricEventValue, value),
				))
				span.End()

				o.Observe(value,
					metric.WithAttributes(
						attribute.String("account_id", accountID),
						attribute.String("instance_id", instanceID),
						attribute.String("metric_name", metricName),
						attribute.String("namespace", "AWS/EC2"),
					),
				)
				metricsCount++
			}
		}

		return nil
	}

	gauge, err := c.meter.Float64ObservableGauge(
		fmt.Sprintf("aws.ec2.%s", metricName),
		metric.WithDescription(fmt.Sprintf("AWS EC2 metric %s", metricName)),
		metric.WithUnit("1"),
		metric.WithFloat64Callback(callback),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create gauge: %w", err)
	}

	c.gauges[metricName] = gauge
	return gauge, nil
}

func (c *Collector) CollectEC2Metrics(ctx context.Context) error {
	log.WithContext(ctx).WithField("function", "CollectEC2Metrics").Info("Starting EC2 metrics collection")
	ctx, span := c.tracer.Start(ctx, "CollectEC2Metrics")
	defer span.End()

	var allCreds []model.AwsCredentials
	if err := c.db.Find(&allCreds).Error; err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to get AWS credentials")
		return fmt.Errorf("failed to get AWS credentials from database: %w", err)
	}

	span.SetAttributes(attribute.Int("aws_accounts", len(allCreds)))
	if len(allCreds) == 0 {
		return nil
	}

	for _, creds := range allCreds {
		credCtx, credSpan := c.tracer.Start(ctx, "CollectAccountMetrics",
			trace.WithAttributes(
				attribute.Int("project_id", creds.ProjectID),
				attribute.String("region", creds.Region),
			),
		)

		// Get instances that need metric collection
		var instances []model.AwsEc2Instance
		if err := c.db.Where(
			"metrics_enabled = ? AND project_id = ? AND (last_metrics_collected_at IS NULL OR last_metrics_collected_at < ?)",
			true,
			creds.ProjectID,
			time.Now().Add(-5*time.Minute),
		).Find(&instances).Error; err != nil {
			credSpan.RecordError(err)
			log.WithContext(ctx).WithError(err).WithField("project_id", creds.ProjectID).
				Error("Failed to get EC2 instances needing metric collection")
			credSpan.End()
			continue
		}

		credSpan.SetAttributes(attribute.Int("instances_count", len(instances)))
		if len(instances) == 0 {
			credSpan.End()
			continue
		}

		cfg, err := config.LoadDefaultConfig(credCtx,
			config.WithRegion(creds.Region),
			config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
				creds.AccessKeyID,
				creds.SecretAccessKey,
				"", // session token
			)),
		)
		if err != nil {
			credSpan.RecordError(err)
			log.WithContext(ctx).WithError(err).WithField("aws_account", creds.AccessKeyID).
				Error("Failed to load AWS config for account")
			credSpan.End()
			continue
		}

		cwClient := cloudwatch.NewFromConfig(cfg)

		// For each instance that needs collection
		for _, instance := range instances {
			instanceCtx, instanceSpan := c.tracer.Start(credCtx, "CollectInstanceMetrics",
				trace.WithAttributes(
					attribute.String("instance_id", instance.InstanceID),
					attribute.String("instance_name", instance.Name),
				),
			)

			// Calculate collection time range
			endTime := time.Now()
			var startTime time.Time

			if instance.LastMetricsCollectedAt == nil {
				startTime = endTime.Add(-24 * time.Hour)
				instanceSpan.SetAttributes(attribute.Bool("backfill", true))
			} else {
				startTime = *instance.LastMetricsCollectedAt
			}

			instanceSpan.SetAttributes(
				attribute.String("start_time", startTime.Format(time.RFC3339)),
				attribute.String("end_time", endTime.Format(time.RFC3339)),
			)

			// TODO: Should we allow users to select which metrics to collect, polling
			// interval, etc?
			// TODO: Remove static set of metrics and collect everything. Capture all
			// attributes about the instances on the metrics.
			// Build metric queries for all metrics
			var metricDataQueries []types.MetricDataQuery
			for i, metric := range ec2Metrics {
				queryId := fmt.Sprintf("m%d", i)
				metricDataQueries = append(metricDataQueries, types.MetricDataQuery{
					Id: aws.String(queryId),
					MetricStat: &types.MetricStat{
						Metric: &types.Metric{
							MetricName: metric.MetricName,
							Namespace:  metric.Namespace,
							Dimensions: []types.Dimension{
								{
									Name:  aws.String("InstanceId"),
									Value: aws.String(instance.InstanceID),
								},
							},
						},
						Period: aws.Int32(300),
						Stat:   aws.String("Average"),
					},
				})
			}

			// CloudWatch GetMetricData has a limit of 500 metrics per request
			const maxMetricsPerRequest = 500
			var lastTimestamp time.Time
			var metricsCollected int

			// Split queries into chunks of maxMetricsPerRequest
			for i := 0; i < len(metricDataQueries); i += maxMetricsPerRequest {
				end := i + maxMetricsPerRequest
				if end > len(metricDataQueries) {
					end = len(metricDataQueries)
				}

				queryCtx, querySpan := c.tracer.Start(instanceCtx, "GetMetricData",
					trace.WithAttributes(
						attribute.Int("batch_size", end-i),
						attribute.Int("batch_start", i),
						attribute.Int("batch_end", end),
					),
				)

				input := &cloudwatch.GetMetricDataInput{
					StartTime:         aws.Time(startTime),
					EndTime:           aws.Time(endTime),
					MetricDataQueries: metricDataQueries[i:end],
				}

				// Get the data
				paginator := cloudwatch.NewGetMetricDataPaginator(cwClient, input)
				for paginator.HasMorePages() {
					output, err := paginator.NextPage(queryCtx)
					if err != nil {
						querySpan.RecordError(err)
						log.WithContext(ctx).WithError(err).
							WithField("project_id", instance.ProjectID).
							WithField("instance_id", instance.InstanceID).
							Error("Failed to get metric data")
						break
					}

					// Process each result
					for _, result := range output.MetricDataResults {
						if len(result.Values) == 0 {
							continue
						}

						// Get metric name from the query ID
						metricIdx, err := strconv.Atoi(strings.TrimPrefix(*result.Id, "m"))
						if err != nil || metricIdx >= len(ec2Metrics) {
							continue
						}
						metricName := *ec2Metrics[metricIdx].MetricName

						// Process all values and timestamps
						for i := range result.Values {
							value := result.Values[i]
							timestamp := result.Timestamps[i]
							if timestamp.After(lastTimestamp) {
								lastTimestamp = timestamp
							}

							c.mu.Lock()
							c.values[fmt.Sprintf("%s:%d:%s", metricName, instance.ProjectID, instance.InstanceID)] = value
							c.mu.Unlock()

							metricsCollected++

							// Create/update gauge for this metric
							_, err = c.getOrCreateGauge(metricName)
							if err != nil {
								querySpan.RecordError(err)
								log.WithContext(ctx).WithError(err).
									WithField("project_id", instance.ProjectID).
									WithField("metric_name", metricName).
									Error("Failed to create gauge")
							}
						}
					}
				}
				querySpan.SetAttributes(attribute.Int("metrics_collected", metricsCollected))
				querySpan.End()
			}

			// Update LastMetricsCollectedAt if we got any data
			if !lastTimestamp.IsZero() {
				if err := c.db.Model(&instance).Update("last_metrics_collected_at", lastTimestamp).Error; err != nil {
					instanceSpan.RecordError(err)
					log.WithContext(ctx).WithError(err).
						WithField("project_id", instance.ProjectID).
						WithField("instance_id", instance.InstanceID).
						Error("Failed to update last metrics collection time")
				}
			}

			instanceSpan.SetAttributes(
				attribute.Int("total_metrics_collected", metricsCollected),
				attribute.String("last_timestamp", lastTimestamp.Format(time.RFC3339)),
			)
			instanceSpan.End()
		}

		// After collecting metrics for each instance, ensure they're registered with the meter
		log.WithContext(ctx).WithField("gauge_count", len(c.gauges)).Info("Registering metrics with meter")
		for metricName := range c.gauges {
			if _, err := c.getOrCreateGauge(metricName); err != nil {
				log.WithContext(ctx).WithError(err).
					WithField("metric_name", metricName).
					Error("Failed to register metric with meter")
			}
			log.WithContext(ctx).WithField("metric_name", metricName).Info("Registered metric with meter")
		}

		// Log current values
		c.mu.RLock()
		log.WithContext(ctx).WithField("values", c.values).Debug("Current metric values")
		c.mu.RUnlock()

		credSpan.End()
	}

	return nil
}

func DescribeInstances(ctx context.Context, client *ec2.Client) (*ec2.DescribeInstancesOutput, error) {
	return client.DescribeInstances(ctx, &ec2.DescribeInstancesInput{})
}
