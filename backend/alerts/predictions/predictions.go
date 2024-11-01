package predictions

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/env"
	"github.com/samber/lo"
	"go.openly.dev/pointy"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

type PredictionDataFrame struct {
	DS map[uint64]string  `json:"ds"`
	Y  map[uint64]float64 `json:"y"`
}

type PredictionInput struct {
	ChangepointPriorScale float64             `json:"changepoint_prior_scale"`
	IntervalWidth         float64             `json:"interval_width"`
	IntervalSeconds       int                 `json:"interval_seconds"`
	Input                 PredictionDataFrame `json:"input"`
}

type PredictionResult struct {
	DS        map[int]uint64  `json:"ds"`
	YHat      map[int]float64 `json:"yhat"`
	YHatLower map[int]float64 `json:"yhat_lower"`
	YHatUpper map[int]float64 `json:"yhat_upper"`
}

func AddPredictions(ctx context.Context, metricBuckets []*modelInputs.MetricBucket, settings modelInputs.PredictionSettings) error {
	// Partition all buckets by group, then get a prediction for each group
	partitioned := lo.PartitionBy(metricBuckets, func(bucket *modelInputs.MetricBucket) string {
		return strings.Join(bucket.Group, ",")
	})

	for _, buckets := range partitioned {
		y := map[uint64]float64{}
		ds := map[uint64]string{}
		for _, b := range buckets {
			var value float64
			if b.MetricValue != nil {
				value = *b.MetricValue
			}
			y[b.BucketID] = value
			ds[b.BucketID] = time.Unix(int64((b.BucketMax+b.BucketMin)/2), 0).Format("2006-01-02T15:04:05")
		}

		marshaled, err := json.Marshal(PredictionInput{
			ChangepointPriorScale: settings.ChangepointPriorScale,
			IntervalWidth:         settings.IntervalWidth,
			IntervalSeconds:       settings.IntervalSeconds,
			Input: PredictionDataFrame{
				DS: ds,
				Y:  y,
			},
		})
		if err != nil {
			return err
		}

		req, _ := http.NewRequest(http.MethodPost, env.Config.PredictionsEndpoint, bytes.NewReader(marshaled))
		req = req.WithContext(ctx)
		req.Header = http.Header{
			"Content-Type": []string{"application/json"},
		}

		httpClient := http.Client{}
		resp, err := httpClient.Do(req)
		if err != nil {
			return err
		}
		if resp.StatusCode != 200 {
			return fmt.Errorf("prediction returned %d", resp.StatusCode)
		}

		b, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}

		var result PredictionResult
		if err = json.Unmarshal(b, &result); err != nil {
			return err
		}

		for idx, b := range buckets {
			if settings.ThresholdCondition != modelInputs.ThresholdConditionBelow {
				b.YhatUpper = pointy.Float64(result.YHatUpper[idx])
			}
			if settings.ThresholdCondition != modelInputs.ThresholdConditionAbove {
				b.YhatLower = pointy.Float64(result.YHatLower[idx])
			}
		}
	}

	return nil
}
