package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/DmitriyVTitov/size"
	"github.com/highlight-run/highlight/backend/hlog"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	generated1 "github.com/highlight-run/highlight/backend/public-graph/graph/generated"
	customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

func (r *mutationResolver) InitializeSession(ctx context.Context, organizationVerboseID string, enableStrictPrivacy bool, enableRecordingNetworkContents bool, clientVersion string, firstloadVersion string, clientConfig string, environment string, appVersion *string, fingerprint string, sessionSecureID *string, clientID *string) (*model.Session, error) {
	acceptLanguageString := ctx.Value(model.ContextKeys.AcceptLanguage).(string)
	userAgentString := ctx.Value(model.ContextKeys.UserAgent).(string)
	ip := ctx.Value(model.ContextKeys.IP).(string)

	querySessionSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.initializeSessionMinimal")
	querySessionSpan.SetTag("projectVerboseID", organizationVerboseID)
	session, err := InitializeSessionMinimal(ctx, r, organizationVerboseID, enableStrictPrivacy, enableRecordingNetworkContents, clientVersion, firstloadVersion, clientConfig, environment, appVersion, fingerprint, userAgentString, acceptLanguageString, ip, sessionSecureID, clientID)
	querySessionSpan.Finish()

	projectID := session.ProjectID
	hlog.Incr("gql.initializeSession.count", []string{fmt.Sprintf("success:%t", err == nil), fmt.Sprintf("project_id:%d", projectID)}, 1)

	if err != nil {
		log.Error(err)
		if !util.IsDevEnv() {
			specifiedSecureID := ""
			if sessionSecureID != nil {
				specifiedSecureID = *sessionSecureID
			}
			msg := slack.WebhookMessage{Text: fmt.
				Sprintf("Error in InitializeSession: %q\nOccurred for project: {%d, %q}\nSecure ID: %s\nIs on-prem: %q", err, projectID, organizationVerboseID, specifiedSecureID, os.Getenv("REACT_APP_ONPREM"))}
			_ = slack.PostWebhook(os.Getenv("SLACK_INITIALIZED_SESSION_FAILED_WEB_HOOK"), &msg)
		}
	} else {
		err = r.ProducerQueue.Submit(&kafkaqueue.Message{
			Type: kafkaqueue.InitializeSession,
			InitializeSession: &kafkaqueue.InitializeSessionArgs{
				SessionID: session.ID,
				IP:        ip,
			}}, strconv.Itoa(session.ID))
	}

	return session, err
}

func (r *mutationResolver) IdentifySession(ctx context.Context, sessionID int, userIdentifier string, userObject interface{}) (*int, error) {
	err := r.ProducerQueue.Submit(&kafkaqueue.Message{
		Type: kafkaqueue.IdentifySession,
		IdentifySession: &kafkaqueue.IdentifySessionArgs{
			SessionID:      sessionID,
			UserIdentifier: userIdentifier,
			UserObject:     userObject,
		},
	}, strconv.Itoa(sessionID))
	return &sessionID, err
}

func (r *mutationResolver) AddTrackProperties(ctx context.Context, sessionID int, propertiesObject interface{}) (*int, error) {
	err := r.ProducerQueue.Submit(&kafkaqueue.Message{
		Type: kafkaqueue.AddTrackProperties,
		AddTrackProperties: &kafkaqueue.AddTrackPropertiesArgs{
			SessionID:        sessionID,
			PropertiesObject: propertiesObject,
		},
	}, strconv.Itoa(sessionID))
	return &sessionID, err
}

func (r *mutationResolver) AddSessionProperties(ctx context.Context, sessionID int, propertiesObject interface{}) (*int, error) {
	err := r.ProducerQueue.Submit(&kafkaqueue.Message{
		Type: kafkaqueue.AddSessionProperties,
		AddSessionProperties: &kafkaqueue.AddSessionPropertiesArgs{
			SessionID:        sessionID,
			PropertiesObject: propertiesObject,
		},
	}, strconv.Itoa(sessionID))
	return &sessionID, err
}

func (r *mutationResolver) PushPayload(ctx context.Context, sessionID int, events customModels.ReplayEventsInput, messages string, resources string, errors []*customModels.ErrorObjectInput, isBeacon *bool, hasSessionUnloaded *bool, highlightLogs *string) (int, error) {
	sessionObj := &model.Session{}
	if err := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&sessionObj).Error; err != nil {
		// No return because I don't want to change existing behavior - can handle the error the usual way after worker reads from Kafka
		log.Error(e.Wrapf(err, "PushPayload couldn't find session with ID %d", sessionID))
	} else if sessionObj.ProjectID == 1074 && sessionID%100 != 0 { // Ingest 1% of Solitaired payloads
		// Drop solitaired payloads because they are causing ingestion issues
		return size.Of(events), nil
	}
	err := r.ProducerQueue.Submit(&kafkaqueue.Message{
		Type: kafkaqueue.PushPayload,
		PushPayload: &kafkaqueue.PushPayloadArgs{
			SessionID:          sessionID,
			Events:             events,
			Messages:           messages,
			Resources:          resources,
			Errors:             errors,
			IsBeacon:           isBeacon,
			HasSessionUnloaded: hasSessionUnloaded,
			HighlightLogs:      highlightLogs,
		}}, strconv.Itoa(sessionID))
	return size.Of(events), err
}

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
			}}, strconv.Itoa(session.ID))
		if err != nil {
			log.Error(e.Wrapf(err, "failed to send kafka message for push backend payload %s", backendError.SessionSecureID))
			continue
		}
	}
	return nil, nil
}

func (r *mutationResolver) PushMetrics(ctx context.Context, metrics []*customModels.MetricInput) (int, error) {
	return r.SubmitMetricsMessage(ctx, metrics)
}

func (r *mutationResolver) MarkBackendSetup(ctx context.Context, sessionSecureID string) (int, error) {
	session := &model.Session{}
	if err := r.DB.Model(&model.Session{}).Where("secure_id = ?", sessionSecureID).First(&session).Error; err != nil {
		return -1, err
	}
	err := r.ProducerQueue.Submit(&kafkaqueue.Message{
		Type: kafkaqueue.MarkBackendSetup,
		MarkBackendSetup: &kafkaqueue.MarkBackendSetupArgs{
			ProjectID: session.ProjectID,
		}}, strconv.Itoa(session.ID))
	return session.ProjectID, err
}

func (r *mutationResolver) AddSessionFeedback(ctx context.Context, sessionID int, userName *string, userEmail *string, verbatim string, timestamp time.Time) (int, error) {
	metadata := make(map[string]interface{})

	if userName != nil {
		metadata["name"] = *userName
	}
	if userEmail != nil {
		metadata["email"] = *userEmail
	}
	metadata["timestamp"] = timestamp

	session := &model.Session{}
	if err := r.DB.Select("project_id", "environment", "id", "secure_id").Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session).Error; err != nil {
		return -1, e.Wrap(err, "error querying session by sessionID for adding session feedback")
	}

	feedbackComment := &model.SessionComment{SessionId: sessionID, Text: verbatim, Metadata: metadata, Type: model.SessionCommentTypes.FEEDBACK, ProjectID: session.ProjectID, SessionSecureId: session.SecureID}
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
				WithFields(log.Fields{"project_id": session.ProjectID, "session_id": sessionID, "comment_id": feedbackComment.ID}).
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

func (r *queryResolver) Ignore(ctx context.Context, id int) (interface{}, error) {
	return nil, nil
}

// Mutation returns generated1.MutationResolver implementation.
func (r *Resolver) Mutation() generated1.MutationResolver { return &mutationResolver{r} }

// Query returns generated1.QueryResolver implementation.
func (r *Resolver) Query() generated1.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
