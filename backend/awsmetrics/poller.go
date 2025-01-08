package awsmetrics

import (
	"context"
	"fmt"
	"time"
)

type Poller struct {
	collector *Collector
	done      chan struct{}
}

func NewPoller(collector *Collector) *Poller {
	return &Poller{
		collector: collector,
		done:      make(chan struct{}),
	}
}

// Start begins polling EC2 metrics every 5 minutes
func (p *Poller) Start(ctx context.Context) error {
	fmt.Println("::: Starting AWS metrics poller")
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	// Do an initial collection
	if err := p.collector.CollectEC2Metrics(ctx); err != nil {
		return fmt.Errorf("initial metrics collection failed: %w", err)
	}

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-p.done:
			return nil
		case <-ticker.C:
			if err := p.collector.CollectEC2Metrics(ctx); err != nil {
				// Log error but continue polling
				fmt.Printf("Error collecting EC2 metrics: %v\n", err)
			}
		}
	}
}

// Stop gracefully stops the poller
func (p *Poller) Stop() {
	close(p.done)
}
