package metric_monitor

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/private-graph/graph"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/timeseries"
	"github.com/openlyinc/pointy"
	"os"
	"strconv"
	"time"

	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"

	Email "github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/model"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func WatchMetricMonitors(DB *gorm.DB, TDB timeseries.DB, MailClient *sendgrid.Client) {
	log.Info("Starting to watch Metric Monitors")

	for range time.Tick(time.Minute * 1) {
		go func() {
			metricMonitors := getMetricMonitors(DB)
			processMetricMonitors(DB, TDB, MailClient, metricMonitors)
		}()
	}
}

func getMetricMonitors(DB *gorm.DB) []*model.MetricMonitor {
	var metricMonitors []*model.MetricMonitor
	if err := DB.Model(&model.MetricMonitor{}).Where("disabled = ?", false).Find(&metricMonitors).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Error("Error querying for metric monitors")
		}
	}

	return metricMonitors
}

func processMetricMonitors(DB *gorm.DB, TDB timeseries.DB, MailClient *sendgrid.Client, metricMonitors []*model.MetricMonitor) {
	log.Info("Number of Metric Monitors to Process: ", len(metricMonitors))
	for _, metricMonitor := range metricMonitors {
		var value float64
		end := time.Now()
		start := end.Add(-time.Minute)
		payload, err := graph.GetMetricTimeline(context.Background(), TDB, metricMonitor.ProjectID, metricMonitor.MetricToMonitor, modelInputs.DashboardParamsInput{
			DateRange: &modelInputs.DateRangeInput{
				StartDate: &start,
				EndDate:   &end,
			},
			ResolutionMinutes: pointy.Int(1),
			AggregateFunction: &metricMonitor.Function,
		})
		if err != nil {
			log.Error(err)
			continue
		}
		if len(payload) != 1 {
			log.Errorf("invalid metrics payload %+v", payload)
			continue
		}
		value = payload[0].Value

		log.Infof("Processing %s for Project %d. ID: %d", metricMonitor.Name, metricMonitor.ProjectID, metricMonitor.ID)
		log.Infof("Current value: %f, Threshold: %f", value, metricMonitor.Threshold)

		if value >= metricMonitor.Threshold {
			var project model.Project
			if err := DB.Model(&model.Project{}).Where("id = ?", metricMonitor.ProjectID).First(&project).Error; err != nil {
				log.Error("error querying project for processMetricMonitor", err)
				return
			}
			var workspace model.Workspace
			if err := DB.Where(&model.Workspace{Model: model.Model{ID: project.WorkspaceID}}).First(&workspace).Error; err != nil {
				log.Error("error querying workspace for processMetricMonitor", err)
				return
			}

			// This is to remove trailing 0
			// Example: 0.00100 should only display 0.001.
			valueWithNoTrailingZeroes := strconv.FormatFloat(value, 'f', -1, 64)
			thresholdWithNoTrailingZeros := strconv.FormatFloat(metricMonitor.Threshold, 'f', -1, 64)

			message := fmt.Sprintf("🚨 *%s* Fired!\n*%s* is currently `%f` over the threshold.\n(Value: `%s`, Threshold: `%s`)", metricMonitor.Name, metricMonitor.MetricToMonitor, value-metricMonitor.Threshold, valueWithNoTrailingZeroes, thresholdWithNoTrailingZeros)

			if err := metricMonitor.SendSlackAlert(&model.SendSlackAlertForMetricMonitorInput{Message: message, Workspace: &workspace}); err != nil {
				log.Error("error sending slack alert for metric monitor", err)
			}

			emailsToNotify, err := model.GetEmailsToNotify(metricMonitor.EmailsToNotify)
			if err != nil {
				log.Error(err)
			}

			frontendURL := os.Getenv("FRONTEND_URI")
			monitorURL := fmt.Sprintf("%s/%d/alerts/monitor/%d", frontendURL, metricMonitor.ProjectID, metricMonitor.ID)

			for _, email := range emailsToNotify {
				message = fmt.Sprintf("<b>%s</b> is currently <b>%f</b> over the threshold.<br>(Value: <b>%s</b>, Threshold: <b>%s</b>)<br><br><a href=\"%s\">View Monitor</a>", metricMonitor.Name, value-metricMonitor.Threshold, valueWithNoTrailingZeroes, thresholdWithNoTrailingZeros, monitorURL)
				if err := Email.SendAlertEmail(MailClient, *email, message, metricMonitor.MetricToMonitor, metricMonitor.Name); err != nil {
					log.Error(err)

				}
			}
		}
	}
}
