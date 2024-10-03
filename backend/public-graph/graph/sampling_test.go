package graph

import (
	"context"
	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	model2 "github.com/highlight-run/highlight/backend/public-graph/graph/model"
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

func Test_isIngestedBySample_FindRare(t *testing.T) {
	ctx := context.TODO()
	var rare []string
	for i := 0; i < 10*100_000; i++ {
		key := uuid.New().String()
		ingested := isIngestedBySample(ctx, key, 1./100_000)
		if ingested {
			t.Logf("ingested key %s", key)
			rare = append(rare, key)
		}
	}
	assert.Greater(t, len(rare), 0)
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

func Fuzz_isIngestedByExtremeSamples(f *testing.F) {
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

	err := resolver.Redis.FlushDB(ctx)
	if err != nil {
		t.Error(err)
	}

	workspace := model.Workspace{}
	resolver.DB.Create(&workspace)

	settings := model.AllWorkspaceSettings{WorkspaceID: workspace.ID, EnableIngestSampling: true}
	resolver.DB.Create(&settings)

	project := model.Project{WorkspaceID: workspace.ID}
	resolver.DB.Create(&project)

	_, err = resolver.Store.UpdateProjectFilterSettings(ctx, project.ID, store.UpdateProjectFilterSettingsParams{
		Sampling: &modelInputs.SamplingInput{
			SessionSamplingRate:    pointy.Float64(1. / 100_000),
			SessionMinuteRateLimit: pointy.Int64(2),
			SessionExclusionQuery:  pointy.String("environment:prod"),
		},
	})
	if err != nil {
		t.Error(err)
	}

	// key is always included by sampling with the given rate (1 / 100_000)
	rare := "53b0c406-c655-407a-817f-edefcddc7428"
	when := time.Now()
	s := model.Session{ProjectID: project.ID, SecureID: rare, Model: model.Model{CreatedAt: when}}
	excluded, reason := resolver.IsSessionExcluded(ctx, &s, false)
	assert.False(t, excluded)
	assert.Equal(t, "", reason.String())
	s = model.Session{ProjectID: project.ID, Identifier: rare, Model: model.Model{CreatedAt: when}}
	excluded, reason = resolver.IsSessionExcluded(ctx, &s, false)
	assert.False(t, excluded)
	assert.Equal(t, "", reason.String())
	for i := 0; i < 100; i++ {
		for _, hasErrors := range []bool{false, true} {
			s := model.Session{ProjectID: project.ID, SecureID: rare, Identifier: rare, Model: model.Model{CreatedAt: when}}
			excluded, reason := resolver.IsSessionExcluded(ctx, &s, hasErrors)
			assert.True(t, excluded)
			assert.Equal(t, modelInputs.SessionExcludedReasonRateLimitMinute, *reason)
		}
	}
}

func Test_isExcludedError(t *testing.T) {
	ctx := context.TODO()
	p1 := &model.Project{ErrorFilters: []string{""}}
	p2 := &model.Project{ErrorFilters: []string{".*a+.*"}}
	p3 := &model.Project{ErrorFilters: []string{"("}}
	resolver.DB.Create(p1)
	resolver.DB.Create(p2)
	resolver.DB.Create(p3)
	if err := resolver.Redis.FlushDB(context.TODO()); err != nil {
		t.Error(err)
	}
	assert.True(t, resolver.IsErrorIngestedByFilter(ctx, p1.ID, &model2.BackendErrorObjectInput{Event: ""}))
	assert.False(t, resolver.IsErrorIngestedByFilter(ctx, p1.ID, &model2.BackendErrorObjectInput{Event: "[{}]"}))
	assert.False(t, resolver.IsErrorIngestedByFilter(ctx, p2.ID, &model2.BackendErrorObjectInput{Event: "foo bar baz"}))
	assert.True(t, resolver.IsErrorIngestedByFilter(ctx, p3.ID, &model2.BackendErrorObjectInput{Event: "foo bar baz"}))
}
