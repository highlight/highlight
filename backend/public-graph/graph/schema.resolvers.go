package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"time"

	"github.com/DmitriyVTitov/size"
	"github.com/highlight-run/highlight/backend/hlog"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	generated1 "github.com/highlight-run/highlight/backend/public-graph/graph/generated"
	customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

// InitializeSession is the resolver for the initializeSession field.
func (r *mutationResolver) InitializeSession(ctx context.Context, sessionSecureID string, organizationVerboseID string, enableStrictPrivacy bool, enableRecordingNetworkContents bool, clientVersion string, firstloadVersion string, clientConfig string, environment string, appVersion *string, fingerprint string, clientID string) (*customModels.InitializeSessionResponse, error) {
	acceptLanguageString := ctx.Value(model.ContextKeys.AcceptLanguage).(string)
	userAgentString := ctx.Value(model.ContextKeys.UserAgent).(string)
	ip := ctx.Value(model.ContextKeys.IP).(string)

	projectID, err := model.FromVerboseID(organizationVerboseID)
	if err != nil {
		log.Errorf("An unsupported verboseID was used: %s, %s", organizationVerboseID, clientConfig)
	}
	hlog.Incr("gql.initializeSession.count", []string{fmt.Sprintf("success:%t", err == nil), fmt.Sprintf("project_verbose_id:%q", organizationVerboseID), fmt.Sprintf("project_id:%d", projectID)}, 1)

	err = r.ProducerQueue.Submit(&kafkaqueue.Message{
		Type: kafkaqueue.InitializeSession,
		InitializeSession: &kafkaqueue.InitializeSessionArgs{
			SessionSecureID:                sessionSecureID,
			ProjectVerboseID:               organizationVerboseID,
			EnableStrictPrivacy:            enableStrictPrivacy,
			EnableRecordingNetworkContents: enableRecordingNetworkContents,
			ClientVersion:                  clientVersion,
			FirstloadVersion:               firstloadVersion,
			ClientConfig:                   clientConfig,
			Environment:                    environment,
			AppVersion:                     appVersion,
			Fingerprint:                    fingerprint,
			UserAgent:                      userAgentString,
			AcceptLanguage:                 acceptLanguageString,
			IP:                             ip,
			ClientID:                       clientID,
		},
	}, sessionSecureID)

	return &customModels.InitializeSessionResponse{
		SecureID:  sessionSecureID,
		ProjectID: projectID,
	}, err
}

// IdentifySession is the resolver for the identifySession field.
func (r *mutationResolver) IdentifySession(ctx context.Context, sessionSecureID string, userIdentifier string, userObject interface{}) (string, error) {
	err := r.ProducerQueue.Submit(&kafkaqueue.Message{
		Type: kafkaqueue.IdentifySession,
		IdentifySession: &kafkaqueue.IdentifySessionArgs{
			SessionSecureID: sessionSecureID,
			UserIdentifier:  userIdentifier,
			UserObject:      userObject,
		},
	}, sessionSecureID)
	return sessionSecureID, err
}

// AddTrackProperties is the resolver for the addTrackProperties field.
func (r *mutationResolver) AddTrackProperties(ctx context.Context, sessionSecureID string, propertiesObject interface{}) (string, error) {
	err := r.ProducerQueue.Submit(&kafkaqueue.Message{
		Type: kafkaqueue.AddTrackProperties,
		AddTrackProperties: &kafkaqueue.AddTrackPropertiesArgs{
			SessionSecureID:  sessionSecureID,
			PropertiesObject: propertiesObject,
		},
	}, sessionSecureID)
	return sessionSecureID, err
}

// AddSessionProperties is the resolver for the addSessionProperties field.
func (r *mutationResolver) AddSessionProperties(ctx context.Context, sessionSecureID string, propertiesObject interface{}) (string, error) {
	err := r.ProducerQueue.Submit(&kafkaqueue.Message{
		Type: kafkaqueue.AddSessionProperties,
		AddSessionProperties: &kafkaqueue.AddSessionPropertiesArgs{
			SessionSecureID:  sessionSecureID,
			PropertiesObject: propertiesObject,
		},
	}, sessionSecureID)
	return sessionSecureID, err
}

// PushPayload is the resolver for the pushPayload field.
func (r *mutationResolver) PushPayload(ctx context.Context, sessionSecureID string, events customModels.ReplayEventsInput, messages string, resources string, errors []*customModels.ErrorObjectInput, isBeacon *bool, hasSessionUnloaded *bool, highlightLogs *string, payloadID *int) (int, error) {
	sessionObj := &model.Session{}
	if err := r.DB.Select("project_id", "id").Where(&model.Session{SecureID: sessionSecureID}).First(&sessionObj).Error; err != nil {
		// No return because I don't want to change existing behavior - can handle the error the usual way after worker reads from Kafka
		log.Error(e.Wrapf(err, "PushPayload couldn't find session with secureID %s", sessionSecureID))
	}
	if sessionObj.ProjectID == 1074 && sessionObj.ID%10 != 0 { // Ingest 10% of Solitaired payloads
		// Drop solitaired payloads because they are causing ingestion issues
		return size.Of(events), nil
	}

	if payloadID == nil {
		payloadID = pointy.Int(0)
	}

	err := r.ProducerQueue.Submit(&kafkaqueue.Message{
		Type: kafkaqueue.PushPayload,
		PushPayload: &kafkaqueue.PushPayloadArgs{
			SessionSecureID:    sessionSecureID,
			Events:             events,
			Messages:           messages,
			Resources:          resources,
			Errors:             errors,
			IsBeacon:           isBeacon,
			HasSessionUnloaded: hasSessionUnloaded,
			HighlightLogs:      highlightLogs,
			PayloadID:          payloadID,
		}}, sessionSecureID)
	return size.Of(events), err
}

// PushBackendPayload is the resolver for the pushBackendPayload field.
func (r *mutationResolver) PushBackendPayload(ctx context.Context, errors []*customModels.BackendErrorObjectInput) (interface{}, error) {
	for _, backendError := range errors {
		session := &model.Session{}
		if err := r.DB.Model(&model.Session{}).Where("secure_id = ?", backendError.SessionSecureID).First(&session).Error; err != nil {
			log.Error(e.Wrapf(err, "unknown session for push backend payload %s", backendError.SessionSecureID))
			continue
		}
		err := r.ProducerQueue.Submit(&kafkaqueue.Message{
			Type: kafkaqueue.PushBackendPayload,
			PushBackendPayload: &kafkaqueue.PushBackendPayloadArgs{
				SessionSecureID: backendError.SessionSecureID,
				Errors:          errors,
			}}, backendError.SessionSecureID)
		if err != nil {
			log.Error(e.Wrapf(err, "failed to send kafka message for push backend payload %s", backendError.SessionSecureID))
			continue
		}
	}
	return nil, nil
}

// PushMetrics is the resolver for the pushMetrics field.
func (r *mutationResolver) PushMetrics(ctx context.Context, metrics []*customModels.MetricInput) (int, error) {
	return r.SubmitMetricsMessage(ctx, metrics)
}

// MarkBackendSetup is the resolver for the markBackendSetup field.
func (r *mutationResolver) MarkBackendSetup(ctx context.Context, sessionSecureID string) (int, error) {
	session := &model.Session{}
	if err := r.DB.Model(&model.Session{}).Where("secure_id = ?", sessionSecureID).First(&session).Error; err != nil {
		return -1, err
	}
	err := r.ProducerQueue.Submit(&kafkaqueue.Message{
		Type: kafkaqueue.MarkBackendSetup,
		MarkBackendSetup: &kafkaqueue.MarkBackendSetupArgs{
			ProjectID: session.ProjectID,
		}}, sessionSecureID)
	return session.ProjectID, err
}

// AddSessionFeedback is the resolver for the addSessionFeedback field.
func (r *mutationResolver) AddSessionFeedback(ctx context.Context, sessionSecureID string, userName *string, userEmail *string, verbatim string, timestamp time.Time) (int, error) {
	metadata := make(map[string]interface{})

	if userName != nil {
		metadata["name"] = *userName
	}
	if userEmail != nil {
		metadata["email"] = *userEmail
	}
	metadata["timestamp"] = timestamp

	session := &model.Session{}
	if err := r.DB.Select("project_id", "environment", "id", "secure_id").Where(&model.Session{SecureID: sessionSecureID}).First(&session).Error; err != nil {
		return -1, e.Wrap(err, "error querying session by sessionSecureID for adding session feedback")
	}

	feedbackComment := &model.SessionComment{SessionId: session.ID, Text: verbatim, Metadata: metadata, Type: model.SessionCommentTypes.FEEDBACK, ProjectID: session.ProjectID, SessionSecureId: session.SecureID}
	if err := r.DB.Create(feedbackComment).Error; err != nil {
		return -1, e.Wrap(err, "error creating session feedback")
	}

	r.AlertWorkerPool.SubmitRecover(func() {
		var sessionFeedbackAlert model.SessionAlert
		if err := r.DB.Raw(`
			SELECT *
			FROM session_alerts
			WHERE project_id = ?
				AND type = ?
				AND disabled = false
		`, session.ProjectID, model.AlertType.SESSION_FEEDBACK).Scan(&sessionFeedbackAlert).Error; err != nil {
			log.WithError(err).
				WithFields(log.Fields{"project_id": session.ProjectID, "secure_session_id": sessionSecureID, "comment_id": feedbackComment.ID}).
				Error(e.Wrapf(err, "error fetching %s alert", model.AlertType.SESSION_FEEDBACK))
			return
		}

		excludedEnvironments, err := sessionFeedbackAlert.GetExcludedEnvironments()
		if err != nil {
			log.Error(e.Wrapf(err, "error getting excluded environments from %s alert", model.AlertType.SESSION_FEEDBACK))
			return
		}
		for _, env := range excludedEnvironments {
			if env != nil && *env == session.Environment {
				return
			}
		}

		commentsCount := int64(-1)
		if sessionFeedbackAlert.ThresholdWindow == nil {
			t := 30
			sessionFeedbackAlert.ThresholdWindow = &t
		}
		if err := r.DB.Raw(`
			SELECT COUNT(*)
			FROM session_comments
			WHERE project_id = ?
				AND type = ?
				AND created_at > ?
		`, session.ProjectID, model.SessionCommentTypes.FEEDBACK,
			time.Now().Add(-time.Duration(*sessionFeedbackAlert.ThresholdWindow)*time.Minute)).
			Scan(&commentsCount).Error; err != nil {
			log.WithError(err).
				WithFields(log.Fields{"project_id": session.ProjectID, "session_id": session.ID, "session_secure_id": session.SecureID, "comment_id": feedbackComment.ID}).
				Error(e.Wrapf(err, "error fetching %s alert count", model.AlertType.SESSION_FEEDBACK))
			return
		}
		if commentsCount+1 < int64(sessionFeedbackAlert.CountThreshold) {
			return
		}

		var project model.Project
		if err := r.DB.Raw(`
			SELECT *
			FROM projects
			WHERE id = ?
		`, session.ProjectID).Scan(&project).Error; err != nil {
			log.WithError(err).
				WithFields(log.Fields{"project_id": session.ProjectID, "session_id": session.ID, "session_secure_id": session.SecureID, "comment_id": feedbackComment.ID}).
				Error(e.Wrapf(err, "error fetching %s alert", model.AlertType.SESSION_FEEDBACK))
			return
		}

		identifier := "Someone"
		if userName != nil {
			identifier = *userName
		} else if userEmail != nil {
			identifier = *userEmail
		}

		workspace, err := r.getWorkspace(project.WorkspaceID)
		if err != nil {
			log.WithError(err).
				WithFields(log.Fields{"project_id": session.ProjectID, "session_id": session.ID, "comment_id": feedbackComment.ID}).
				Error(e.Wrap(err, "error fetching workspace"))
		}

		sessionFeedbackAlert.SendAlerts(r.DB, r.MailClient, &model.SendSlackAlertInput{
			Workspace:       workspace,
			SessionSecureID: session.SecureID,
			UserIdentifier:  identifier,
			CommentID:       &feedbackComment.ID,
			CommentText:     feedbackComment.Text,
		})
	})

	return feedbackComment.ID, nil
}

// Ignore is the resolver for the ignore field.
func (r *queryResolver) Ignore(ctx context.Context, id int) (interface{}, error) {
	return nil, nil
}

// Mutation returns generated1.MutationResolver implementation.
func (r *Resolver) Mutation() generated1.MutationResolver { return &mutationResolver{r} }

// Query returns generated1.QueryResolver implementation.
func (r *Resolver) Query() generated1.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
