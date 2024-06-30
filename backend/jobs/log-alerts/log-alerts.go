package log_alerts

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
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
const alertEvalFreq = 15 * time.Second

// ingestDelay is an offset to make sure we look at ingested data
const ingestDelay = -time.Minute

func WatchLogAlerts(ctx context.Context, DB *gorm.DB, MailClient *sendgrid.Client, rh *resthooks.Resthook, redis *redis.Client, ccClient *clickhouse.Client, lambdaClient *lambda.Client) {
	log.WithContext(ctx).Info("Starting to watch log alerts")

	alertsByFrequency := &map[int64][]*model.LogAlert{}

	getAlerts := func() {
		bucketed := map[int64][]*model.LogAlert{}

		alerts := getLogAlerts(ctx, DB)
		for _, alert := range alerts {
			freq := int64(alert.Frequency)
			if freq > 0 {
				bucketed[freq] = append(bucketed[freq], alert)
			}
		}

		alertsByFrequency = &bucketed
		log.WithContext(ctx).Infof("Watching %d log alerts", len(alerts))
	}

	getAlerts()
	go func() {
		// Every minute, check for new alerts and bucket by frequency
		for range time.Tick(time.Minute) {
			getAlerts()
		}
	}()

	alertWorkerpool := workerpool.New(maxWorkers)
	alertWorkerpool.SetPanicHandler(util.Recover)

	startTime := time.Now().Unix()
	for range time.NewTicker(alertEvalFreq).C {
		curTime := time.Now().Unix()
		alerts := *alertsByFrequency
		for freq, alerts := range alerts {
			// If at least one tick has passed since the last loop,
			// evaluate the alerts for this bucket
			if (curTime / freq) > (startTime / freq) {
				for _, alert := range alerts {
					// copy `alert` by value so each call to processLogAlert references a different alert
					alert := alert
					alertWorkerpool.SubmitRecover(
						func() {
							ctx := context.Background()
							err := processLogAlert(ctx, DB, MailClient, alert, rh, redis, ccClient, lambdaClient)
							if err != nil {
								log.WithContext(ctx).Error(err)
							}
						})
				}
			}
		}
		startTime = curTime
	}
}

func getLogAlerts(ctx context.Context, DB *gorm.DB) []*model.LogAlert {
	var alerts []*model.LogAlert
	if err := DB.Model(&model.LogAlert{}).Where("disabled = ?", false).Find(&alerts).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.WithContext(ctx).Error("Error querying for log alerts")
		}
	}

	return alerts
}

func processLogAlert(ctx context.Context, DB *gorm.DB, MailClient *sendgrid.Client, alert *model.LogAlert, rh *resthooks.Resthook, redis *redis.Client, ccClient *clickhouse.Client, lambdaClient *lambda.Client) error {
	thresholdWindow := alert.Frequency
	if alert.ThresholdWindow != nil {
		thresholdWindow = *alert.ThresholdWindow
	}

	end := time.Now().Add(ingestDelay)
	start := end.Add(-time.Duration(thresholdWindow) * time.Second)

	count64, err := ccClient.ReadLogsTotalCount(ctx, alert.ProjectID, modelInputs.QueryInput{Query: alert.Query, DateRange: &modelInputs.DateRangeRequiredInput{
		StartDate: start,
		EndDate:   end,
	}})
	if err != nil {
		return errors.Wrap(err, "error querying clickhouse for log count")
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
		frontendURL := env.Config.FrontendUri
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
