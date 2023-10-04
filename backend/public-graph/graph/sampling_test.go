package graph

import (
	"context"
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
