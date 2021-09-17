package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/highlight-run/highlight/backend/hlog"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/public-graph/graph/generated"
	customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
	"gorm.io/gorm"
)

func (r *mutationResolver) InitializeSession(ctx context.Context, organizationVerboseID string, enableStrictPrivacy bool, enableRecordingNetworkContents bool, clientVersion string, firstloadVersion string, clientConfig string, environment string, appVersion *string, fingerprint string) (*model.Session, error) {
	session, err := InitializeSessionImplementation(r, ctx, organizationVerboseID, enableStrictPrivacy, enableRecordingNetworkContents, firstloadVersion, clientVersion, clientConfig, environment, appVersion, fingerprint)
	hlog.Incr("gql.initializeSession.count", []string{fmt.Sprintf("success:%t", err == nil)}, 1)

	orgID := model.FromVerboseID(organizationVerboseID)
	if !util.IsDevEnv() && err != nil {
		msg := slack.WebhookMessage{Text: fmt.
			Sprintf("Error in InitializeSession: %q\nOccurred for organization: {%d, %q}\nIs on-prem: %q", err, orgID, organizationVerboseID, os.Getenv("REACT_APP_ONPREM"))}
		err := slack.PostWebhook(os.Getenv("SLACK_INITIALIZED_SESSION_FAILED_WEB_HOOK"), &msg)
		if err != nil {
			log.Error(e.Wrap(err, "failed to post webhook with error in InitializeSession"))
		}
	}

	return session, err
}

func (r *mutationResolver) IdentifySession(ctx context.Context, sessionID int, userIdentifier string, userObject interface{}) (*int, error) {
	obj, ok := userObject.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("error converting userObject interface type")
	}

	userProperties := map[string]string{
		"identifier": userIdentifier,
	}
	userObj := make(map[string]string)
	for k, v := range obj {
		userProperties[k] = fmt.Sprintf("%v", v)
		userObj[k] = fmt.Sprintf("%v", v)
	}
	if err := r.AppendProperties(sessionID, userProperties, PropertyType.USER); err != nil {
		log.Error(e.Wrap(err, "error adding set of properties to db"))
	}

	session := &model.Session{}
	if err := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session).Error; err != nil {
		return nil, e.Wrap(err, "error querying session by sessionID")
	}
	// set user properties to session in db
	if err := session.SetUserProperties(userObj); err != nil {
		return nil, e.Wrapf(err, "[org_id: %d] error appending user properties to session object {id: %d}", session.OrganizationID, sessionID)
	}

	// Check if there is a session created by this user.
	firstTime := &model.F
	if err := r.DB.Where(&model.Session{Identifier: userIdentifier, OrganizationID: session.OrganizationID}).Take(&model.Session{}).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			firstTime = &model.T
		} else {
			return nil, e.Wrap(err, "error querying session with past identifier")
		}
	}

	session.FirstTime = firstTime
	session.Identifier = userIdentifier

	if err := r.DB.Save(&session).Error; err != nil {
		return nil, e.Wrap(err, "failed to update session")
	}

	return &sessionID, nil
}

func (r *mutationResolver) AddTrackProperties(ctx context.Context, sessionID int, propertiesObject interface{}) (*int, error) {
	obj, ok := propertiesObject.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("error converting userObject interface type")
	}
	fields := map[string]string{}
	for k, v := range obj {
		fields[k] = fmt.Sprintf("%v", v)
	}
	err := r.AppendProperties(sessionID, fields, PropertyType.TRACK)
	if err != nil {
		return nil, e.Wrap(err, "error adding set of properties to db")
	}
	return &sessionID, nil
}

func (r *mutationResolver) AddSessionProperties(ctx context.Context, sessionID int, propertiesObject interface{}) (*int, error) {
	obj, ok := propertiesObject.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("error converting userObject interface type")
	}
	fields := map[string]string{}
	for k, v := range obj {
		fields[k] = fmt.Sprintf("%v", v)
	}
	err := r.AppendProperties(sessionID, fields, PropertyType.SESSION)
	if err != nil {
		return nil, e.Wrap(err, "error adding set of properties to db")
	}
	return &sessionID, nil
}

func (r *mutationResolver) PushPayload(ctx context.Context, sessionID int, events customModels.ReplayEventsInput, messages string, resources string, errors []*customModels.ErrorObjectInput) (*int, error) {
	r.PushPayloadWorkerPool.Submit(func() {
		r.processPayload(ctx, sessionID, events, messages, resources, errors)
	})
	return &sessionID, nil
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
	if err := r.DB.Select("organization_id", "environment", "id").Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session).Error; err != nil {
		return -1, e.Wrap(err, "error querying session by sessionID for adding session feedback")
	}

	feedbackComment := &model.SessionComment{SessionId: sessionID, Text: verbatim, Metadata: metadata, Type: model.SessionCommentTypes.FEEDBACK, OrganizationID: session.OrganizationID, ProjectID: session.OrganizationID}
	if err := r.DB.Create(feedbackComment).Error; err != nil {
		return -1, e.Wrap(err, "error creating session feedback")
	}

	r.AlertWorkerPool.Submit(func() {
		// TODO: combine `error_alerts` and `session_alerts` tables and create unique composite index on (organization_id, type)

		var sessionFeedbackAlert model.SessionAlert
		if err := r.DB.Raw(`
			SELECT *
			FROM session_alerts
			WHERE organization_id = ?
				AND type = ?
		`, session.OrganizationID, model.AlertType.SESSION_FEEDBACK).Scan(&sessionFeedbackAlert).Error; err != nil {
			log.WithError(err).
				WithFields(log.Fields{"org_id": session.OrganizationID, "session_id": sessionID, "comment_id": feedbackComment.ID}).
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
			WHERE organization_id = ?
				AND type = ?
				AND created_at > ?
		`, session.OrganizationID, model.SessionCommentTypes.FEEDBACK,
			time.Now().Add(-time.Duration(*sessionFeedbackAlert.ThresholdWindow)*time.Minute)).
			Scan(&commentsCount).Error; err != nil {
			log.WithError(err).
				WithFields(log.Fields{"org_id": session.OrganizationID, "session_id": session.ID, "comment_id": feedbackComment.ID}).
				Error(e.Wrapf(err, "error fetching %s alert count", model.AlertType.SESSION_FEEDBACK))
			return
		}
		if commentsCount+1 < int64(sessionFeedbackAlert.CountThreshold) {
			return
		}

		var organization model.Organization
		if err := r.DB.Raw(`
			SELECT *
			FROM organizations
			WHERE id = ?
		`, session.OrganizationID).Scan(&organization).Error; err != nil {
			log.WithError(err).
				WithFields(log.Fields{"org_id": session.OrganizationID, "session_id": session.ID, "comment_id": feedbackComment.ID}).
				Error(e.Wrapf(err, "error fetching %s alert", model.AlertType.SESSION_FEEDBACK))
			return
		}

		if err := sessionFeedbackAlert.SendSlackAlert(&model.SendSlackAlertInput{
			Organization:  &organization,
			SessionID:     session.ID,
			CommentID:     &feedbackComment.ID,
			CommentsCount: &commentsCount,
			CommentText:   feedbackComment.Text,
		}); err != nil {
			log.WithError(err).WithFields(log.Fields{"org_id": session.OrganizationID, "comment_id": feedbackComment.ID}).
				Error(e.Wrapf(err, "error sending %s slack alert", model.AlertType.SESSION_FEEDBACK))
			return
		}
	})

	return feedbackComment.ID, nil
}

func (r *queryResolver) Ignore(ctx context.Context, id int) (interface{}, error) {
	return nil, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
