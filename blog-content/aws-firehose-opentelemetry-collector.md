---
title: Configuring the OpenTelemetry Collector for AWS Firehose
createdAt: 2025-01-30T12:00:00.000Z
readingTime: 4
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: CTO @ Highlight
authorTwitter: 'https://twitter.com/vkorolik'
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorWebsite: 'https://vadweb.us'
authorPFP: >-
  https://lh3.googleusercontent.com/a-/AOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY=s96-c
tags: 'Engineering, Observability'
metaTitle: Set up the OpenTelemetry Collector with a Firehose Receiver
metaDescription: >-
  Learn how to configure the OpenTelemetry Collector to receive data from AWS
  Firehose.
---

```hint
Highlight.io is an [open source](https://github.com/highlight/highlight) monitoring platform. If you’re interested in learning more, get started at [highlight.io](https://highlight.io).
```

## Configuring the OpenTelemetry Collector for AWS Firehose

Amazon Kinesis Data Firehose is a fully managed service for delivering real-time streaming data to AWS destinations like S3, Redshift, or Elasticsearch. Integrating Firehose with the OpenTelemetry Collector allows for better observability of logs and metrics flowing through your AWS environment, and allows you to export the data to other destinations.

At highlight, we support the Firehose format with our cloud hosted OpenTelemetry collector at https://otlpv1.firehose.highlight.io. Our customers configure firehose to export to our collector to ingest logs and metrics into our platform. The result: management-free data export without the need to spin up additional infrastructure.

In this guide, we’ll explore how we configured the OpenTelemetry Collector to receive and process data from AWS Firehose.

## AWS Firehose

Before configuring OpenTelemetry, it’s important to understand the format of data sources that Firehose supports. AWS Firehose typically receives data from services like CloudWatch Metrics and CloudWatch Logs.

### CloudWatch Metrics Stream Format

AWS Firehose can be configured to receive CloudWatch metrics in either OpenTelemetry 1.0 format or JSON format. The key difference is:

* OpenTelemetry 1.0 format: Structured for direct ingestion into observability platforms. The data uses the [OTLP Protobuf](https://github.com/open-telemetry/opentelemetry-proto) with a slight twist: batches of binary collector export records can be concatenated. The payload has a header indicating the number of batches, necessary to split the binary data for deserialization. For reference, check out the [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/ff2d5e23033da2a3ce686e1513864a0a0f87b563/receiver/awsfirehosereceiver/internal/unmarshaler/otlpmetricstream/unmarshaler.go#L44-L49) implementation.
* Metrics JSON format: A more generic format that requires custom parsing before ingestion into OpenTelemetry.

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
  "timestamp": 1706000000,
  "requestId": "abc-123",
  "records": [
    {
      "data": "c2VjcmV0IG1lc3NhZ2U="
    }
  ]
}
```

These logs need to be parsed properly to extract meaningful telemetry data before ingestion into OpenTelemetry.

## OpenTelemetry Collector

The OpenTelemetry Collector is a vendor-agnostic proxy for receiving, processing, and exporting telemetry data. The [OpenTelemetry specification](https://opentelemetry.io/docs/specs/otel/) defines the data format implemented by the collector. The collector has streamlined components to control the data ingest, processing, and export to other destinations. The open source ecosystem continues to add new components to the collector, providing support for new ingest formats and new storage backends.

Leveraging existing OpenTelemetry receivers can significantly streamline the process of collecting telemetry data by reducing the need for custom parsing and transformation logic. Receivers are purpose-built to handle specific data formats, ensuring compatibility with OpenTelemetry’s internal processing pipeline and reducing engineering overhead. By using a pre-built receiver, you benefit from community support, ongoing maintenance, and optimizations that improve efficiency and reliability. Compared to manual ingestion or custom-built processors, receivers provide a standardized approach that minimizes errors, enhances performance, and simplifies integration with other observability tools.

One such receiver is the AWS Firehose receiver. To integrate Firehose, you just need to use a custom receiver that can interpret Firehose-formatted payloads. Thankfully, as of October 2024, a firehose receiver has been implemented in the `opentelemetry-collector-contrib` collector image.

## Custom Receivers

The OpenTelemetry Collector supports custom receivers through the [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) repository. The Firehose receiver is not part of the core OpenTelemetry distribution, so you must use the contrib image.

To configure the receivers, modify your OpenTelemetry Collector configuration as follows:

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
    debug:
        sampling_initial: 60
        sampling_thereafter: 1000
    otlphttp:
      endpoint: 'http://example-backend/otel'
      compression: snappy
    clickhouse:
        endpoint: "tcp://clickhouse-server:9000"
        database: "otel_metrics"
        username: "default"
        password: ""

service:
    pipelines:
        logs:
        receivers: [awsfirehose/cwmetrics, awsfirehose/cwlogs, awsfirehose/otlp_v1]
        exporters: [debug, otlphttp, clickhouse]
```

This configuration sets up 3 Firehose receivers listening on different ports for processing logs and metrics from different sources. The `record_type` key determines the expected format (see [record_type definitions](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awsfirehosereceiver#record-types) in the contrib repo). The `debug` exporter allows monitoring the number of records received; for your use-case, you would configure an appropriate exporter to send the data to a data store of your choosing.

## Manual Implementation

If a native OpenTelemetry receiver is unavailable or does not fully meet your needs, you may need to manually implement a receiver. For instance, custom parsing of Firehose logs can be done using a processor within OpenTelemetry. You can write a custom implementation to ingest logs:

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

This function extracts key log attributes and reformats them for further processing. You may deploy it as a standalone web server listening to firehose, but that would still require conecting it ot the rest of your observability pipeline. To incorporate it into the OpenTelemetry ecosystem, you can [create a custom OpenTelemetry Collector Receiver](https://opentelemetry.io/docs/collector/building/receiver/) using this implementation. While it's outside of the scope of this blog to describe this in detail, it would just be a matter of building it into the rest of the collector binary. Thankfully, the `opentelemetry-collector-contrib` implementation supports most popular data formats.

## Conclusion

Integrating AWS Firehose with OpenTelemetry provides a powerful way to collect and analyze telemetry data from AWS services. Whether you use a native receiver or implement a custom solution, Firehose enables seamless data streaming for improved observability. At the same time, it's not all that simple...

Don't want to mess with setting any of this up yourself? Try Highlight.io which supports it all out of the box! Just create a [Highlight Cloud](https://app.highlight.io) account and follow our [firehose export setup guide](/docs/getting-started/server/hosting/aws) to configure sending the data over.
