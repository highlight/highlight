package dd

import (
	"os"

	"github.com/DataDog/datadog-go/statsd"
	"github.com/pkg/errors"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

var (
	StatsD *statsd.Client
)

func Start(isProduction bool) error {
	statsdHost := os.Getenv("DD_STATSD_HOST")
	apmHost := os.Getenv("DD_APM_HOST")
	hostTagKey, hostTagValue := "host", os.Getenv("RENDER_SERVICE_NAME")
	serviceTagKey, serviceTagValue := "service", os.Getenv("RENDER_SERVICE_TYPE")+"-"+os.Getenv("RENDER_INSTANCE_ID")
	if isProduction {
		tracer.Start(
			tracer.WithAgentAddr(apmHost),
			tracer.WithGlobalTag(hostTagKey, hostTagValue),
			tracer.WithGlobalTag(serviceTagKey, serviceTagValue),
		)
	}
	var err error
	StatsD, err = statsd.New(statsdHost, statsd.WithTags(
		[]string{
			hostTagKey + ":" + hostTagValue,
			serviceTagKey + ":" + serviceTagValue,
		},
	))
	if err != nil {
		return errors.Wrap(err, "error creating statsd client")
	}
	return nil
}

func Stop(isProduction bool) {
	if isProduction {
		tracer.Stop()
	}
	StatsD.Close()
}
