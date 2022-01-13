package metric_monitor

import (
	"fmt"
	"strconv"

	"github.com/pkg/errors"

	"github.com/highlight-run/highlight/backend/model"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func WatchMetricMonitors(DB *gorm.DB) {
	log.Info("Starting to watch Metric Monitors")
	metricMonitors := getMetricMonitors(DB)

	processMetricMonitors(DB, metricMonitors)

}

func getMetricMonitors(DB *gorm.DB) []*model.MetricMonitor {
	metricMonitors := []*model.MetricMonitor{}
	if err := DB.Model(&model.MetricMonitor{}).Where("channels_to_notify != ?", "[]").Find(&metricMonitors).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Error("Error querying for metric monitors")
		}
	}

	return metricMonitors
}

func processMetricMonitors(DB *gorm.DB, metricMonitors []*model.MetricMonitor) {
	log.Info("Number of Metric Monitors to Process: ", len(metricMonitors))
	for _, metricMonitor := range metricMonitors {
		aggregateStatement := GetAggregateSQLStatement(metricMonitor.Function)
		var value float64

		if err := DB.Raw(fmt.Sprintf(`
		SELECT
			COALESCE(%s, 0) as value
	      	FROM
			metrics
	      	WHERE
			name = '%s'
			AND project_id = %d
			AND created_at >= NOW() - INTERVAL '100000 minutes';
	`, aggregateStatement, metricMonitor.MetricToMonitor, metricMonitor.ProjectID)).Scan(&value).Error; err != nil {
			log.Error(err)
		}

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
		}
	}
}

func GetAggregateSQLStatement(aggregateFunctionName string) string {
	aggregateStatement := "AVG(value)"

	switch aggregateFunctionName {
	case "p50":
		aggregateStatement = "percentile_cont(0.50) WITHIN GROUP (ORDER BY value)"
	case "p75":
		aggregateStatement = "percentile_cont(0.75) WITHIN GROUP (ORDER BY value)"
	case "p90":
		aggregateStatement = "percentile_cont(0.90) WITHIN GROUP (ORDER BY value)"
	case "p99":
		aggregateStatement = "percentile_cont(0.99) WITHIN GROUP (ORDER BY value)"
	case "avg":
	default:
		log.Error("Received an unsupported aggregateFunctionName: ", aggregateFunctionName)
		aggregateStatement = "AVG(value)"
	}

	return aggregateStatement
}
