package redis

import (
	"context"
	"github.com/go-redsync/redsync/v4"
	"github.com/stretchr/testify/assert"
	"testing"
	"time"
)

func TestLock(t *testing.T) {
	r := NewClient()

	var count = 0
	go func() {
		mutex, err := r.AcquireLock(context.Background(), "test-lock", time.Minute)
		assert.NoError(t, err)
		t.Logf("hello 1")
		count += 1
		time.Sleep(time.Second * 3)
		ok, err := mutex.Unlock()
		assert.True(t, ok)
		assert.NoError(t, err)
	}()
	go func() {
		mutex, err := r.AcquireLock(context.Background(), "test-lock", time.Minute)
		assert.NoError(t, err)
		t.Logf("hello 2")
		count += 1
		ok, err := mutex.Unlock()
		assert.True(t, ok)
		assert.NoError(t, err)
	}()
	t.Logf("waiting")
	time.Sleep(5 * time.Second)
	mutex, err := r.AcquireLock(context.Background(), "test-lock", time.Minute)
	if err != nil {
		t.Error(err)
	}
	defer func(mutex *redsync.Mutex) {
		_, err := mutex.Unlock()
		if err != nil {
			t.Error(err)
		}
	}(mutex)
	t.Logf("acquired")
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
