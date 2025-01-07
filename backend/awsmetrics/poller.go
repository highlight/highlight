package awsmetrics

import (
	"context"
	"fmt"
	"time"
)

type Poller struct {
	collector *Collector
	interval  time.Duration
}

func NewPoller(collector *Collector, interval time.Duration) *Poller {
	return &Poller{
		collector: collector,
		interval:  interval,
	}
}

func (p *Poller) Start(ctx context.Context) error {
	ticker := time.NewTicker(p.interval)
	defer ticker.Stop()

	fmt.Printf("Starting AWS metrics collection with interval %s...\n", p.interval)

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			fmt.Printf("Collecting EC2 metrics...\n")

			if err := p.collector.CollectEC2Metrics(ctx); err != nil {
				fmt.Printf("Failed to collect EC2 metrics: %v\n", err)
				continue
			}
		}
	}
}
