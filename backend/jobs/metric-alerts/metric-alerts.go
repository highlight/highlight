package metric_alerts

import (
	"context"
	"strings"
	"time"

	alertsV2 "github.com/highlight-run/highlight/backend/alerts/v2"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/lambda"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/workerpool"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"

	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"

	"github.com/highlight-run/go-resthooks"
	"github.com/highlight-run/highlight/backend/model"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const maxWorkers = 40
const alertEvalFreq = time.Minute

var defaultAlertFilters = map[modelInputs.ProductType]string{
	modelInputs.ProductTypeErrors: "status=OPEN ",
}

func WatchMetricAlerts(ctx context.Context, DB *gorm.DB, MailClient *sendgrid.Client, rh *resthooks.Resthook, redis *redis.Client, ccClient *clickhouse.Client, lambdaClient *lambda.Client) {
	log.WithContext(ctx).Info("Starting to watch metric alerts")

	alertWorkerpool := workerpool.New(maxWorkers)
	alertWorkerpool.SetPanicHandler(util.Recover)

	processAlertsImpl := func() {
		alerts := getMetricAlerts(ctx, DB)
		log.WithContext(ctx).Infof("processing %d metric alerts", len(alerts))

		for _, alert := range alerts {
			alert := alert
			alertWorkerpool.SubmitRecover(
				func() {
					ctx := context.Background()

					err := processMetricAlert(ctx, DB, MailClient, alert, rh, redis, ccClient, lambdaClient)
					if err != nil {
						log.WithContext(ctx).Error(err)
					}
				})
		}
	}

	processAlertsImpl()
	for range time.NewTicker(alertEvalFreq).C {
		processAlertsImpl()
	}
}

func getMetricAlerts(ctx context.Context, DB *gorm.DB) []*model.Alert {
	var alerts []*model.Alert
	if err := DB.Model(&model.Alert{}).Where("disabled = ?", false).Find(&alerts).Error; err != nil {
		log.WithContext(ctx).Error("Error querying for metric alerts")
	}

	return alerts
}

func processMetricAlert(ctx context.Context, DB *gorm.DB, MailClient *sendgrid.Client, alert *model.Alert, rh *resthooks.Resthook, redis *redis.Client, ccClient *clickhouse.Client, lambdaClient *lambda.Client) error {
	curDate := time.Now().Round(time.Minute).Add(-1 * time.Minute)

	// Filter for data points +/- 2 hours of the current time to match ingest filter
	startDate := curDate.Add(-2 * time.Hour)
	endDate := curDate.Add(2 * time.Hour)

	var cooldown time.Duration
	if alert.ThresholdCooldown != nil {
		cooldown = time.Duration(*alert.ThresholdCooldown) * time.Second
	}

	alertingStates, err := ccClient.GetLastAlertingStates(ctx, alert.ProjectID, alert.ID, startDate, curDate)
	if err != nil {
		return err
	}

	lastAlerts := lo.SliceToMap(alertingStates, func(alertingState modelInputs.AlertStateChange) (string, time.Time) {
		return alertingState.GroupByKey, alertingState.Timestamp
	})

	var config clickhouse.SampleableTableConfig
	switch alert.ProductType {
	case modelInputs.ProductTypeErrors:
		config = clickhouse.ErrorsSampleableTableConfig
	case modelInputs.ProductTypeLogs:
		config = clickhouse.LogsSampleableTableConfig
	case modelInputs.ProductTypeSessions:
		config = clickhouse.SessionsSampleableTableConfig
	case modelInputs.ProductTypeMetrics:
		config = clickhouse.MetricsSampleableTableConfig
	case modelInputs.ProductTypeTraces:
		config = clickhouse.TracesSampleableTableConfig
	default:
		return errors.Errorf("Unknown product type: %s", alert.ProductType)
	}

	query := defaultAlertFilters[alert.ProductType]
	if alert.Query != nil {
		query += *alert.Query
	}

	column := ""
	if alert.FunctionColumn != nil {
		column = *alert.FunctionColumn
	}

	groupBy := []string{}
	if alert.GroupByKey != nil {
		groupBy = append(groupBy, *alert.GroupByKey)
	}

	saveMetricState := alert.ProductType != modelInputs.ProductTypeErrors && alert.ProductType != modelInputs.ProductTypeSessions

	bucketCount := 1
	var savedState *clickhouse.SavedMetricState
	if saveMetricState {
		blockInfo, err := ccClient.GetBlockNumbers(ctx, alert.MetricId, startDate, endDate)
		if err != nil {
			return err
		}

		savedState = &clickhouse.SavedMetricState{
			MetricId:        alert.MetricId,
			BlockNumberInfo: blockInfo,
		}

		// 1 bucket per minute
		bucketCount = int((endDate.Sub(startDate)) / time.Minute)
	}

	aggregatorCount := modelInputs.MetricAggregatorCount

	buckets, err := ccClient.ReadMetrics(ctx, clickhouse.ReadMetricsInput{
		SampleableConfig: config,
		ProjectIDs:       []int{alert.ProjectID},
		Params: modelInputs.QueryInput{
			Query: query,
			DateRange: &modelInputs.DateRangeRequiredInput{
				StartDate: startDate,
				EndDate:   endDate,
			},
		},
		Column:           column,
		MetricTypes:      []modelInputs.MetricAggregator{alert.FunctionType},
		GroupBy:          groupBy,
		BucketCount:      &bucketCount,
		BucketBy:         modelInputs.MetricBucketByTimestamp.String(),
		Limit:            pointy.Int(100),
		LimitAggregator:  &aggregatorCount,
		SavedMetricState: savedState,
	})
	if err != nil {
		return err
	}

	thresholdWindow := 1 * time.Hour
	if alert.ThresholdWindow != nil {
		thresholdWindow = time.Duration(*alert.ThresholdWindow) * time.Second
	}

	belowThreshold := false
	if alert.BelowThreshold != nil {
		belowThreshold = *alert.BelowThreshold
	}

	var thresholdValue float64
	if alert.ThresholdValue != nil {
		thresholdValue = *alert.ThresholdValue
	}

	groupByKey := ""
	if len(groupBy) > 0 {
		groupByKey = groupBy[0]
	}

	stateChanges := []modelInputs.AlertStateChange{}
	if saveMetricState {
		results, err := ccClient.AggregateMetricStates(ctx, alert.MetricId, curDate, thresholdWindow, alert.FunctionType)
		if err != nil {
			return err
		}
		for _, result := range results {
			alertCondition := result.Value >= thresholdValue
			if belowThreshold {
				alertCondition = result.Value <= thresholdValue
			}

			alertStateChange := getAlertStateChange(curDate, alertCondition, alert.ID, result.GroupByKey, lastAlerts, cooldown)

			if alertStateChange.State == modelInputs.AlertStateAlerting {
				alertsV2.SendAlerts(ctx, DB, MailClient, lambdaClient, alert, groupByKey, result.GroupByKey, result.Value)
			}

			stateChanges = append(stateChanges, alertStateChange)
		}
	} else {
		for _, bucket := range buckets.Buckets {
			value := 0.0
			if bucket.MetricValue != nil {
				value = *bucket.MetricValue
			}
			alertCondition := value >= thresholdValue
			if belowThreshold {
				alertCondition = value <= thresholdValue
			}

			alertStateChange := getAlertStateChange(curDate, alertCondition, alert.ID, strings.Join(bucket.Group, "."), lastAlerts, cooldown)

			if alertStateChange.State == modelInputs.AlertStateAlerting {
				alertsV2.SendAlerts(ctx, DB, MailClient, lambdaClient, alert, groupByKey, bucket.Group[0], value)
			}

			stateChanges = append(stateChanges, alertStateChange)
		}
	}

	if err := ccClient.WriteAlertStateChanges(ctx, alert.ProjectID, stateChanges); err != nil {
		return err
	}

	return nil
}

func getAlertStateChange(curDate time.Time, alerting bool, alertId int, groupByKey string, lastAlerts map[string]time.Time, cooldown time.Duration) modelInputs.AlertStateChange {
	state := modelInputs.AlertStateNormal
	if alerting {
		cooldownDate := lastAlerts[groupByKey].Add(cooldown)
		if curDate.After(cooldownDate) {
			state = modelInputs.AlertStateAlerting
		} else {
			state = modelInputs.AlertStateAlertingSilently
		}
	}

	return modelInputs.AlertStateChange{
		Timestamp:  curDate,
		AlertID:    alertId,
		State:      state,
		GroupByKey: groupByKey,
	}
}
