package metric_monitor

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/highlight-run/highlight/backend/private-graph/graph"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
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

const (
	sigFigs = 4
)

func WatchMetricMonitors(DB *gorm.DB, TDB timeseries.DB, MailClient *sendgrid.Client, rh *resthooks.Resthook) {
	log.Info("Starting to watch Metric Monitors")

	for range time.Tick(time.Minute * 1) {
		go func() {
			metricMonitors := getMetricMonitors(DB)
			processMetricMonitors(DB, TDB, MailClient, metricMonitors, rh)
		}()
	}
}

func getMetricMonitors(DB *gorm.DB) []*model.MetricMonitor {
	var metricMonitors []*model.MetricMonitor
	if err := DB.Preload("Filters").Model(&model.MetricMonitor{}).Where("disabled = ?", false).Find(&metricMonitors).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Error("Error querying for metric monitors")
		}
	}

	return metricMonitors
}

func processMetricMonitors(DB *gorm.DB, TDB timeseries.DB, MailClient *sendgrid.Client, metricMonitors []*model.MetricMonitor, rh *resthooks.Resthook) {
	log.Info("Number of Metric Monitors to Process: ", len(metricMonitors))
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
		payload, err := graph.GetMetricTimeline(context.Background(), TDB, metricMonitor.ProjectID, metricMonitor.MetricToMonitor, modelInputs.DashboardParamsInput{
			DateRange: &modelInputs.DateRangeInput{
				StartDate: &start,
				EndDate:   &end,
			},
			ResolutionMinutes: pointy.Int(resMins),
			Aggregator:        &metricMonitor.Aggregator,
			Units:             metricMonitor.Units,
			Filters:           filters,
		})
		if err != nil {
			log.Error(err)
			continue
		}
		if len(payload) < 1 {
			log.Errorf("invalid metrics payload %+v", payload)
			continue
		}
		value = payload[len(payload)-1].Value

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
				log.Error("error notifying zapier", err)
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

			fmt.Println(message)

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
				if err := Email.SendAlertEmail(MailClient, *email, message, metricMonitor.MetricToMonitor, metricMonitor.Name); err != nil {
					log.Error(err)

				}
			}
		}
	}
}
