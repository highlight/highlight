package hlog

import (
	"time"

	dd "github.com/highlight-run/highlight/backend/datadog"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

func logIfError(name string, err error) {
	if err != nil && util.IsProdEnv() && !util.IsOnPrem() {
		log.Error(e.Wrap(err, "dd error tracking: "+name))
	}
}

// Histogram tracks the statistical distribution of a set of values on each host.
func Histogram(name string, value float64, tags []string, rate float64) {
	logIfError(name, dd.StatsD.Histogram(name, value, tags, rate))
}

// Timing sends timing information, it is an alias for TimeInMilliseconds
// It is flushed by statsd with percentiles, mean and other info (https://github.com/etsy/statsd/blob/master/docs/metric_types.md#timing)
func Timing(name string, value time.Duration, tags []string, rate float64) {
	logIfError(name, dd.StatsD.Timing(name, value, tags, rate))
}

// Incr is just Count of 1
// Count tracks how many times something happened per second.
func Incr(name string, tags []string, rate float64) {
	logIfError(name, dd.StatsD.Incr(name, tags, rate))
}
