package graph

import (
	"context"
	"encoding/json"
	"fmt"
	"hash/fnv"
	"regexp"
	"time"

	"github.com/aws/smithy-go/ptr"
	"github.com/google/uuid"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/parser"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	modelInputs "github.com/highlight-run/highlight/backend/public-graph/graph/model"
)

func (r *Resolver) IsTraceIngested(ctx context.Context, trace *clickhouse.TraceRow) bool {
	if !r.IsTraceIngestedByFilter(ctx, trace) {
		return false
	}
	if !r.IsTraceIngestedBySample(ctx, trace) {
		return false
	}
	if !r.IsTraceIngestedByRateLimit(ctx, trace) {
		return false
	}
	return true
}

func (r *Resolver) IsTraceIngestedBySample(ctx context.Context, trace *clickhouse.TraceRow) bool {
	return r.isItemIngestedBySample(ctx, privateModel.ProductTypeTraces, int(trace.ProjectId), trace.TraceId)
}

func (r *Resolver) IsTraceIngestedByRateLimit(ctx context.Context, trace *clickhouse.TraceRow) bool {
	return r.isItemIngestedByRate(ctx, trace.Timestamp, privateModel.ProductTypeTraces, int(trace.ProjectId))
}

func (r *Resolver) IsTraceIngestedByFilter(ctx context.Context, trace *clickhouse.TraceRow) bool {
	return r.isItemIngestedByFilter(ctx, privateModel.ProductTypeTraces, int(trace.ProjectId), trace)
}

func (r *Resolver) IsLogIngested(ctx context.Context, logRow *clickhouse.LogRow) bool {
	if !r.IsLogIngestedBySample(ctx, logRow) {
		return false
	}
	if !r.IsLogIngestedByFilter(ctx, logRow) {
		return false
	}
	if !r.IsLogIngestedByRateLimit(ctx, logRow) {
		return false
	}
	return true
}

func (r *Resolver) IsLogIngestedBySample(ctx context.Context, logRow *clickhouse.LogRow) bool {
	return r.isItemIngestedBySample(ctx, privateModel.ProductTypeLogs, int(logRow.ProjectId), logRow.UUID)
}

func (r *Resolver) IsLogIngestedByRateLimit(ctx context.Context, logRow *clickhouse.LogRow) bool {
	return r.isItemIngestedByRate(ctx, logRow.Timestamp, privateModel.ProductTypeLogs, int(logRow.ProjectId))
}

func (r *Resolver) IsLogIngestedByFilter(ctx context.Context, logRow *clickhouse.LogRow) bool {
	return r.isItemIngestedByFilter(ctx, privateModel.ProductTypeLogs, int(logRow.ProjectId), logRow)
}

func (r *Resolver) IsFrontendErrorIngested(ctx context.Context, projectID int, session *model.Session, frontendError *modelInputs.ErrorObjectInput) bool {
	stack, _ := json.Marshal(frontendError.StackTrace)
	errorObject := &modelInputs.BackendErrorObjectInput{
		Environment:     session.Environment,
		Event:           frontendError.Event,
		Payload:         frontendError.Payload,
		SessionSecureID: &session.SecureID,
		Service: &modelInputs.ServiceInput{
			Name:    session.ServiceName,
			Version: ptr.ToString(session.AppVersion),
		},
		Source:     frontendError.Source,
		StackTrace: string(stack),
		Timestamp:  frontendError.Timestamp,
		Type:       frontendError.Type,
		URL:        frontendError.URL,
	}
	if !r.IsErrorIngestedBySample(ctx, projectID, errorObject) {
		return false
	}
	if !r.IsErrorIngestedByFilter(ctx, projectID, errorObject) {
		return false
	}
	if !r.IsErrorIngestedByRateLimit(ctx, projectID, errorObject) {
		return false
	}
	return true
}

func (r *Resolver) IsErrorIngested(ctx context.Context, projectID int, errorObject *modelInputs.BackendErrorObjectInput) bool {
	if !r.IsErrorIngestedBySample(ctx, projectID, errorObject) {
		return false
	}
	if !r.IsErrorIngestedByFilter(ctx, projectID, errorObject) {
		return false
	}
	if !r.IsErrorIngestedByRateLimit(ctx, projectID, errorObject) {
		return false
	}
	return true
}

func (r *Resolver) IsErrorIngestedBySample(ctx context.Context, projectID int, errorObject *modelInputs.BackendErrorObjectInput) bool {
	settings, err := r.getSettings(ctx, projectID, errorObject.SessionSecureID)
	if err != nil {
		return true
	}

	return r.isItemIngestedBySample(ctx, privateModel.ProductTypeErrors, settings.ProjectID, getErrorObjectID(errorObject))
}

func (r *Resolver) IsErrorIngestedByRateLimit(ctx context.Context, projectID int, errorObject *modelInputs.BackendErrorObjectInput) bool {
	settings, err := r.getSettings(ctx, projectID, errorObject.SessionSecureID)
	if err != nil {
		return true
	}

	return r.isItemIngestedByRate(ctx, errorObject.Timestamp, privateModel.ProductTypeErrors, settings.ProjectID)
}

func (r *Resolver) IsErrorIngestedByFilter(ctx context.Context, projectID int, errorObject *modelInputs.BackendErrorObjectInput) bool {
	settings, err := r.getSettings(ctx, projectID, errorObject.SessionSecureID)
	if err != nil {
		return true
	}

	if project, err := r.Store.GetProject(ctx, settings.ProjectID); err == nil {
		if r.isExcludedError(ctx, projectID, project.ErrorFilters, errorObject.Event) {
			return false
		}
	}

	return r.isItemIngestedByFilter(ctx, privateModel.ProductTypeErrors, settings.ProjectID, errorObject)
}

func (r *Resolver) IsSessionExcluded(ctx context.Context, s *model.Session, sessionHasErrors bool) (bool, *privateModel.SessionExcludedReason) {
	var excluded bool
	var reason privateModel.SessionExcludedReason

	project, err := r.Store.GetProject(ctx, s.ProjectID)
	if err != nil {
		log.WithContext(ctx).WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID, "identifier": s.Identifier}).Errorf("error fetching project for session: %v", err)
		return false, nil
	}

	if r.isSessionUserExcluded(ctx, s, project) {
		excluded = true
		reason = privateModel.SessionExcludedReasonIgnoredUser
	}

	if r.isSessionExcludedForNoError(ctx, s, project, sessionHasErrors) {
		excluded = true
		reason = privateModel.SessionExcludedReasonNoError
	}

	if r.isSessionExcludedForNoUserEvents(ctx, s) {
		excluded = true
		reason = privateModel.SessionExcludedReasonNoUserEvents
	}

	if r.isSessionExcludedBySample(ctx, s) {
		excluded = true
		reason = privateModel.SessionExcludedReasonSampled
	}

	if r.IsSessionExcludedByFilter(ctx, s) {
		excluded = true
		reason = privateModel.SessionExcludedReasonExclusionFilter
	}

	if r.isSessionExcludedByRateLimit(ctx, s) {
		excluded = true
		reason = privateModel.SessionExcludedReasonRateLimitMinute
	}

	return excluded, &reason
}

func (r *Resolver) isSessionExcludedBySample(ctx context.Context, session *model.Session) bool {
	samplingKey := session.Identifier
	if samplingKey == "" {
		samplingKey = session.SecureID
	}
	return !r.isItemIngestedBySample(ctx, privateModel.ProductTypeSessions, session.ProjectID, samplingKey)
}

func (r *Resolver) isSessionExcludedByRateLimit(ctx context.Context, session *model.Session) bool {
	return !r.isItemIngestedByRate(ctx, session.CreatedAt, privateModel.ProductTypeSessions, session.ProjectID)
}

func (r *Resolver) IsSessionExcludedByFilter(ctx context.Context, session *model.Session) bool {
	return !r.isItemIngestedByFilter(ctx, privateModel.ProductTypeSessions, session.ProjectID, session)
}

func (r *Resolver) isSessionExcludedForNoUserEvents(ctx context.Context, s *model.Session) bool {
	return s.LastUserInteractionTime.Unix() == 0
}

func (r *Resolver) isSessionExcludedForNoError(ctx context.Context, s *model.Session, project *model.Project, sessionHasErrors bool) bool {
	projectFilterSettings, _ := r.Store.GetProjectFilterSettings(ctx, project.ID)

	if projectFilterSettings.FilterSessionsWithoutError {
		return !sessionHasErrors
	}

	return false
}

func (r *Resolver) isSessionUserExcluded(ctx context.Context, s *model.Session, project *model.Project) bool {
	if project.ExcludedUsers == nil {
		return false
	}
	var email string
	if s.UserProperties != "" {
		encodedProperties := []byte(s.UserProperties)
		decodedProperties := map[string]string{}
		err := json.Unmarshal(encodedProperties, &decodedProperties)
		if err != nil {
			log.WithContext(ctx).WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID}).Errorf("Could not unmarshal user properties: %s, error: %v", s.UserProperties, err)
			return false
		}
		email = decodedProperties["email"]
	}
	for _, value := range []string{s.Identifier, email} {
		if value == "" {
			continue
		}
		for _, excludedExpr := range project.ExcludedUsers {
			matched, err := regexp.MatchString(excludedExpr, value)
			if err != nil {
				log.WithContext(ctx).WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID}).Errorf("error running regexp for excluded users: %s with value: %s, error: %v", excludedExpr, value, err.Error())
				return false
			} else if matched {
				return true
			}
		}
	}
	return false
}

func (r *Resolver) isItemIngestedBySample(ctx context.Context, product privateModel.ProductType, projectID int, key string) bool {
	settings, err := r.getSettings(ctx, projectID, nil)
	if err != nil {
		return true
	}

	rate := func() float64 {
		switch product {
		case privateModel.ProductTypeSessions:
			return settings.SessionSamplingRate
		case privateModel.ProductTypeErrors:
			return settings.ErrorSamplingRate
		case privateModel.ProductTypeLogs:
			return settings.LogSamplingRate
		case privateModel.ProductTypeTraces:
			return settings.TraceSamplingRate
		}
		return 1.
	}()
	ingested := isIngestedBySample(ctx, key, rate)
	return ingested
}

func (r *Resolver) isItemIngestedByRate(ctx context.Context, when time.Time, product privateModel.ProductType, projectID int) bool {
	settings, err := r.getSettings(ctx, projectID, nil)
	if err != nil {
		return true
	}

	max := func() *int64 {
		switch product {
		case privateModel.ProductTypeSessions:
			return settings.SessionMinuteRateLimit
		case privateModel.ProductTypeErrors:
			return settings.ErrorMinuteRateLimit
		case privateModel.ProductTypeLogs:
			return settings.LogMinuteRateLimit
		case privateModel.ProductTypeTraces:
			return settings.TraceMinuteRateLimit
		}
		return nil
	}()
	if max == nil {
		return true
	}
	ingested := r.isIngestedByRateLimit(ctx, fmt.Sprintf("sampling-%d-%s", projectID, product.String()), *max, when.Minute())
	return ingested
}

func (r *Resolver) isItemIngestedByFilter(ctx context.Context, product privateModel.ProductType, projectID int, object interface{}) bool {
	settings, err := r.getSettings(ctx, projectID, nil)
	if err != nil {
		return true
	}

	query := func() string {
		switch product {
		case privateModel.ProductTypeSessions:
			return ptr.ToString(settings.SessionExclusionQuery)
		case privateModel.ProductTypeErrors:
			return ptr.ToString(settings.ErrorExclusionQuery)
		case privateModel.ProductTypeLogs:
			return ptr.ToString(settings.LogExclusionQuery)
		case privateModel.ProductTypeTraces:
			return ptr.ToString(settings.TraceExclusionQuery)
		}
		return ""
	}()
	if query == "" {
		return true
	}

	excluded := func() bool {
		switch product {
		case privateModel.ProductTypeSessions:
			filters := parser.Parse(query, clickhouse.SessionsTableConfig)
			return clickhouse.SessionMatchesQuery(object.(*model.Session), filters)
		case privateModel.ProductTypeErrors:
			filters := parser.Parse(query, clickhouse.BackendErrorObjectInputConfig)
			return clickhouse.ErrorMatchesQuery(object.(*modelInputs.BackendErrorObjectInput), filters)
		case privateModel.ProductTypeLogs:
			filters := parser.Parse(query, clickhouse.LogsTableConfig)
			return clickhouse.LogMatchesQuery(object.(*clickhouse.LogRow), filters)
		case privateModel.ProductTypeTraces:
			filters := parser.Parse(query, clickhouse.TracesTableNoDefaultConfig)
			return clickhouse.TraceMatchesQuery(object.(*clickhouse.TraceRow), filters)
		}
		return false
	}()
	return !excluded
}

func isIngestedBySample(ctx context.Context, key string, rate float64) bool {
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
	sum := h.Sum32()
	threshold := uint32(rate * float64(1<<32-1))
	return sum < threshold
}

// isIngestedByRateLimit limits ingestion for a key at a max items per minute
func (r *Resolver) isIngestedByRateLimit(ctx context.Context, key string, max int64, minute int) bool {
	key = fmt.Sprintf("%s-%d", key, minute)

	// based on https://redis.com/glossary/rate-limiting/
	count, _ := r.Redis.Client.Get(ctx, key).Int64()

	if count >= max {
		return false
	}

	r.Redis.Client.Incr(ctx, key)
	r.Redis.Client.Expire(ctx, key, 59*time.Second)

	return true
}

func (r *Resolver) getSettings(ctx context.Context, projectID int, sessionSecureID *string) (*model.ProjectFilterSettings, error) {
	if projectID == 0 {
		if sessionSecureID == nil {
			return nil, e.New("no project nor session secure id provided for sampling settings")
		}

		session, err := r.Store.GetSessionFromSecureID(ctx, *sessionSecureID)
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to get session")
			return nil, err
		}

		projectID = session.ProjectID
	}
	settings, err := r.Store.GetProjectFilterSettings(ctx, projectID)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get project filter settings")
		return nil, err
	}

	return settings, nil
}

func (r *Resolver) isExcludedError(ctx context.Context, projectID int, errorFilters []string, errorEvent string) bool {
	if errorEvent == "[{}]" {
		log.WithContext(ctx).
			WithField("project_id", projectID).
			Warn("ignoring empty error")
		return true
	}

	if cfg, err := r.Store.GetSystemConfiguration(ctx); err == nil {
		errorFilters = append(errorFilters, cfg.ErrorFilters...)
	}

	// Filter out by project.ErrorFilters, aka regexp filters
	var err error
	matchedRegexp := false
	for _, errorFilter := range errorFilters {
		if errorFilter == "" {
			continue
		}
		matchedRegexp, err = regexp.MatchString(errorFilter, errorEvent)
		if err != nil {
			log.WithContext(ctx).
				WithField("project_id", projectID).
				WithField("regex", errorFilter).
				WithError(err).
				Error("invalid regex: failed to parse backend error filter")
			continue
		}

		if matchedRegexp {
			return true
		}
	}
	return false
}

func getErrorObjectID(errorObject *modelInputs.BackendErrorObjectInput) string {
	id := ptr.ToString(errorObject.RequestID)
	if id == "" {
		id = ptr.ToString(errorObject.TraceID)
	}
	if id == "" {
		id = ptr.ToString(errorObject.SpanID)
	}
	return id
}
