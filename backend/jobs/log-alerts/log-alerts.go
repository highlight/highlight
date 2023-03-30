package log_alerts

import (
	"context"
	"fmt"
	"math"
	"os"
	"time"

	"github.com/highlight-run/highlight/backend/alerts"
	"github.com/highlight-run/highlight/backend/clickhouse"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/timeseries"
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

// <option value={15}>15 seconds</option>
// <option value={60}>1 minute</option>
// <option value={300}>5 minutes</option>
// <option value={900}>15 minutes</option>
// <option value={1800}>30 minutes</option>

var AlertFrequencies = []int{15, 60, 300, 900, math.MaxInt}

func WatchLogAlerts(ctx context.Context, DB *gorm.DB, TDB timeseries.DB, MailClient *sendgrid.Client, rh *resthooks.Resthook, redis *redis.Client, ccClient *clickhouse.Client) {
	log.WithContext(ctx).Info("Starting to watch Log Alerts")

	// alerts := getLogAlerts(ctx, DB) // frequency
	// go func() {
	// 	// Every minute, check for new alerts and bucket by frequency
	// 	for range time.Tick(time.Minute) {
	// 		alerts = getLogAlerts(ctx, DB) // frequency
	// 		for _, alert := range alerts {
	// 			for _, freq := range AlertFrequencies {
	// 				if
	// 			}
	// 		}

	// 	}
	// }()

	// for range time.Tick(15 * time.Second) {
	// 	go func() {
	// 		processLogAlerts(ctx, DB, TDB, MailClient, alerts, rh, redis, ccClient)
	// 	}()
	// }

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

func processLogAlerts(ctx context.Context, DB *gorm.DB, TDB timeseries.DB, MailClient *sendgrid.Client, logAlerts []*model.LogAlert, rh *resthooks.Resthook, redis *redis.Client, ccClient *clickhouse.Client) {
	log.WithContext(ctx).Info("Number of Log Alerts to Process: ", len(logAlerts))
	for _, alert := range logAlerts {
		// should this alert be triggered since within the last 15 seconds?
		// alert.Frequency
		// Get timestamp
		// Bucket timestamp into 15 second periods
		// If period is divisible by

		lastLog, err := redis.GetLastLogTimestamp(ctx, alert.ProjectID)
		if err != nil {
			log.WithContext(ctx).Error("error retrieving last log timestamp", err)
			continue
		}
		end := lastLog.Add(-time.Minute)
		start := end.Add(-time.Minute)

		count64, err := ccClient.ReadLogsTotalCount(ctx, alert.ProjectID, modelInputs.LogsParamsInput{Query: alert.Query, DateRange: &modelInputs.DateRangeRequiredInput{
			StartDate: start,
			EndDate:   end,
		}})
		if err != nil {
			log.WithContext(ctx).Error("error querying clickhouse for log count", err)
			continue
		}
		count := int(count64) // ZANETODO: this ok?

		alertCondition := count >= alert.CountThreshold
		if alert.BelowThreshold {
			alertCondition = count <= alert.CountThreshold
		}

		if alertCondition {
			var project model.Project
			if err := DB.Model(&model.Project{}).Where("id = ?", alert.ProjectID).First(&project).Error; err != nil {
				log.WithContext(ctx).Error("error querying project for processMetricMonitor", err)
				continue
			}
			var workspace model.Workspace
			if err := DB.Where(&model.Workspace{Model: model.Model{ID: project.WorkspaceID}}).First(&workspace).Error; err != nil {
				log.WithContext(ctx).Error("error querying workspace for processMetricMonitor", err)
				continue
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

			message := fmt.Sprintf(
				"🚨 *%s* fired!\nLog count for *%s* is currently %s the threshold.\n"+
					"_Count_: %d | _Threshold_: %d",
				*alert.Name, // ZANETODO: nil?
				alert.Query,
				aboveStr,
				count,
				alert.CountThreshold,
			)

			fmt.Println(message)

			if err := alert.SendSlackAlert(ctx, &model.SendLogAlertForMetricMonitorInput{Message: message, Workspace: &workspace}); err != nil {
				log.WithContext(ctx).Error("error sending slack alert for metric monitor", err)
			}

			if err = alerts.SendLogAlert(alerts.LogAlertEvent{
				LogAlert:  alert,
				Workspace: &workspace,
				Count:     count,
			}); err != nil {
				log.WithContext(ctx).Error(err)
			}

			emailsToNotify, err := model.GetEmailsToNotify(alert.EmailsToNotify)
			if err != nil {
				log.WithContext(ctx).Error(err)
			}

			frontendURL := os.Getenv("FRONTEND_URI")
			alertUrl := fmt.Sprintf("%s/%d/alerts/logs/%d", frontendURL, alert.ProjectID, alert.ID)

			for _, email := range emailsToNotify {
				message = fmt.Sprintf(
					"<b>%s</b> fired! Log count for query <b>%s</b> is currently %s the threshold.<br>"+
						"<em>Count</em>: %d | <em>Threshold: %d"+
						"<br><br>"+
						"<a href=\"%s\">View Alert</a>",
					*alert.Name, // ZANETODO: nil?
					alert.Query,
					aboveStr,
					count,
					alert.CountThreshold,
					alertUrl,
				)
				// ZANETODO: check nil
				if err := Email.SendAlertEmail(ctx, MailClient, *email, message, "Log Alert", *alert.Name); err != nil {
					log.WithContext(ctx).Error(err)
				}
			}
		}
	}
}
