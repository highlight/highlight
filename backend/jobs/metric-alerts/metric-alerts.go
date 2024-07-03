package metric_alerts

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/highlight-run/highlight/backend/alerts"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/lambda"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	tempalerts "github.com/highlight-run/highlight/backend/temp-alerts"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/workerpool"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"

	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"

	"github.com/highlight-run/go-resthooks"
	Email "github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/zapier"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const maxWorkers = 40
const alertEvalFreq = time.Minute
const ingestDelay = time.Minute
const maxLookback = time.Hour

func WatchMetricAlerts(ctx context.Context, DB *gorm.DB, MailClient *sendgrid.Client, rh *resthooks.Resthook, redis *redis.Client, ccClient *clickhouse.Client, lambdaClient *lambda.Client) {
	log.WithContext(ctx).Info("Starting to watch metric alerts")

	alertWorkerpool := workerpool.New(maxWorkers)
	alertWorkerpool.SetPanicHandler(util.Recover)

	for range time.NewTicker(alertEvalFreq).C {
		alerts := getMetricAlerts(ctx, DB)
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
			// If at least one tick has passed since the last loop,
			// evaluate the alerts for this bucket
			if (curTime / freq) > (startTime / freq) {
				for _, alert := range alerts {
					// copy `alert` by value so each call to processLogAlert references a different alert

				}
			}
		}
		startTime = curTime
	}
}

func getMetricAlerts(ctx context.Context, DB *gorm.DB) []*model.Alert {
	var alerts []*model.Alert
	if err := DB.Model(&model.Alert{}).Where("disabled = ?", false).Find(&alerts).Error; err != nil {
		log.WithContext(ctx).Error("Error querying for metric alerts")
	}

	return alerts
}

func pointerizer[V any](v V) *V {
	return &v
}

func processMetricAlert(ctx context.Context, DB *gorm.DB, MailClient *sendgrid.Client, alert *model.Alert, rh *resthooks.Resthook, redis *redis.Client, ccClient *clickhouse.Client, lambdaClient *lambda.Client) error {
	// CurDate is rounded to the nearest minute
	curDate := time.Now().Round(time.Minute)

	// Filter for data points +/- 2 hours of the current time to match ingest filter
	startDate := curDate.Add(-clickhouse.AlertHistoryMaxLookback)
	endDate := curDate.Add(clickhouse.AlertHistoryMaxLookback)

	// 1 bucket per minute
	bucketCount := int((endDate.Sub(startDate)) / time.Minute)

	blockInfo, err := ccClient.GetBlockNumbers(ctx, alert.ID, endDate)
	if err != nil {
		return err
	}

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

	query := ""
	if alert.Query != nil {
		query = *alert.Query
	}

	column := ""
	if alert.FunctionColumn != nil {
		column = *alert.FunctionColumn
	}

	groupBy := []string{}
	if alert.GroupByKey != nil {
		groupBy = append(groupBy, *alert.GroupByKey)
	}

	aggregatorCount := modelInputs.MetricAggregatorCount

	if _, err := ccClient.ReadMetrics(ctx, clickhouse.ReadMetricsInput{
		SampleableConfig: config,
		ProjectIDs:       []int{alert.ProjectID},
		Params: modelInputs.QueryInput{
			Query: query,
			DateRange: &modelInputs.DateRangeRequiredInput{
				StartDate: startDate,
				EndDate:   endDate,
			},
		},
		Column:          column,
		MetricTypes:     []modelInputs.MetricAggregator{alert.FunctionType},
		GroupBy:         groupBy,
		BucketCount:     &bucketCount,
		BucketBy:        modelInputs.MetricBucketByTimestamp.String(),
		Limit:           pointy.Int(100),
		LimitAggregator: &aggregatorCount,
		SavedMetricState: clickhouse.SavedMetricState{
			AlertId:         alert.ID,
			BlockNumberInfo: blockInfo,
		},
	}); err != nil {
		return err
	}

	ccClient.AggregateAlertStates(ctx, alert.ID)

	alertingByGroup := lo.KeyBy(lo.Filter(alertStateChanges, func(stateChange modelInputs.AlertStateChange)), func(stateChange modelInputs.AlertStateChange) *string {
		return stateChange.GroupByKey
	})

	lastStateChange := time.Now()
	for _, stateChange := range alertStateChanges {
		if stateChange.Timestamp.After(lastStateChange) {
			lastStateChange = stateChange.Timestamp
		}
	}

	// Load all data in 1 minute intervals between the last state change and the current minute
	thresholdWindow := 1 * time.Minute
	if alert.ThresholdWindow != nil {
		thresholdWindow = time.Duration(*alert.ThresholdWindow) * time.Minute
	}

	end := time.Now().Add(-ingestDelay)
	start := end.Add(-thresholdWindow * time.Second)

	query := ""
	if alert.Query != nil {
		query = *alert.Query
	}

	dateRange := &modelInputs.DateRangeRequiredInput{
		StartDate: startDate,
		EndDate:   endDate,
	}

	groupBy := []string{}
	if alert.GroupByKey != nil {
		groupBy = []string{*alert.GroupByKey}
	}

	metricAggregatorCount := modelInputs.MetricAggregatorCount

	readMetricsFn := ccClient.ReadSessionsMetrics

	var threshold float64
	if alert.ThresholdCount != nil {
		threshold = float64(*alert.ThresholdCount)
	}

	for _, bucket := range buckets.Buckets {
		if bucket.MetricValue != nil && *bucket.MetricValue >= threshold {

		}
	}

	count := int(count64)

	alertCondition := count >= alert.CountThreshold
	if alert.BelowThreshold {
		alertCondition = count <= alert.CountThreshold
	}

	log.WithContext(ctx).WithFields(log.Fields{
		"id":              alert.ID,
		"query":           alert.Query,
		"frequency":       alert.Frequency,
		"start":           start.Format(time.RFC3339),
		"end":             end.Format(time.RFC3339),
		"count":           count,
		"threshold":       alert.CountThreshold,
		"thresholdWindow": thresholdWindow,
		"alerting":        alertCondition,
	}).Info("evaluated log alert")

	if alertCondition {
		var project model.Project
		if err := DB.Model(&model.Project{}).Where("id = ?", alert.ProjectID).Take(&project).Error; err != nil {
			return errors.Wrap(err, "error querying project for processMetricMonitor")
		}
		var workspace model.Workspace
		if err := DB.Where(&model.Workspace{Model: model.Model{ID: project.WorkspaceID}}).Take(&workspace).Error; err != nil {
			return errors.Wrap(err, "error querying workspace for processMetricMonitor")
		}

		aboveStr := "above"
		if alert.BelowThreshold {
			aboveStr = "below"
		}

		hookPayload := zapier.HookPayload{
			MetricValue:     pointy.Float64(float64(count)),
			MetricThreshold: pointy.Float64(float64(alert.CountThreshold)),
		}
		if err := rh.Notify(project.ID, fmt.Sprintf("LogAlert_%d", alert.ID), hookPayload); err != nil {
			log.WithContext(ctx).Error("error notifying zapier", err)
		}

		queryStr := ""
		if alert.Query != "" {
			queryStr = fmt.Sprintf(`for query *%s* `, alert.Query)
		}
		body := fmt.Sprintf(
			"Log count %swas %s the threshold.\n"+
				"_Count_: %d | _Threshold_: %d",
			queryStr,
			aboveStr,
			count,
			alert.CountThreshold,
		)

		log.WithContext(ctx).WithField("alert_id", alert.ID).Info(fmt.Sprintf("Firing alert for %s", alert.Name))

		if err := tempalerts.SendSlackLogAlert(ctx, DB, alert, &tempalerts.SendSlackAlertForLogAlertInput{Body: body, Workspace: &workspace, StartDate: start, EndDate: end}); err != nil {
			log.WithContext(ctx).Error("error sending slack alert for metric monitor", err)
		}

		if err = alerts.SendLogAlert(alerts.LogAlertEvent{
			LogAlert:  alert,
			Workspace: &workspace,
			Count:     count,
			StartDate: start,
			EndDate:   end,
		}); err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to send discord log alert")
		}

		emailsToNotify, err := model.GetEmailsToNotify(alert.EmailsToNotify)
		if err != nil {
			log.WithContext(ctx).Error(err)
		}

		logsUrl := tempalerts.GetLogAlertURL(alert.ProjectID, alert.Query, start, end)
		frontendURL := os.Getenv("REACT_APP_FRONTEND_URI")
		alertUrl := fmt.Sprintf("%s/%d/alerts/logs/%d", frontendURL, alert.ProjectID, alert.ID)

		templateData := map[string]interface{}{
			"alertLink":      alertUrl,
			"alertName":      alert.Name,
			"belowThreshold": alert.BelowThreshold,
			"count":          count,
			"logsLink":       logsUrl,
			"projectName":    project.Name,
			"query":          alert.Query,
			"threshold":      alert.CountThreshold,
		}

		subjectLine := alert.Name
		emailHtml, err := lambdaClient.FetchReactEmailHTML(ctx, lambda.ReactEmailTemplateLogAlert, templateData)
		if err != nil {
			return errors.Wrap(err, "error fetching email html")
		}

		for _, email := range emailsToNotify {
			if err := Email.SendReactEmailAlert(ctx, MailClient, *email, emailHtml, subjectLine); err != nil {
				log.WithContext(ctx).Error(err)
			}
		}
	}
	return nil
}
