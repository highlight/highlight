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
	"golang.org/x/sync/errgroup"

	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"

	"github.com/highlight-run/go-resthooks"
	Email "github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/zapier"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

var alertFrequencies = []int{15, 60, 300, 900, 1800}
var maxWorkers = 40

func WatchLogAlerts(ctx context.Context, DB *gorm.DB, TDB timeseries.DB, MailClient *sendgrid.Client, rh *resthooks.Resthook, redis *redis.Client, ccClient *clickhouse.Client) {
	log.WithContext(ctx).Info("Starting to watch log alerts")

	alertsByFrequency := &map[int][]*model.LogAlert{}

	getAlerts := func() {
		bucketed := map[int][]*model.LogAlert{}
		for _, freq := range alertFrequencies {
			bucketed[freq] = []*model.LogAlert{}
		}

		alerts := getLogAlerts(ctx, DB)
		for _, alert := range alerts {
			for _, freq := range alertFrequencies {
				if freq >= alert.Frequency {
					bucketed[freq] = append(bucketed[freq], alert)
					break
				}
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

	var g errgroup.Group

	alertWorkerpool := workerpool.New(maxWorkers)
	alertWorkerpool.SetPanicHandler(util.Recover)
	for _, freq := range alertFrequencies {
		f := freq
		g.Go(
			func() error {
				for range time.NewTicker(time.Duration(f) * time.Second).C {
					alerts := (*alertsByFrequency)[f]
					log.WithContext(ctx).Infof("Processing %d log alerts for frequency %d", len(alerts), f)
					for _, alert := range alerts {
						// copy `alert` by value so each call to processLogAlert references a different alert
						alert := alert
						alertWorkerpool.SubmitRecover(
							func() {
								err := processLogAlert(ctx, DB, TDB, MailClient, alert, rh, redis, ccClient)
								if err != nil {
									log.WithContext(ctx).Error(err)
								}
							})
					}
				}
				return nil
			})
	}

	err := g.Wait()
	if err != nil {
		log.WithContext(ctx).Error(err)
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
	lastTs, err := redis.GetLastLogTimestamp(ctx, alert.ProjectID)
	if err != nil {
		return errors.Wrap(err, "error retrieving last log timestamp")
	}
	// If there's no log timestamp set, assume time.Now()
	if lastTs.IsZero() {
		lastTs = time.Now()
	}
	end := lastTs.Add(-time.Minute)
	start := end.Add(-time.Duration(alert.Frequency) * time.Second)

	count64, err := ccClient.ReadLogsTotalCount(ctx, alert.ProjectID, modelInputs.LogsParamsInput{Query: alert.Query, DateRange: &modelInputs.DateRangeRequiredInput{
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
		if err := DB.Model(&model.Project{}).Where("id = ?", alert.ProjectID).First(&project).Error; err != nil {
			return errors.Wrap(err, "error querying project for processMetricMonitor")
		}
		var workspace model.Workspace
		if err := DB.Where(&model.Workspace{Model: model.Model{ID: project.WorkspaceID}}).First(&workspace).Error; err != nil {
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
			*alert.Name,
			queryStr,
			aboveStr,
			count,
			alert.CountThreshold,
		)

		log.WithContext(ctx).Info(message)

		if err := alert.SendSlackAlert(ctx, &model.SendSlackAlertForLogAlertInput{Message: message, Workspace: &workspace, StartDate: start, EndDate: end}); err != nil {
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
				*alert.Name,
				queryStr,
				aboveStr,
				count,
				alert.CountThreshold,
				alertUrl,
			)
			if err := Email.SendAlertEmail(ctx, MailClient, *email, message, "Log Alert", *alert.Name); err != nil {
				log.WithContext(ctx).Error(err)
			}
		}
	}
	return nil
}
