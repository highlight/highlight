package metric_monitor

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/highlight-run/highlight/backend/clickhouse"
	tempalerts "github.com/highlight-run/highlight/backend/temp-alerts"

	"github.com/highlight-run/highlight/backend/alerts"
	"github.com/highlight-run/highlight/backend/private-graph/graph"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
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

const (
	sigFigs = 4
)

func WatchMetricMonitors(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, MailClient *sendgrid.Client, rh *resthooks.Resthook) {
	log.WithContext(ctx).Info("Starting to watch Metric Monitors")

	for range time.Tick(time.Minute * 1) {
		go func() {
			metricMonitors := getMetricMonitors(ctx, DB)
			processMetricMonitors(ctx, DB, ccClient, MailClient, metricMonitors, rh)
		}()
	}
}

func getMetricMonitors(ctx context.Context, DB *gorm.DB) []*model.MetricMonitor {
	var metricMonitors []*model.MetricMonitor
	if err := DB.Preload("Filters").Model(&model.MetricMonitor{}).Where("disabled = ?", false).Find(&metricMonitors).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.WithContext(ctx).Error("Error querying for metric monitors")
		}
	}

	return metricMonitors
}

func processMetricMonitors(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, MailClient *sendgrid.Client, metricMonitors []*model.MetricMonitor, rh *resthooks.Resthook) {
	log.WithContext(ctx).Info("Number of Metric Monitors to Process: ", len(metricMonitors))
	for _, metricMonitor := range metricMonitors {
		var value float64
		end := time.Now()
		start := end.Add(-time.Minute)
		resMins := 1
		if metricMonitor.PeriodMinutes != nil && *metricMonitor.PeriodMinutes > 0 {
			resMins = *metricMonitor.PeriodMinutes
		}
		var filters []*modelInputs.MetricTagFilterInput
		for _, f := range metricMonitor.Filters {
			filters = append(filters, &modelInputs.MetricTagFilterInput{
				Tag:   f.Tag,
				Op:    f.Op,
				Value: f.Value,
			})
		}
		payload, err := graph.GetMetricTimeline(context.Background(), ccClient, metricMonitor.ProjectID, metricMonitor.MetricToMonitor, modelInputs.DashboardParamsInput{
			DateRange: &modelInputs.DateRangeRequiredInput{
				StartDate: start,
				EndDate:   end,
			},
			ResolutionMinutes: pointy.Int(resMins),
			Aggregator:        metricMonitor.Aggregator,
			Units:             metricMonitor.Units,
			Filters:           filters,
		})
		if err != nil {
			log.WithContext(ctx).Error(err)
			continue
		}
		if len(payload) < 1 {
			log.WithContext(ctx).Warn("invalid empty metrics payload")
			continue
		}
		value = payload[len(payload)-1].Value

		log.WithContext(ctx).Infof("Processing %s for Project %d. ID: %d", metricMonitor.Name, metricMonitor.ProjectID, metricMonitor.ID)
		log.WithContext(ctx).Infof("Current value: %f, Threshold: %f", value, metricMonitor.Threshold)

		if value >= metricMonitor.Threshold {
			var project model.Project
			if err := DB.Model(&model.Project{}).Where("id = ?", metricMonitor.ProjectID).Take(&project).Error; err != nil {
				log.WithContext(ctx).Error("error querying project for processMetricMonitor", err)
				return
			}
			var workspace model.Workspace
			if err := DB.Where(&model.Workspace{Model: model.Model{ID: project.WorkspaceID}}).Take(&workspace).Error; err != nil {
				log.WithContext(ctx).Error("error querying workspace for processMetricMonitor", err)
				return
			}

			valueRepr := strconv.FormatFloat(value, 'g', sigFigs, 64)
			thresholdRepr := strconv.FormatFloat(metricMonitor.Threshold, 'g', sigFigs, 64)
			diffRepr := strconv.FormatFloat(value-metricMonitor.Threshold, 'g', sigFigs, 64)
			unitsStr := ""
			if metricMonitor.Units != nil {
				unitsStr = *metricMonitor.Units
			}

			hookPayload := zapier.HookPayload{
				MetricValue:     &value,
				MetricThreshold: &metricMonitor.Threshold,
			}
			if err := rh.Notify(project.ID, fmt.Sprintf("MetricMonitor_%d", metricMonitor.ID), hookPayload); err != nil {
				log.WithContext(ctx).Error("error notifying zapier", err)
			}

			message := fmt.Sprintf(
				"🚨 *%s* fired!\n*%s* is currently *%s %s* over the threshold.\n"+
					"_Value_: %s %s | _Threshold_: %s %s",
				metricMonitor.Name,
				metricMonitor.MetricToMonitor,
				diffRepr,
				unitsStr,
				valueRepr,
				unitsStr,
				thresholdRepr,
				unitsStr,
			)

			log.WithContext(ctx).Info(message)

			if err := tempalerts.SendSlackMetricMonitorAlert(ctx, metricMonitor, &tempalerts.SendSlackAlertForMetricMonitorInput{Message: message, Workspace: &workspace}); err != nil {
				log.WithContext(ctx).Error("error sending slack alert for metric monitor", err)
			}

			if err = alerts.SendMetricMonitorAlert(alerts.MetricMonitorAlertEvent{
				MetricMonitor: metricMonitor,
				Workspace:     &workspace,
				UnitsFormat:   unitsStr,
				DiffOverValue: diffRepr,
				Value:         valueRepr,
				Threshold:     thresholdRepr,
			}); err != nil {
				log.WithContext(ctx).Error(err)
			}

			emailsToNotify, err := model.GetEmailsToNotify(metricMonitor.EmailsToNotify)
			if err != nil {
				log.WithContext(ctx).Error(err)
			}

			frontendURL := os.Getenv("REACT_APP_FRONTEND_URI")
			monitorURL := fmt.Sprintf("%s/%d/alerts/monitor/%d", frontendURL, metricMonitor.ProjectID, metricMonitor.ID)

			for _, email := range emailsToNotify {
				message = fmt.Sprintf(
					"<b>%s</b> is currently <b>%s %s</b> over the threshold.<br>"+
						"<em>Value</em>: %s <em>%s</em> | <em>Threshold: %s <em>%s</em>"+
						"<br><br>"+
						"<a href=\"%s\">View Monitor</a>",
					metricMonitor.Name,
					diffRepr,
					unitsStr,
					valueRepr,
					unitsStr,
					thresholdRepr,
					unitsStr,
					monitorURL,
				)
				if err := Email.SendAlertEmail(ctx, MailClient, *email, message, metricMonitor.MetricToMonitor, metricMonitor.Name); err != nil {
					log.WithContext(ctx).Error(err)

				}
			}
		}
	}
}
