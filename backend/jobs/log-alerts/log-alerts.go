package log_alerts

import (
	"context"
	"fmt"
	"time"

	"github.com/highlight-run/highlight/backend/alerts"
	"github.com/highlight-run/highlight/backend/clickhouse"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/timeseries"
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

func WatchLogAlerts(ctx context.Context, DB *gorm.DB, TDB timeseries.DB, MailClient *sendgrid.Client, rh *resthooks.Resthook, redis *redis.Client, ccClient *clickhouse.Client) {
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
							err := processLogAlert(ctx, DB, TDB, MailClient, alert, rh, redis, ccClient)
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

func processLogAlert(ctx context.Context, DB *gorm.DB, TDB timeseries.DB, MailClient *sendgrid.Client, alert *model.LogAlert, rh *resthooks.Resthook, redis *redis.Client, ccClient *clickhouse.Client) error {
	end := time.Now().Add(-time.Minute)
	start := end.Add(-time.Duration(alert.Frequency) * time.Second)

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
		"id":        alert.ID,
		"query":     alert.Query,
		"frequency": alert.Frequency,
		"start":     start.Format(time.RFC3339),
		"end":       end.Format(time.RFC3339),
		"count":     count,
		"threshold": alert.CountThreshold,
		"alerting":  alertCondition,
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
		message := fmt.Sprintf(
			"🚨 *%s* fired!\nLog count %swas %s the threshold.\n"+
				"_Count_: %d | _Threshold_: %d",
			alert.Name,
			queryStr,
			aboveStr,
			count,
			alert.CountThreshold,
		)

		log.WithContext(ctx).Info(message)

		if err := alert.SendSlackAlert(ctx, DB, &model.SendSlackAlertForLogAlertInput{Message: message, Workspace: &workspace, StartDate: start, EndDate: end}); err != nil {
			log.WithContext(ctx).Error("error sending slack alert for metric monitor", err)
		}

		if err = alerts.SendLogAlert(alerts.LogAlertEvent{
			LogAlert:  alert,
			Workspace: &workspace,
			Count:     count,
			StartDate: start,
			EndDate:   end,
		}); err != nil {
			log.WithContext(ctx).Error(err)
		}

		emailsToNotify, err := model.GetEmailsToNotify(alert.EmailsToNotify)
		if err != nil {
			log.WithContext(ctx).Error(err)
		}

		alertUrl := model.GetLogAlertURL(alert.ProjectID, alert.Query, start, end)

		for _, email := range emailsToNotify {
			queryStr := ""
			if alert.Query != "" {
				queryStr = fmt.Sprintf(`for query <b>%s</b> `, alert.Query)
			}
			message = fmt.Sprintf(
				"<b>%s</b> fired! Log count %sis currently %s the threshold.<br>"+
					"<em>Count</em>: %d | <em>Threshold</em>: %d"+
					"<br><br>"+
					"<a href=\"%s\">View Logs</a>",
				alert.Name,
				queryStr,
				aboveStr,
				count,
				alert.CountThreshold,
				alertUrl,
			)
			if err := Email.SendAlertEmail(ctx, MailClient, *email, message, "Log Alert", alert.Name); err != nil {
				log.WithContext(ctx).Error(err)
			}
		}
	}
	return nil
}
