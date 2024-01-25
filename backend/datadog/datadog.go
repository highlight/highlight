package dd

import (
	"fmt"
	"github.com/DataDog/datadog-go/statsd"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/pkg/errors"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"io"
	"net/http"
)

var (
	StatsD *statsd.Client
)

func Start(rt util.Runtime) error {
	client := &http.Client{}
	req, err := http.NewRequest("GET", "http://169.254.169.254/latest/api/token", nil)
	if err != nil {
		return err
	}
	req.Header.Add("X-aws-ec2-metadata-token-ttl-seconds", "21600")
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	token, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}

	req, err = http.NewRequest("GET", "http://169.254.169.254/latest/meta-data/local-ipv4", nil)
	if err != nil {
		return err
	}
	req.Header.Add("X-aws-ec2-metadata-token", string(token))

	res, err = client.Do(req)
	if err != nil {
		return err
	}

	host, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}
	fmt.Printf("Loaded datadog host %s\n", host)

	serviceTagKey, serviceTagValue := "service", string(rt)+"-service"
	serviceVersionTagKey, serviceVersionTagValue := "version", util.GenerateRandomString(8)

	tracer.Start(
		tracer.WithAgentAddr(fmt.Sprintf("%s:8126", host)),
		tracer.WithGlobalTag(serviceTagKey, serviceTagValue),
		tracer.WithGlobalTag(serviceVersionTagKey, serviceVersionTagValue),
	)
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
