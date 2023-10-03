package sampling

import (
	"context"
	"github.com/aws/smithy-go/ptr"
	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/store"
	log "github.com/sirupsen/logrus"
	"hash/fnv"
	"math/rand"
)

func isTraceIngestedBySample(ctx context.Context, key string, rate float64) bool {
	// TODO(vkorolik) benchmark perf
	if rate >= 1 {
		return true
	}

	if key == "" {
		key = uuid.New().String()
	}

	h := fnv.New32a()
	if _, err := h.Write([]byte(key)); err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to calculate hash")
		return true
	}
	r := rand.New(rand.NewSource(int64(h.Sum32())))
	return r.Float64() < rate
}

func IsTraceIngestedBySample(ctx context.Context, store *store.Store, trace *clickhouse.TraceRow) bool {
	projectID := int(trace.ProjectId)
	settings, err := store.GetProjectFilterSettings(ctx, projectID)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get project filter settings")
		return true
	}

	return isTraceIngestedBySample(ctx, trace.TraceId, settings.TraceSamplingRate)
}

func IsTraceIngestedByFilter(ctx context.Context, store *store.Store, trace *clickhouse.TraceRow) bool {
	// TODO(vkorolik) implement
	return true
}

func IsLogIngestedBySample(ctx context.Context, store *store.Store, logRow *clickhouse.LogRow) bool {
	projectID := int(logRow.ProjectId)
	settings, err := store.GetProjectFilterSettings(ctx, projectID)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get project filter settings")
		return true
	}

	return isTraceIngestedBySample(ctx, logRow.UUID, settings.LogSamplingRate)
}

func IsLogIngestedByFilter(ctx context.Context, store *store.Store, trace *clickhouse.LogRow) bool {
	// TODO(vkorolik) implement
	return true
}

func IsErrorIngestedBySample(ctx context.Context, store *store.Store, errorObject *model.BackendErrorObjectInput) bool {
	if errorObject.SessionSecureID == nil {
		return true
	}

	session, err := store.GetSessionFromSecureID(ctx, *errorObject.SessionSecureID)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get session")
		return true
	}

	settings, err := store.GetProjectFilterSettings(ctx, session.ProjectID)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get project filter settings")
		return true
	}

	id := ptr.ToString(errorObject.RequestID)
	if id == "" {
		id = ptr.ToString(errorObject.TraceID)
	}
	if id == "" {
		id = ptr.ToString(errorObject.SpanID)
	}

	return isTraceIngestedBySample(ctx, id, settings.LogSamplingRate)
}

func IsErrorIngestedByFilter(ctx context.Context, store *store.Store, errorObject *model.BackendErrorObjectInput) bool {
	// TODO(vkorolik) implement
	return true
}
