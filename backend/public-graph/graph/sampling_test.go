package graph

import (
	"context"
	"github.com/stretchr/testify/assert"
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
