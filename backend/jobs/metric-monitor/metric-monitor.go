package metric_monitor

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"

	"github.com/highlight-run/go-resthooks"
	Email "github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/model"
	graph "github.com/highlight-run/highlight/backend/private-graph/graph"
	"github.com/highlight-run/highlight/backend/zapier"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func WatchMetricMonitors(DB *gorm.DB, MailClient *sendgrid.Client, rh *resthooks.Resthook) {
	log.Info("Starting to watch Metric Monitors")

	for range time.Tick(time.Minute * 1) {
		go func() {
			metricMonitors := getMetricMonitors(DB)
			processMetricMonitors(DB, MailClient, metricMonitors, rh)
		}()
	}
}

func getMetricMonitors(DB *gorm.DB) []*model.MetricMonitor {
	metricMonitors := []*model.MetricMonitor{}
	if err := DB.Model(&model.MetricMonitor{}).Where("disabled = ?", false).Find(&metricMonitors).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Error("Error querying for metric monitors")
		}
	}

	return metricMonitors
}

func processMetricMonitors(DB *gorm.DB, MailClient *sendgrid.Client, metricMonitors []*model.MetricMonitor, rh *resthooks.Resthook) {
	log.Info("Number of Metric Monitors to Process: ", len(metricMonitors))
	for _, metricMonitor := range metricMonitors {
		aggregateStatement := graph.GetAggregateSQLStatement(metricMonitor.Function)
		var value float64

		if err := DB.Raw(fmt.Sprintf(`
		SELECT
			COALESCE(%s, 0) as value
	      	FROM
			metrics
	      	WHERE
			name = '%s'
			AND project_id = %d
			AND created_at >= NOW() - INTERVAL '1 minutes';
	`, aggregateStatement, metricMonitor.MetricToMonitor, metricMonitor.ProjectID)).Scan(&value).Error; err != nil {
			log.Error(err)
		}

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

			hookPayload := zapier.HookPayload{
				MetricValue:     &value,
				MetricThreshold: &metricMonitor.Threshold,
			}
			if err := rh.Notify(project.ID, fmt.Sprintf("MetricMonitor_%d", metricMonitor.ID), hookPayload); err != nil {
				log.Error("error notifying zapier", err)
			}

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
