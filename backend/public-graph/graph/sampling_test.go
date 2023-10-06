package graph

import (
	"context"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/openlyinc/pointy"
	"github.com/stretchr/testify/assert"
	"math"
	"testing"
	"time"
)

func Benchmark_isIngestedBySample(b *testing.B) {
	ctx := context.TODO()
	for i := 0; i < b.N; i++ {
		isIngestedBySample(ctx, "", 0.5)
	}
	if b.N > 1 {
		assert.Less(b, b.Elapsed()/time.Duration(b.N), time.Millisecond, "benchmarked fn is too slow")
	}
}

func Fuzz_isIngestedBySample(f *testing.F) {
	ctx := context.TODO()
	f.Add("", 0.5)
	f.Add("key", 0.5)
	f.Add("hello, world!", 1.)
	f.Add("", 0.)
	f.Fuzz(func(t *testing.T, key string, rate float64) {
		isIngestedBySample(ctx, key, rate)
	})
}

func Fuzz_isIngestedBySampleExtremes(f *testing.F) {
	ctx := context.TODO()
	f.Add("")
	f.Add("key")
	f.Add("hello, world!")
	f.Fuzz(func(t *testing.T, key string) {
		ingested := isIngestedBySample(ctx, key, 0)
		assert.False(t, ingested)
		ingested = isIngestedBySample(ctx, key, 1)
		assert.True(t, ingested)
	})
}

func Test_isIngestedBySample(t *testing.T) {
	const N = 100_000
	ctx := context.TODO()
	for rate := 0.; rate < 1.; rate += 0.1 {
		ingested := 0
		for i := 0; i < N; i++ {
			if isIngestedBySample(ctx, "", rate) {
				ingested += 1
			}
		}
		actualRate := float64(ingested) / N
		assert.Lessf(t, math.Abs(rate-actualRate), 0.01, "expected rate delta within 1%%; rate %+v", rate)
	}
}

func Test_isIngestedByRate(t *testing.T) {
	r := Resolver{Redis: redis.NewClient()}
	const N = 10_000
	ctx := context.TODO()
	for max := int64(0); max < N; max += N / 10 {
		// pin a consistent minute throughout the test to avoid hitting multiple different minute buckets
		minute := time.Now().Minute()
		_ = r.Redis.FlushDB(ctx)
		var ingested int64 = 0
		for i := 0; i < N; i++ {
			if r.isIngestedByRateLimit(ctx, "test-project-1", max, minute) {
				ingested += 1
			}
		}
		assert.LessOrEqualf(t, ingested, max, "expected ingested lte max, max %+v", max)
	}
}

func Test_IsSessionExcluded(t *testing.T) {
	ctx := context.TODO()
	_, err := resolver.Store.UpdateProjectFilterSettings(ctx, 1, store.UpdateProjectFilterSettingsParams{
		Sampling: &modelInputs.SamplingInput{
			SessionSamplingRate:    pointy.Float64(0.5),
			SessionMinuteRateLimit: pointy.Int64(1),
			SessionExclusionQuery:  pointy.String("environment:prod"),
		},
	})
	if err != nil {
		t.Error(err)
	}
	err = resolver.Redis.FlushDB(ctx)
	if err != nil {
		t.Error(err)
	}

	s := model.Session{ProjectID: 1}
	excluded, reason := resolver.IsSessionExcluded(ctx, &s, false)
	assert.False(t, excluded)
	assert.Equal(t, "", reason.String())
	for i := 0; i < 100; i++ {
		for _, hasErrors := range []bool{false, true} {
			// "abc123" is always included by sampling with 50% rate
			s := model.Session{ProjectID: 1, SecureID: "abc123"}
			excluded, reason := resolver.IsSessionExcluded(ctx, &s, hasErrors)
			assert.True(t, excluded)
			assert.Equal(t, modelInputs.SessionExcludedReasonRateLimitMinute, *reason)
		}
	}
}
