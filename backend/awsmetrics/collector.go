package awsmetrics

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatch"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatch/types"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	ec2types "github.com/aws/aws-sdk-go-v2/service/ec2/types"
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

func (c *Collector) CollectEC2Metrics(ctx context.Context) error {
	// First, get list of running EC2 instances
	instances, err := c.ec2Client.DescribeInstances(ctx, &ec2.DescribeInstancesInput{
		Filters: []ec2types.Filter{
			{
				Name:   aws.String("instance-state-name"),
				Values: []string{"running"},
			},
		},
	})
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

	// For each metric and each instance
	for _, m := range ec2Metrics {
		for _, instanceId := range instanceIds {
			// Add instance dimension to metric
			metricWithDimension := m
			metricWithDimension.Dimensions = []types.Dimension{
				{
					Name:  aws.String("InstanceId"),
					Value: aws.String(instanceId),
				},
			}

			input := &cloudwatch.GetMetricDataInput{
				StartTime: aws.Time(startTime),
				EndTime:   aws.Time(endTime),
				MetricDataQueries: []types.MetricDataQuery{
					{
						Id: aws.String("m1"),
						MetricStat: &types.MetricStat{
							Metric: &metricWithDimension,
							Period: aws.Int32(300),
							Stat:   aws.String("Average"),
						},
					},
				},
			}

			result, err := c.client.GetMetricData(ctx, input)
			if err != nil {
				return fmt.Errorf("failed to get metric data for %s on instance %s: %w", *m.MetricName, instanceId, err)
			}

			if len(result.MetricDataResults) == 0 || len(result.MetricDataResults[0].Values) == 0 {
				fmt.Printf("No data points found for metric %s on instance %s\n", *m.MetricName, instanceId)
				continue
			}

			// Print metric data in a readable format
			metricResult := result.MetricDataResults[0]
			fmt.Printf("\nMetric: %s (Instance: %s)\n", *m.MetricName, instanceId)
			for i, value := range metricResult.Values {
				timestamp := metricResult.Timestamps[i]
				fmt.Printf("  Time: %s, Value: %.2f\n",
					timestamp.Format(time.RFC3339),
					value,
				)
			}
		}
	}

	return nil
}
