package main

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/timeseries"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"github.com/influxdata/influxdb-client-go/v2/domain"
	log "github.com/sirupsen/logrus"
)

func main() {
	log.Info("setting up db")
	tdb := timeseries.New()
	log.Info("done setting up db")

	offset := 0
	for {
		buckets, _ := tdb.Client.BucketsAPI().GetBuckets(context.Background(), api.PagingWithOffset(offset))
		if buckets == nil || len(*buckets) == 0 {
			break
		}
		offset += len(*buckets)
		for _, b := range *buckets {
			if strings.HasPrefix(b.Name, "prod-") {
				if !strings.HasSuffix(b.Name, "downsampled") {
					fmt.Println(b.Name)
					b.RetentionRules = []domain.RetentionRule{{
						// short metric expiry for granular data since we will only store downsampled data long term
						EverySeconds: int64((60 * time.Minute).Seconds()),
						Type:         domain.RetentionRuleTypeExpire,
					}}
					_, _ = tdb.Client.BucketsAPI().UpdateBucket(context.Background(), &b)
				}
			}
		}
	}

	tdb.Stop()
}
