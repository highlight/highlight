package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/highlight-run/highlight/backend/awsmetrics"
	"go.opentelemetry.io/otel/metric/noop"
)

func main() {
	// Create context that listens for interrupt signal
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// Get AWS credentials from environment
	cfg := &awsmetrics.Config{
		Region:          os.Getenv("AWS_REGION"),
		AccessKeyID:     os.Getenv("AWS_ACCESS_KEY_ID"),
		SecretAccessKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),
	}

	if cfg.Region == "" {
		cfg.Region = "us-west-2" // default region
	}

	// Create CloudWatch client
	cwClient, err := awsmetrics.NewCloudWatchClient(ctx, cfg)
	if err != nil {
		fmt.Printf("Failed to create CloudWatch client: %v", err)
		return
	}

	// Create EC2 client
	ec2Client, err := awsmetrics.NewEC2Client(ctx, cfg)
	if err != nil {
		fmt.Printf("Failed to create EC2 client: %v", err)
		return
	}

	// Create collector with no-op meter for now
	collector := awsmetrics.NewCollector(cwClient, ec2Client, noop.NewMeterProvider().Meter("aws-metrics"))

	// Create poller with 5-minute interval
	poller := awsmetrics.NewPoller(collector, 5*time.Second)

	fmt.Println("Starting AWS metrics collection...")

	// Start polling
	if err := poller.Start(ctx); err != nil {
		fmt.Printf("Poller stopped: %v", err)
	}
}
