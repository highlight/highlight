package dd

import (
	"io/ioutil"
	"net/http"
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

	resp, err := http.Get("http://169.254.169.254/latest/meta-data/local-ipv4")
	if err != nil {
		return err
	}
	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	apmHost = string(bodyBytes)

	serviceTagKey, serviceTagValue := "service", string(rt)+"-service"
	serviceVersionTagKey, serviceVersionTagValue := "version", util.GenerateRandomString(8)

	tracer.Start(
		tracer.WithAgentAddr(apmHost),
		tracer.WithGlobalTag(serviceTagKey, serviceTagValue),
		tracer.WithGlobalTag(serviceVersionTagKey, serviceVersionTagValue),
	)
	StatsD, err = statsd.New(statsdHost, statsd.WithTags(
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
