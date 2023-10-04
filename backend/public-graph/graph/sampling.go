package graph

import (
	"context"
	"encoding/json"
	"github.com/aws/smithy-go/ptr"
	"github.com/google/uuid"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	modelInputs "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/queryparser"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"hash/fnv"
	"math/rand"
	"regexp"
)

func (r *Resolver) getSettings(ctx context.Context, projectID int, sessionSecureID *string) (*model.ProjectFilterSettings, int, error) {
	if projectID == 0 {
		if sessionSecureID == nil {
			return nil, projectID, e.New("no project nor session secure id provided for sampling settings")
		}

		session, err := r.Store.GetSessionFromSecureID(ctx, *sessionSecureID)
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to get session")
			return nil, projectID, err
		}

		projectID = session.ProjectID
	}
	settings, err := r.Store.GetProjectFilterSettings(ctx, projectID)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get project filter settings")
		return nil, projectID, err
	}

	return settings, projectID, nil
}

func (r *Resolver) IsTraceIngestedBySample(ctx context.Context, trace *clickhouse.TraceRow) bool {
	settings, _, err := r.getSettings(ctx, int(trace.ProjectId), nil)
	if err != nil {
		return true
	}

	return isIngestedBySample(ctx, trace.TraceId, settings.TraceSamplingRate)
}

func (r *Resolver) IsTraceIngestedByFilter(ctx context.Context, trace *clickhouse.TraceRow) bool {
	settings, _, err := r.getSettings(ctx, int(trace.ProjectId), nil)
	if err != nil {
		return true
	}

	if settings.TraceExclusionQuery == nil {
		return true
	}

	filters := queryparser.Parse(*settings.TraceExclusionQuery)
	return !clickhouse.TraceMatchesQuery(trace, &filters)
}

func (r *Resolver) IsLogIngestedBySample(ctx context.Context, logRow *clickhouse.LogRow) bool {
	settings, _, err := r.getSettings(ctx, int(logRow.ProjectId), nil)
	if err != nil {
		return true
	}

	return isIngestedBySample(ctx, logRow.UUID, settings.LogSamplingRate)
}

func (r *Resolver) IsLogIngestedByFilter(ctx context.Context, logRow *clickhouse.LogRow) bool {
	settings, _, err := r.getSettings(ctx, int(logRow.ProjectId), nil)
	if err != nil {
		return true
	}

	if settings.LogExclusionQuery == nil {
		return true
	}

	filters := queryparser.Parse(*settings.LogExclusionQuery)
	return !clickhouse.LogMatchesQuery(logRow, &filters)
}

func (r *Resolver) IsErrorIngestedBySample(ctx context.Context, projectID int, errorObject *modelInputs.BackendErrorObjectInput) bool {
	settings, _, err := r.getSettings(ctx, projectID, errorObject.SessionSecureID)
	if err != nil {
		return true
	}

	id := ptr.ToString(errorObject.RequestID)
	if id == "" {
		id = ptr.ToString(errorObject.TraceID)
	}
	if id == "" {
		id = ptr.ToString(errorObject.SpanID)
	}

	return isIngestedBySample(ctx, id, settings.LogSamplingRate)
}

func (r *Resolver) IsErrorIngestedByFilter(ctx context.Context, projectID int, errorObject *modelInputs.BackendErrorObjectInput) bool {
	settings, projectID, err := r.getSettings(ctx, projectID, errorObject.SessionSecureID)
	if err != nil {
		return true
	}

	project, err := r.Store.GetProject(ctx, projectID)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get project")
	} else {
		if r.isExcludedError(ctx, project.ErrorFilters, errorObject.Event, projectID) {
			return false
		}
	}

	if settings.ErrorExclusionQuery == nil {
		return true
	}

	filters := queryparser.Parse(*settings.ErrorExclusionQuery)
	return !clickhouse.ErrorMatchesQuery(errorObject, &filters)
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
	r := rand.New(rand.NewSource(int64(h.Sum32())))
	return r.Float64() <= rate
}

func (r *Resolver) isExcludedError(ctx context.Context, errorFilters []string, errorEvent string, projectID int) bool {
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

func (r *Resolver) isSessionExcluded(ctx context.Context, s *model.Session, sessionHasErrors bool) (bool, *privateModel.SessionExcludedReason) {
	var excluded bool
	var reason privateModel.SessionExcludedReason

	var project model.Project
	if err := r.DB.Raw("SELECT * FROM projects WHERE id = ?;", s.ProjectID).Scan(&project).Error; err != nil {
		log.WithContext(ctx).WithFields(log.Fields{"session_id": s.ID, "project_id": s.ProjectID, "identifier": s.Identifier}).Errorf("error fetching project for session: %v", err)
		return false, nil
	}

	if r.isSessionUserExcluded(ctx, s, project) {
		excluded = true
		reason = privateModel.SessionExcludedReasonIgnoredUser
	}

	if r.isSessionExcludedForNoError(ctx, s, &project, sessionHasErrors) {
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

	if r.isSessionExcludedByFilter(ctx, s) {
		excluded = true
		reason = privateModel.SessionExcludedReasonExclusionFilter
	}

	return excluded, &reason
}

func (r *Resolver) isSessionExcludedBySample(ctx context.Context, session *model.Session) bool {
	settings, err := r.Store.GetProjectFilterSettings(ctx, session.ProjectID)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get project filter settings")
		return true
	}

	return !isIngestedBySample(ctx, session.SecureID, settings.LogSamplingRate)
}

func (r *Resolver) isSessionExcludedByFilter(ctx context.Context, session *model.Session) bool {
	// TODO(vkorolik) implement
	return false
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

func (r *Resolver) isSessionUserExcluded(ctx context.Context, s *model.Session, project model.Project) bool {
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
