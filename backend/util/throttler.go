package util

import (
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type ThrottledFunc func()

var throttles sync.Map

// Creates or uses an existing ThrottledFunc based on the key passed in
func MemoThrottle(key string, action func(), duration time.Duration) {
	throttledFunc, ok := throttles.Load(key)
	if !ok {
		throttledFunc, _ = throttles.LoadOrStore(key, InitThrottledFunc(action, duration))
	}
	throttledFunc.(ThrottledFunc)()
}

// Creates a rate-limited function which only executes the action if under the rate limit
func InitThrottledFunc(action func(), duration time.Duration) ThrottledFunc {
	limit := rate.Every(duration)
	limiter := rate.NewLimiter(limit, 1)

	return func() {
		// Rate limited, just return
		if !limiter.Allow() {
			return
		}

		action()
	}
}
