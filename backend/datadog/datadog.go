package dd

import (
	"os"

	"github.com/DataDog/datadog-go/statsd"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/pkg/errors"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

var (
	StatsD *statsd.Client
)

func Start(rt util.Runtime) error {
	statsdHost := os.Getenv("DD_STATSD_HOST")
	apmHost := os.Getenv("DD_APM_HOST")
	serviceTagKey, serviceTagValue := "service", string(rt)+"-service"
	tracer.Start(
		tracer.WithAgentAddr(apmHost),
		tracer.WithGlobalTag(serviceTagKey, serviceTagValue),
	)
	var err error
	StatsD, err = statsd.New(statsdHost, statsd.WithTags(
		[]string{
			serviceTagKey + ":" + serviceTagValue,
		},
	))
	if err != nil {
		return errors.Wrap(err, "error creating statsd client")
	}
	return nil
}

func Stop() {
	tracer.Stop()
	StatsD.Close()
}
