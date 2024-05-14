package redis

import (
	"context"
	"github.com/go-redsync/redsync/v4"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/stretchr/testify/assert"
	"math/rand"
	"testing"
	"time"
)

func randomString() (*string, error) {
	b := make([]byte, 32)
	for i := range b {
		b[i] = byte(rand.Intn(26) + 65)
	}
	return pointy.String(string(b)), nil
}
func randomError() (*string, error) {
	s, _ := randomString()
	return nil, e.New(*s)
}

func Test_CachedEval(t *testing.T) {
	ctx := context.TODO()
	r := NewClient()
	key, _ := randomString()
	v1, e1 := CachedEval(ctx, r, *key, time.Minute, time.Minute, randomString)
	v2, e2 := CachedEval(ctx, r, *key, time.Minute, time.Minute, randomString)
	assert.NoError(t, e1)
	assert.NoError(t, e2)
	assert.EqualValues(t, v1, v2)
	assert.EqualValues(t, e1, e2)

	key, _ = randomString()
	v1, e1 = CachedEval(ctx, r, *key, time.Minute, time.Minute, randomError)
	v2, e2 = CachedEval(ctx, r, *key, time.Minute, time.Minute, randomError)
	assert.Error(t, e1)
	assert.Error(t, e2)
	assert.EqualValues(t, v1, v2)
	assert.NotEqualValues(t, e1, e2)

	key, _ = randomString()
	v1, e1 = CachedEval(ctx, r, *key, time.Minute, time.Minute, randomError, WithStoreNil(true), WithIgnoreError(true))
	v2, e2 = CachedEval(ctx, r, *key, time.Minute, time.Minute, randomError, WithStoreNil(true), WithIgnoreError(true))
	assert.Error(t, e1)
	assert.NoError(t, e2)
	assert.EqualValues(t, v1, v2)
	assert.NotEqualValues(t, e1, e2)
}

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
