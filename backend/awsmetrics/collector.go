package awsmetrics

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatch"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatch/types"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	"go.opentelemetry.io/otel/metric"
)

var ec2Metrics = []types.Metric{
	{
		MetricName: aws.String("CPUUtilization"),
		Namespace:  aws.String("AWS/EC2"),
	},
	{
		MetricName: aws.String("DiskReadOps"),
		Namespace:  aws.String("AWS/EC2"),
	},
	{
		MetricName: aws.String("DiskWriteOps"),
		Namespace:  aws.String("AWS/EC2"),
	},
	{
		MetricName: aws.String("DiskReadBytes"),
		Namespace:  aws.String("AWS/EC2"),
	},
	{
		MetricName: aws.String("DiskWriteBytes"),
		Namespace:  aws.String("AWS/EC2"),
	},
	{
		MetricName: aws.String("NetworkIn"),
		Namespace:  aws.String("AWS/EC2"),
	},
	{
		MetricName: aws.String("NetworkOut"),
		Namespace:  aws.String("AWS/EC2"),
	},
}

type Collector struct {
	client    *cloudwatch.Client
	ec2Client *ec2.Client
	meter     metric.Meter
}

func NewCollector(client *cloudwatch.Client, ec2Client *ec2.Client, meter metric.Meter) *Collector {
	return &Collector{
		client:    client,
		ec2Client: ec2Client,
		meter:     meter,
	}
}

// DescribeInstances retrieves information about EC2 instances
func DescribeInstances(ctx context.Context, client *ec2.Client) (*ec2.DescribeInstancesOutput, error) {
	return client.DescribeInstances(ctx, &ec2.DescribeInstancesInput{})
}

func (c *Collector) CollectEC2Metrics(ctx context.Context) error {
	// First, get list of running EC2 instances
	instances, err := DescribeInstances(ctx, c.ec2Client)
	if err != nil {
		return fmt.Errorf("failed to describe EC2 instances: %w", err)
	}

	// Print number of reservations and instances found
	fmt.Printf("\nFound %d EC2 reservations\n", len(instances.Reservations))

	var instanceIds []string
	for _, reservation := range instances.Reservations {
		for _, instance := range reservation.Instances {
			instanceIds = append(instanceIds, *instance.InstanceId)
			fmt.Printf("Instance ID: %s\n", *instance.InstanceId)
		}
	}

	if len(instanceIds) == 0 {
		fmt.Println("No running EC2 instances found")
		return nil
	}

	endTime := time.Now()
	startTime := endTime.Add(-5 * time.Minute)

	// Build all metric queries at once
	var metricDataQueries []types.MetricDataQuery
	for i, m := range ec2Metrics {
		for j, instanceId := range instanceIds {
			queryId := fmt.Sprintf("m%d_%d", i, j)
			metricWithDimension := m
			metricWithDimension.Dimensions = []types.Dimension{
				{
					Name:  aws.String("InstanceId"),
					Value: aws.String(instanceId),
				},
			}

			metricDataQueries = append(metricDataQueries, types.MetricDataQuery{
				Id: aws.String(queryId),
				MetricStat: &types.MetricStat{
					Metric: &metricWithDimension,
					Period: aws.Int32(300),
					Stat:   aws.String("Average"),
				},
			})
		}
	}

	// CloudWatch GetMetricData has a limit of 500 metrics per request
	const maxMetricsPerRequest = 500
	var allResults []types.MetricDataResult

	// Split queries into chunks of maxMetricsPerRequest
	for i := 0; i < len(metricDataQueries); i += maxMetricsPerRequest {
		end := i + maxMetricsPerRequest
		if end > len(metricDataQueries) {
			end = len(metricDataQueries)
		}

		input := &cloudwatch.GetMetricDataInput{
			StartTime:         aws.Time(startTime),
			EndTime:           aws.Time(endTime),
			MetricDataQueries: metricDataQueries[i:end],
		}

		// Handle pagination for each chunk
		paginator := cloudwatch.NewGetMetricDataPaginator(c.client, input)
		for paginator.HasMorePages() {
			output, err := paginator.NextPage(ctx)
			if err != nil {
				return fmt.Errorf("failed to get metric data: %w", err)
			}
			allResults = append(allResults, output.MetricDataResults...)
		}
	}

	// Process and print results
	for _, result := range allResults {
		if len(result.Values) == 0 {
			fmt.Printf("No data points found for metric ID %s\n", *result.Id)
			continue
		}

		// Extract metric info from query ID
		fmt.Printf("\nMetric ID: %s\n", *result.Id)
		for i, value := range result.Values {
			timestamp := result.Timestamps[i]
			fmt.Printf("  Time: %s, Value: %.2f\n",
				timestamp.Format(time.RFC3339),
				value,
			)
		}
	}

	return nil
}
