package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"net/mail"
	"os"
	"time"

	"github.com/DmitriyVTitov/size"
	"github.com/highlight-run/highlight/backend/hlog"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/public-graph/graph/generated"
	customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
	"gorm.io/gorm"
)

func (r *mutationResolver) InitializeSession(ctx context.Context, organizationVerboseID string, enableStrictPrivacy bool, enableRecordingNetworkContents bool, clientVersion string, firstloadVersion string, clientConfig string, environment string, appVersion *string, fingerprint string, sessionSecureID *string) (*model.Session, error) {
	session, err := InitializeSessionImplementation(r, ctx, organizationVerboseID, enableStrictPrivacy, enableRecordingNetworkContents, clientVersion, firstloadVersion, clientConfig, environment, appVersion, fingerprint, sessionSecureID)

	projectID, _ := model.FromVerboseID(organizationVerboseID)
	hlog.Incr("gql.initializeSession.count", []string{fmt.Sprintf("success:%t", err == nil), fmt.Sprintf("project_id:%d", projectID)}, 1)

	if !util.IsDevEnv() && err != nil {
		specifiedSecureID := ""
		if sessionSecureID != nil {
			specifiedSecureID = *sessionSecureID
		}
		msg := slack.WebhookMessage{Text: fmt.
			Sprintf("Error in InitializeSession: %q\nOccurred for project: {%d, %q}\nSecure ID: %s\nIs on-prem: %q", err, projectID, organizationVerboseID, specifiedSecureID, os.Getenv("REACT_APP_ONPREM"))}
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
		return nil, e.New("[IdentifySession] error converting userObject interface type")
	}

	userProperties := map[string]string{}
	if userIdentifier != "" {
		userProperties["identifier"] = userIdentifier
	}

	// If userIdentifier is a valid email, save as an email field
	// (this will be overridden if `email` is passed to `H.identify`)
	_, err := mail.ParseAddress(userIdentifier)
	if err == nil {
		userProperties["email"] = userIdentifier
	}

	userObj := make(map[string]string)
	for k, v := range obj {
		if v != "" {
			userProperties[k] = fmt.Sprintf("%v", v)
			userObj[k] = fmt.Sprintf("%v", v)
		}
	}

	if err := r.AppendProperties(sessionID, userProperties, PropertyType.USER); err != nil {
		log.Error(e.Wrapf(err, "[IdentifySession] error adding set of identify properties to db: session: %d", sessionID))
	}

	session := &model.Session{}
	if err := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session).Error; err != nil {
		return nil, e.Wrap(err, "[IdentifySession] error querying session by sessionID")
	}
	// set user properties to session in db
	if err := session.SetUserProperties(userObj); err != nil {
		return nil, e.Wrapf(err, "[IdentifySession] [project_id: %d] error appending user properties to session object {id: %d}", session.ProjectID, sessionID)
	}

	// Check if there is a session created by this user.
	firstTime := &model.F
	if err := r.DB.Where(&model.Session{Identifier: userIdentifier, ProjectID: session.ProjectID}).Take(&model.Session{}).Error; err != nil {
		if e.Is(err, gorm.ErrRecordNotFound) {
			firstTime = &model.T
		} else {
			return nil, e.Wrap(err, "[IdentifySession] error querying session with past identifier")
		}
	}

	session.FirstTime = firstTime
	if userIdentifier != "" {
		session.Identifier = userIdentifier
	}

	openSearchProperties := map[string]interface{}{
		"user_properties": session.UserProperties,
		"first_time":      session.FirstTime,
	}
	if session.Identifier != "" {
		openSearchProperties["identifier"] = session.Identifier
	}
	if err := r.OpenSearch.Update(opensearch.IndexSessions, sessionID, openSearchProperties); err != nil {
		return nil, e.Wrap(err, "error updating session in opensearch")
	}

	if err := r.DB.Save(&session).Error; err != nil {
		return nil, e.Wrap(err, "[IdentifySession] failed to update session")
	}

	log.WithFields(log.Fields{"session_id": session.ID, "project_id": session.ProjectID, "identifier": session.Identifier}).
		Infof("identified session: %s", session.Identifier)

	r.AlertWorkerPool.SubmitRecover(func() {
		// Sending New User Alert
		// if is not new user, return
		if session.FirstTime == nil || !*session.FirstTime {
			return
		}
		var sessionAlerts []*model.SessionAlert
		if err := r.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{ProjectID: session.ProjectID, Disabled: &model.F}}).Where("type IS NULL OR type=?", model.AlertType.NEW_USER).Find(&sessionAlerts).Error; err != nil {
			log.Error(e.Wrapf(err, "[project_id: %d] error fetching new user alert", session.ProjectID))
			return
		}

		for _, sessionAlert := range sessionAlerts {
			// check if session was produced from an excluded environment
			excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
			if err != nil {
				log.Error(e.Wrapf(err, "[project_id: %d] error getting excluded environments from new user alert", session.ProjectID))
				return
			}
			isExcludedEnvironment := false
			for _, env := range excludedEnvironments {
				if env != nil && *env == session.Environment {
					isExcludedEnvironment = true
					break
				}
			}
			if isExcludedEnvironment {
				return
			}

			// get produced user properties from session
			userProperties, err := session.GetUserProperties()
			if err != nil {
				log.Error(e.Wrapf(err, "[project_id: %d] error getting user properties from new user alert", session.ProjectID))
				return
			}

			project := &model.Project{}
			if err := r.DB.Where(&model.Project{Model: model.Model{ID: session.ProjectID}}).First(&project).Error; err != nil {
				log.Error(e.Wrap(err, "error querying project"))
				return
			}

			workspace, err := r.getWorkspace(project.WorkspaceID)
			if err != nil {
				log.Error(e.Wrapf(err, "[project_id: %d] error querying workspace", session.ProjectID))
				return
			}

			sessionAlert.SendAlerts(r.DB, r.MailClient, &model.SendSlackAlertInput{Workspace: workspace, SessionSecureID: session.SecureID, UserIdentifier: session.Identifier, UserProperties: userProperties, UserObject: session.UserObject})
		}
	})

	return &sessionID, nil
}

func (r *mutationResolver) AddTrackProperties(ctx context.Context, sessionID int, propertiesObject interface{}) (*int, error) {
	obj, ok := propertiesObject.(map[string]interface{})
	if !ok {
		return nil, e.New("error converting userObject interface type")
	}
	fields := map[string]string{}
	for k, v := range obj {
		fields[k] = fmt.Sprintf("%v", v)
		if fields[k] == "therewasonceahumblebumblebeeflyingthroughtheforestwhensuddenlyadropofwaterfullyencasedhimittookhimasecondtofigureoutthathesinaraindropsuddenlytheraindrophitthegroundasifhewasdivingintoapoolandheflewawaywithnofurtherissues" {
			return nil, e.New("therewasonceahumblebumblebeeflyingthroughtheforestwhensuddenlyadropofwaterfullyencasedhimittookhimasecondtofigureoutthathesinaraindropsuddenlytheraindrophitthegroundasifhewasdivingintoapoolandheflewawaywithnofurtherissues")
		}
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
		return nil, e.New("error converting userObject interface type")
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

func (r *mutationResolver) PushPayload(ctx context.Context, sessionID int, events customModels.ReplayEventsInput, messages string, resources string, errors []*customModels.ErrorObjectInput, isBeacon *bool, hasSessionUnloaded *bool, highlightLogs *string) (int, error) {
	session := &model.Session{}
	if err := r.DB.Select("project_id").Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session).Error; err != nil {
		return -1, e.Wrap(err, "error querying session by sessionID for adding session feedback")
	}
	if session.ProjectID == 1 {
		r.ProducerQueue.Submit(kafka_queue.Message{
			Type: kafka_queue.PushPayload,
			PushPayload: &kafka_queue.PushPayloadArgs{
				SessionID:          sessionID,
				Events:             events,
				Messages:           messages,
				Resources:          resources,
				Errors:             errors,
				IsBeacon:           isBeacon,
				HasSessionUnloaded: hasSessionUnloaded,
				HighlightLogs:      highlightLogs,
			}})
	} else {
		r.PushPayloadWorkerPool.SubmitRecover(func() {
			r.ProcessPayload(ctx, sessionID, events, messages, resources, errors, isBeacon != nil && *isBeacon, hasSessionUnloaded != nil && *hasSessionUnloaded, highlightLogs)
		})
	}
	return size.Of(events), nil
}

func (r *mutationResolver) PushBackendPayload(ctx context.Context, errors []*customModels.BackendErrorObjectInput) (interface{}, error) {
	r.PushPayloadWorkerPool.SubmitRecover(func() {
		r.processBackendPayload(ctx, errors)
	})
	return nil, nil
}

func (r *mutationResolver) MarkBackendSetup(ctx context.Context, sessionSecureID string) (int, error) {
	session := &model.Session{}
	if err := r.DB.Model(&model.Session{}).Where("secure_id = ?", sessionSecureID).First(&session).Error; err != nil {
		return -1, e.Wrapf(err, "error reading from sessionSecureId")
	}
	var backendSetupCount int64
	if err := r.DB.Model(&model.Project{}).Where("id = ? AND backend_setup=true", session.ProjectID).Count(&backendSetupCount).Error; err != nil {
		return -1, e.Wrap(err, "error querying backend_setup flag")
	}
	if backendSetupCount < 1 {
		if err := r.DB.Model(&model.Project{}).Where("id = ?", session.ProjectID).Updates(&model.Project{BackendSetup: &model.T}).Error; err != nil {
			return -1, e.Wrap(err, "error updating backend_setup flag")
		}
	}
	return session.ProjectID, nil
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

func (r *mutationResolver) AddWebVitals(ctx context.Context, sessionID int, metric customModels.WebVitalMetricInput) (int, error) {
	session := &model.Session{}
	if err := r.DB.Model(&session).Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session).Error; err != nil {
		log.Error(err)
		return -1, nil
	}

	existingMetric := &model.Metric{
		Name:      metric.Name,
		ProjectID: session.ProjectID,
		SessionID: sessionID,
		Type:      modelInputs.MetricTypeWebVital,
	}
	recordAlreadyExists := true

	// Check to see if this metric already exists.
	if err := r.DB.Where(&existingMetric).First(&existingMetric).Error; err != nil {
		if e.Is(err, gorm.ErrRecordNotFound) {
			recordAlreadyExists = false
		} else {
			log.Error(err)
			return -1, nil
		}
	}

	if !recordAlreadyExists {
		newMetric := &model.Metric{
			Name:      metric.Name,
			Value:     metric.Value,
			ProjectID: session.ProjectID,
			SessionID: sessionID,
			Type:      modelInputs.MetricTypeWebVital,
		}

		if err := r.DB.Create(&newMetric).Error; err != nil {
			log.Error(err)
			return -1, nil
		}
	} else {
		// Update the existing record if it already exists
		existingMetric.Value = metric.Value
		if err := r.DB.Save(&existingMetric).Error; err != nil {
			log.Error(err)
			return -1, nil
		}
	}

	return sessionID, nil
}

func (r *mutationResolver) AddDeviceMetric(ctx context.Context, sessionID int, metric customModels.DeviceMetricInput) (int, error) {
	session := &model.Session{}
	if err := r.DB.Model(&session).Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session).Error; err != nil {
		log.Error(err)
		return -1, nil
	}

	existingMetric := &model.Metric{
		Name:      metric.Name,
		ProjectID: session.ProjectID,
		SessionID: sessionID,
		Type:      modelInputs.MetricTypeDevice,
	}
	recordAlreadyExists := true

	// Check to see if this metric already exists.
	if err := r.DB.Where(&existingMetric).First(&existingMetric).Error; err != nil {
		if e.Is(err, gorm.ErrRecordNotFound) {
			recordAlreadyExists = false
		} else {
			log.Error(err)
			return -1, nil
		}
	}

	if !recordAlreadyExists {
		newMetric := &model.Metric{
			Name:      metric.Name,
			Value:     metric.Value,
			ProjectID: session.ProjectID,
			SessionID: sessionID,
			Type:      modelInputs.MetricTypeDevice,
		}

		if err := r.DB.Create(&newMetric).Error; err != nil {
			log.Error(err)
			return -1, nil
		}
	} else {
		// Update the existing record if it already exists
		existingMetric.Value = metric.Value
		if err := r.DB.Save(&existingMetric).Error; err != nil {
			log.Error(err)
			return -1, nil
		}
	}

	return sessionID, nil
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
