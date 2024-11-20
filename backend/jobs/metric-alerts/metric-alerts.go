package metric_alerts

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/alerts/predictions"
	alertsV2 "github.com/highlight-run/highlight/backend/alerts/v2"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/lambda"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/workerpool"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"

	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"

	"github.com/highlight-run/highlight/backend/model"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const maxWorkers = 40
const anomalyBucketCount = 100
const alertEvalFreq = time.Minute

var defaultAlertFilters = map[modelInputs.ProductType]string{
	modelInputs.ProductTypeErrors: "status=OPEN ",
}

func WatchMetricAlerts(ctx context.Context, DB *gorm.DB, MailClient *sendgrid.Client, ccClient *clickhouse.Client, lambdaClient *lambda.Client) {
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

					err := processMetricAlert(ctx, DB, MailClient, alert, ccClient, lambdaClient)
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

const timeFormatSecondsNoTz = "2006-01-02T15:04:05"

func processMetricAlert(ctx context.Context, DB *gorm.DB, MailClient *sendgrid.Client, alert *model.Alert, ccClient *clickhouse.Client, lambdaClient *lambda.Client) error {
	span, ctx := util.StartSpanFromContext(ctx, "WatchMetricAlerts.processMetricAlert")
	span.SetAttribute("alert_id", alert.ID)
	span.SetAttribute("project_id", alert.ProjectID)
	span.SetAttribute("product_type", alert.ProductType)
	defer span.Finish()

	log.WithContext(ctx).WithFields(
		log.Fields{
			"alertID":          alert.ID,
			"alertProductType": alert.ProductType,
		}).Info("processing metric alert")

	curDate := time.Now().Round(time.Minute).Add(-1 * time.Minute)

	thresholdWindow := 1 * time.Hour
	if alert.ThresholdWindow != nil {
		thresholdWindow = time.Duration(*alert.ThresholdWindow) * time.Second
	}

	saveMetricState := alert.ProductType != modelInputs.ProductTypeErrors && alert.ProductType != modelInputs.ProductTypeSessions && alert.ProductType != modelInputs.ProductTypeEvents

	endDate := curDate
	startDate := curDate.Add(-1 * thresholdWindow)

	// Filter for data points +/- 2 hours of the current time to match ingest filter
	if saveMetricState {
		if thresholdWindow < 2*time.Hour {
			startDate = curDate.Add(-2 * time.Hour)
		}
		endDate = curDate.Add(2 * time.Hour)
	}

	bucketCount := 1
	if alert.ThresholdType == modelInputs.ThresholdTypeAnomaly {
		startDate = curDate.Add(-anomalyBucketCount * thresholdWindow)
		bucketCount = anomalyBucketCount
	}

	var cooldown time.Duration
	if alert.ThresholdCooldown != nil {
		cooldown = time.Duration(*alert.ThresholdCooldown) * time.Second
	}

	alertingStates, err := ccClient.GetLastAlertingStates(ctx, alert.ProjectID, alert.ID, curDate.Add(-1*cooldown), curDate)
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
	case modelInputs.ProductTypeEvents:
		config = clickhouse.EventsSampleableTableConfig
	default:
		return errors.Errorf("Unknown product type: %s", alert.ProductType)
	}

	query := defaultAlertFilters[alert.ProductType]
	if alert.Query != nil {
		query += *alert.Query
	}

	// For session alerts, reevaluate all sessions from the past 4 hours filtering by updated_at
	// This is necessary as sessions can be updated and might meet alert criteria much later
	// than when they are initialized, e.g. for alerts filtering on active_length.
	if alert.ThresholdType == modelInputs.ThresholdTypeConstant && alert.ProductType == modelInputs.ProductTypeSessions {
		query += fmt.Sprintf(` AND updated_at>="%s"`, startDate.Format(timeFormatSecondsNoTz))
		startDate = endDate.Add(-4 * time.Hour)
	}

	column := ""
	if alert.FunctionColumn != nil {
		column = *alert.FunctionColumn
	}

	groupBy := []string{}
	if alert.GroupByKey != nil {
		groupBy = append(groupBy, *alert.GroupByKey)
	}

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
		Limit:            pointy.Int(20),
		LimitAggregator:  &aggregatorCount,
		SavedMetricState: savedState,
		NoBucketMax:      true,
	})
	if err != nil {
		return err
	}

	var thresholdValue float64
	if alert.ThresholdValue != nil {
		thresholdValue = *alert.ThresholdValue
	}

	groupByKey := ""
	if len(groupBy) > 0 {
		groupByKey = groupBy[0]
	}

	var bucketsInner []*modelInputs.MetricBucket

	stateChanges := []modelInputs.AlertStateChange{}
	if saveMetricState {
		var windowSeconds *int
		if alert.ThresholdType == modelInputs.ThresholdTypeAnomaly {
			windowSeconds = alert.ThresholdWindow
		}

		startDate := curDate.Add(-1 * thresholdWindow)
		if alert.ThresholdType == modelInputs.ThresholdTypeAnomaly {
			startDate = curDate.Add(-anomalyBucketCount * thresholdWindow)
		}

		bucketsInner, err = ccClient.AggregateMetricStates(ctx, alert.MetricId, startDate, curDate, thresholdWindow, alert.FunctionType, windowSeconds)
		if err != nil {
			return err
		}

		if alert.ThresholdType == modelInputs.ThresholdTypeAnomaly && alert.ThresholdWindow != nil {
			if err := predictions.AddPredictions(ctx, bucketsInner, modelInputs.PredictionSettings{
				ChangepointPriorScale: .25,
				IntervalWidth:         thresholdValue,
				ThresholdCondition:    alert.ThresholdCondition,
				IntervalSeconds:       *alert.ThresholdWindow,
			}); err != nil {
				return err
			}

			maxId := lo.Max(lo.Map(bucketsInner, func(bucket *modelInputs.MetricBucket, _ int) uint64 { return bucket.BucketID }))

			// Only interested in the last bucket
			newBuckets := []*modelInputs.MetricBucket{}
			for _, bucket := range bucketsInner {
				if bucket.BucketID == maxId {
					newBuckets = append(newBuckets, bucket)
				}
			}
			bucketsInner = newBuckets
		}
	} else if buckets != nil {
		bucketsInner = buckets.Buckets
	}

	if len(bucketsInner) == 0 {
		// write a normal state with no group by key to avoid missing data
		alertStateChange := getAlertStateChange(curDate, false, alert.ID, "", lastAlerts, cooldown)
		stateChanges = append(stateChanges, alertStateChange)
	}

	for _, bucket := range bucketsInner {
		if bucket.MetricValue == nil {
			continue
		}

		alertCondition := false
		if alert.ThresholdType == modelInputs.ThresholdTypeAnomaly {
			if alert.ThresholdCondition == modelInputs.ThresholdConditionAbove && bucket.YhatUpper != nil {
				alertCondition = *bucket.MetricValue >= *bucket.YhatUpper
			} else if alert.ThresholdCondition == modelInputs.ThresholdConditionBelow && bucket.YhatLower != nil {
				alertCondition = *bucket.MetricValue <= *bucket.YhatLower
			} else if alert.ThresholdCondition == modelInputs.ThresholdConditionOutside && bucket.YhatUpper != nil && bucket.YhatLower != nil {
				alertCondition = *bucket.MetricValue >= *bucket.YhatUpper || *bucket.MetricValue <= *bucket.YhatLower
			}
		} else {
			if alert.ThresholdCondition == modelInputs.ThresholdConditionBelow {
				alertCondition = *bucket.MetricValue <= thresholdValue
			} else {
				alertCondition = *bucket.MetricValue >= thresholdValue
			}
		}

		alertStateChange := getAlertStateChange(curDate, alertCondition, alert.ID, strings.Join(bucket.Group, ""), lastAlerts, cooldown)

		if alertStateChange.State == modelInputs.AlertStateAlerting {
			log.WithContext(ctx).WithFields(
				log.Fields{
					"alertID":          alert.ID,
					"alertProductType": alert.ProductType,
				}).Info("alerting metric alert")

			err := alertsV2.SendAlerts(ctx, DB, MailClient, lambdaClient, alert, groupByKey, strings.Join(bucket.Group, ""), *bucket.MetricValue)
			if err != nil {
				log.WithContext(ctx).WithFields(
					log.Fields{
						"alertID":          alert.ID,
						"alertProductType": alert.ProductType,
					}).Error(err)
			}
		}

		stateChanges = append(stateChanges, alertStateChange)
	}

	if err := ccClient.WriteAlertStateChanges(ctx, alert.ProjectID, stateChanges); err != nil {
		return err
	}

	log.WithContext(ctx).WithFields(
		log.Fields{
			"alertID":          alert.ID,
			"alertProductType": alert.ProductType,
		}).Info("processed metric alert")

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
