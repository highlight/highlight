package dd

import (
	"fmt"
	"github.com/DataDog/datadog-go/statsd"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/pkg/errors"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

var (
	StatsD *statsd.Client
)

func Start(rt util.Runtime) error {
	host := "localhost"
	serviceTagKey, serviceTagValue := "service", string(rt)+"-service"
	serviceVersionTagKey, serviceVersionTagValue := "version", util.GenerateRandomString(8)

	tracer.Start(
		tracer.WithAgentAddr(fmt.Sprintf("%s:8126", host)),
		tracer.WithGlobalTag(serviceTagKey, serviceTagValue),
		tracer.WithGlobalTag(serviceVersionTagKey, serviceVersionTagValue),
	)
	var err error
	StatsD, err = statsd.New(fmt.Sprintf("%s:8125", host), statsd.WithTags(
		[]string{
			serviceTagKey + ":" + serviceTagValue,
			serviceVersionTagKey + ":" + serviceVersionTagValue,
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
