package main

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/timeseries"
	log "github.com/sirupsen/logrus"
)

func main() {
	ctx := context.TODO()
	log.WithContext(ctx).Info("setting up db")
	tdb := timeseries.New(ctx)
	log.WithContext(ctx).Info("done setting up db")

	for d := 0; d < 30; d++ {
		for h := 0; h < 24; h++ {
			for m := 0; m < 60; m++ {
				for p := 1; p <= 1; p++ {
					//for p := 1; p <= 1071; p++ {
					query := fmt.Sprintf(`
					from(bucket: "prod-%d")
						|> range(start: -%dd%dh%dm, stop: %dd%dh%dm)
						|> filter(fn: (r) => r._measurement == "metrics")
						|> aggregateWindow(every: 1m, fn: mean)
						|> set(key: "_measurement", value: "metrics-aggregate-minute")
						|> to(bucket: "prod-%d/downsampled")
				`, p, d, h, m+1, d, h, m, p)
					log.WithContext(ctx).Infof("query %s", query)
					_, err := tdb.Query(context.Background(), query)
					if err != nil {
						log.WithContext(ctx).Error(err)
					}
				}
			}
		}
	}

	tdb.Stop()
}
