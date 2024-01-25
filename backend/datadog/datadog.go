package dd

import (
	"fmt"
	"gopkg.in/DataDog/dd-trace-go.v1/profiler"
	"io"
	"net/http"
)

func Start(serviceName string) error {
	client := &http.Client{}
	req, err := http.NewRequest("PUT", "http://169.254.169.254/latest/api/token", nil)
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
	fmt.Printf("Loaded ec2 agent token %s\n", token)

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

	return profiler.Start(
		profiler.WithService(serviceName),
		profiler.WithAgentAddr(fmt.Sprintf("%s:8126", host)),
		profiler.WithProfileTypes(profiler.HeapProfile, profiler.CPUProfile, profiler.GoroutineProfile, profiler.MetricsProfile),
	)
}

func Stop() {
	profiler.Stop()
}
