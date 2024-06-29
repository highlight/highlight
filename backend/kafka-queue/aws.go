package kafka_queue

// based on https://github.com/segmentio/kafka-go/blob/e0af1cfbb8dd463571748e350262e2c81754bb73/example_groupbalancer_test.go#L37 and https://github.com/segmentio/kafka-go/issues/415

import (
	"encoding/json"
	"github.com/highlight-run/highlight/backend/env"
	"net/http"
	"time"
)

var availabilityZoneMap = map[string]string{
	"us-east-2a": "use2-az1",
	"us-east-2b": "use2-az2",
	"us-east-2c": "use2-az3",
}

// findRack is the basic rack resolver strategy for use in AWS.  It supports
//   - ECS with the task metadata endpoint enabled (returns the container
//     instance's availability zone)
//   - Linux EC2 (returns the instance's availability zone)
func findRack() string {
	switch whereAmI() {
	case "ecs":
		return ecsAvailabilityZone()
	}
	return ""
}

// whereAmI determines which strategy the rack resolver should use.
func whereAmI() string {
	// https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-metadata-endpoint.html
	if env.Config.ECSContainerMetadataUri != "" {
		return "ecs"
	}
	return "somewhere"
}

// ecsAvailabilityZone queries the task endpoint for the metadata URI that ECS
// injects into the ECS_CONTAINER_METADATA_URI variable in order to retrieve
// the availability zone where the task is running.
func ecsAvailabilityZone() string {
	client := http.Client{
		Timeout: time.Second,
		Transport: &http.Transport{
			DisableCompression: true,
			DisableKeepAlives:  true,
		},
	}
	r, err := client.Get(env.Config.ECSContainerMetadataUri + "/task")
	if err != nil {
		return ""
	}
	defer r.Body.Close()

	var md struct {
		AvailabilityZone string
	}
	if err := json.NewDecoder(r.Body).Decode(&md); err != nil {
		return ""
	}
	// AWS MSK sets the `broker.rack` to AZ IDs rather than AZ names
	return availabilityZoneMap[md.AvailabilityZone]
}
