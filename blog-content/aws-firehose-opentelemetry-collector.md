---
title: "Configuring the OpenTelemetry Collector for AWS Firehose"
createdAt: 2025-01-23T12:00:00Z
readingTime: 14
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: CTO @ Highlight
authorTwitter: 'https://twitter.com/vkorolik'
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorWebsite: 'https://vadweb.us'
authorPFP: 'https://lh3.googleusercontent.com/a-/AOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY=s96-c'
tags: 'Developer Tooling, Monitoring, Observability'
metaTitle: 'Setting up the OpenTelemetry Collector with a Firehose Receiver'
---

```hint
Highlight.io is an [open source](https://github.com/highlight/highlight) monitoring platform. If you’re interested in learning more, get started at [highlight.io](https://highlight.io).
```

## Configuring the OpenTelemetry Collector for AWS Firehose

Amazon Kinesis Data Firehose is a fully managed service for delivering real-time streaming data to AWS destinations like S3, Redshift, or Elasticsearch. Integrating Firehose with the OpenTelemetry Collector allows for better observability of logs and metrics flowing through your AWS environment.

In this guide, we’ll explore how to configure the OpenTelemetry Collector to receive and process data from AWS Firehose.

## AWS Firehose

Before configuring OpenTelemetry, it’s important to understand the format of data sources that Firehose supports. AWS Firehose typically receives data from services like CloudWatch Metrics and CloudWatch Logs.

## Firehose Sources

### CloudWatch Metrics Stream Format

AWS Firehose can be configured to receive CloudWatch metrics in either OpenTelemetry 1.0 format or JSON format. The key difference is:
•	OpenTelemetry 1.0 format: Structured for direct ingestion into observability platforms.
•	Metrics JSON format: A more generic format that requires custom parsing before ingestion into OpenTelemetry.

Example JSON payload from a CloudWatch Metrics stream:

```json
{
    "namespace": "AWS/EC2",
    "metric_name": "CPUUtilization",
    "dimensions": {
    "InstanceId": "i-1234567890abcdef0"
    },
    "timestamp": 1706000000,
    "value": 23.5
}
```

To correctly process this data in OpenTelemetry, a receiver must be configured to parse and extract relevant metrics.

### CloudWatch Logs Format

CloudWatch logs can also be streamed to Firehose, where they are typically formatted in JSON. A sample log entry might look like this:

```json
{
    "owner": "123456789012",
    "logGroup": "/aws/lambda/my-function",
    "logStream": "2025/01/23/[$LATEST]abcdef1234567890",
    "message": "Function executed successfully",
    "timestamp": 1706000000
}
```

These logs need to be parsed properly to extract meaningful telemetry data before ingestion into OpenTelemetry.

## OpenTelemetry Collector

The OpenTelemetry Collector is a vendor-agnostic proxy for receiving, processing, and exporting telemetry data. To integrate Firehose, you need to use a custom receiver that can interpret Firehose-formatted payloads.

## Custom Receivers

The OpenTelemetry Collector supports custom receivers through the opentelemetry-collector-contrib repository. The Firehose receiver is not part of the core OpenTelemetry distribution, so you must use the contrib image.

To use the contrib image, modify your OpenTelemetry Collector configuration as follows:

```yaml
receivers:
    awsfirehose/cwmetrics:
        endpoint: '0.0.0.0:4433'
        record_type: cwmetrics
        include_metadata: true
    awsfirehose/cwlogs:
        endpoint: '0.0.0.0:4434'
        record_type: cwlogs
        include_metadata: true
    awsfirehose/otlp_v1:
        endpoint: '0.0.0.0:4435'
        record_type: otlp_v1
        include_metadata: true
    
exporters:
    logging:
    verbosity: detailed
    
service:
    pipelines:
        logs:
        receivers: [awsfirehose/cwmetrics, awsfirehose/cwlogs, awsfirehose/otlp_v1]
        exporters: [logging]
```

This configuration sets up a Firehose receiver that listens on port 8000 and processes logs in JSON format.

OpenTelemetry Firehose Receiver

If a native OpenTelemetry Firehose receiver is unavailable or does not fully meet your needs, you may need to manually implement a receiver.

Manual Implementation

Custom parsing of Firehose logs can be done using a processor within OpenTelemetry. For example, using a custom script to preprocess logs before ingestion:

```golang
package http

import (
	"compress/gzip"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"strings"
)

type FirehosePayload struct {
	RequestId string
	Timestamp int64
	Records   []struct {
		Data string
	}
}

func ExtractFirehoseMetadata(r *http.Request, body []byte) (*FirehosePayload, [][]byte, error) {
	var payload FirehosePayload
	if err := json.Unmarshal(body, &payload); err != nil {
		return nil, nil, err
	}

	attributesMap := struct {
		CommonAttributes struct {
			CustomHeader string `json:"x-custom-header"`
		} `json:"commonAttributes"`
	}{}
	if err := json.Unmarshal([]byte(r.Header.Get("X-Amz-Firehose-Common-Attributes")), &attributesMap); err != nil {
		return nil, nil, err
	}

	rawRecords := make([][]byte, 0, len(payload.Records))
	for _, l := range payload.Records {
		data, err := base64.StdEncoding.DecodeString(l.Data)
		if err != nil {
			return nil, nil, err
		}

		var msg []byte
		// try to load data as gzip. if it is not, assume it is not compressed
		gz, err := gzip.NewReader(strings.NewReader(string(data)))
		if err == nil {
			msg, err = io.ReadAll(gz)
			if err != nil {
				return nil, nil, err
			}
		} else {
			msg = data
		}
		rawRecords = append(rawRecords, msg)
	}

	return &payload, rawRecords, nil
}
```

This function extracts key log attributes and reformats them for further processing in OpenTelemetry.

## Conclusion

Integrating AWS Firehose with OpenTelemetry provides a powerful way to collect and analyze telemetry data from AWS services. Whether you use a native receiver or implement a custom solution, Firehose enables seamless data streaming for improved observability.

If you’re interested in leveraging OpenTelemetry for application monitoring, consider using Highlight.io, an open-source monitoring platform that simplifies observability.
