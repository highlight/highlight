package redis

import (
	"context"
	"github.com/stretchr/testify/assert"
	"golang.org/x/sync/errgroup"
	"testing"
	"time"
)

func TestLock(t *testing.T) {
	r := NewClient()

	var count = 0
	var g errgroup.Group
	g.Go(func() error {
		acquired := r.AcquireLock(context.Background(), "test-lock", time.Minute)
		assert.True(t, acquired)
		t.Logf("hello 1")
		count += 1
		err := r.ReleaseLock(context.Background(), "test-lock")
		assert.NoError(t, err)
		return nil
	})
	g.Go(func() error {
		acquired := r.AcquireLock(context.Background(), "test-lock", time.Minute)
		assert.True(t, acquired)
		t.Logf("hello 2")
		count += 1
		err := r.ReleaseLock(context.Background(), "test-lock")
		assert.NoError(t, err)
		return nil
	})
	_ = g.Wait()
	assert.Equal(t, count, 2)
}

func BenchmarkLock(b *testing.B) {
	r := NewClient()
	for i := 0; i < b.N; i++ {
		acquired := r.AcquireLock(context.Background(), "test-lock", time.Minute)
		assert.True(b, acquired)
		err := r.ReleaseLock(context.Background(), "test-lock")
		assert.NoError(b, err)
	}
}
