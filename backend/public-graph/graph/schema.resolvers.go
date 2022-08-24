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
		return nil, err
	}
	hlog.Incr("gql.initializeSession.count", []string{fmt.Sprintf("success:%t", err == nil), fmt.Sprintf("project_verbose_id:%q", organizationVerboseID), fmt.Sprintf("project_id:%d", projectID), fmt.Sprintf("session_secure_id:%s", sessionSecureID)}, 1)

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
func (r *mutationResolver) MarkBackendSetup(ctx context.Context, sessionSecureID string) (string, error) {
	err := r.ProducerQueue.Submit(&kafkaqueue.Message{
		Type: kafkaqueue.MarkBackendSetup,
		MarkBackendSetup: &kafkaqueue.MarkBackendSetupArgs{
			SecureID: sessionSecureID,
		}}, sessionSecureID)
	return sessionSecureID, err
}

// AddSessionFeedback is the resolver for the addSessionFeedback field.
func (r *mutationResolver) AddSessionFeedback(ctx context.Context, sessionSecureID string, userName *string, userEmail *string, verbatim string, timestamp time.Time) (string, error) {
	err := r.ProducerQueue.Submit(&kafkaqueue.Message{
		Type: kafkaqueue.AddSessionFeedback,
		AddSessionFeedback: &kafkaqueue.AddSessionFeedbackArgs{
			SecureID:  sessionSecureID,
			UserName:  userName,
			UserEmail: userEmail,
			Verbatim:  verbatim,
			Timestamp: timestamp,
		}}, sessionSecureID)

	return sessionSecureID, err
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
