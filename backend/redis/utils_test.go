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
		mutex, err := r.AcquireLock(context.Background(), "test-lock", time.Minute)
		assert.NoError(t, err)
		t.Logf("hello 1")
		count += 1
		time.Sleep(time.Second * 3)
		ok, err := mutex.Unlock()
		assert.True(t, ok)
		assert.NoError(t, err)
		return nil
	})
	time.Sleep(time.Second)
	g.Go(func() error {
		mutex, err := r.AcquireLock(context.Background(), "test-lock", time.Minute)
		assert.NoError(t, err)
		t.Logf("hello 2")
		count += 1
		ok, err := mutex.Unlock()
		assert.True(t, ok)
		assert.NoError(t, err)
		return nil
	})
	time.Sleep(time.Second)
	assert.Equal(t, count, 1)
	_ = g.Wait()
	assert.Equal(t, count, 2)
}

func BenchmarkLock(b *testing.B) {
	r := NewClient()
	for i := 0; i < b.N; i++ {
		mutex, err := r.AcquireLock(context.Background(), "test-lock", time.Minute)
		assert.NoError(b, err)
		ok, err := mutex.Unlock()
		assert.True(b, ok)
		assert.NoError(b, err)
	}
}
