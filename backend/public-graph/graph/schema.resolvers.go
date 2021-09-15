package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/gammazero/workerpool"
	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/highlight-run/highlight/backend/hlog"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/public-graph/graph/generated"
	customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
	"golang.org/x/sync/errgroup"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
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
	r.PushPayloadWorkerPool.Submit(
		func() {
			querySessionSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload", tracer.ResourceName("db.querySession"))
			querySessionSpan.SetTag("sessionID", sessionID)
			querySessionSpan.SetTag("messagesLength", len(messages))
			querySessionSpan.SetTag("resourcesLength", len(resources))
			querySessionSpan.SetTag("numberOfErrors", len(errors))
			querySessionSpan.SetTag("numberOfEvents", len(events.Events))
			sessionObj := &model.Session{}
			if err := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&sessionObj).Error; err != nil {
				retErr := e.Wrapf(err, "error reading from session %v", sessionID)
				querySessionSpan.Finish(tracer.WithError(retErr))
				log.Error(retErr)
				return
			}
			querySessionSpan.SetTag("org_id", sessionObj.OrganizationID)
			querySessionSpan.Finish()

			var g errgroup.Group

			organizationID := sessionObj.OrganizationID
			g.Go(func() error {
				parseEventsSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
					tracer.ResourceName("go.parseEvents"), tracer.Tag("org_id", organizationID))
				if evs := events.Events; len(evs) > 0 {
					// TODO: this isn't very performant, as marshaling the whole event obj to a string is expensive;
					// should fix at some point.
					eventBytes, err := json.Marshal(events)
					if err != nil {
						return e.Wrap(err, "error marshaling events from schema interfaces")
					}
					parsedEvents, err := parse.EventsFromString(string(eventBytes))
					if err != nil {
						return e.Wrap(err, "error parsing events from schema interfaces")
					}

					// If we see a snapshot event, attempt to inject CORS stylesheets.
					for _, e := range parsedEvents.Events {
						if e.Type == parse.FullSnapshot {
							d, err := parse.InjectStylesheets(e.Data)
							if err != nil {
								continue
							}
							e.Data = d
						}
					}

					// Re-format as a string to write to the db.
					b, err := json.Marshal(parsedEvents)
					if err != nil {
						return e.Wrap(err, "error marshaling events from schema interfaces")
					}
					obj := &model.EventsObject{SessionID: sessionID, Events: string(b)}
					if err := r.DB.Create(obj).Error; err != nil {
						return e.Wrap(err, "error creating events object")
					}
				}
				parseEventsSpan.Finish()
				return nil
			})

			// unmarshal messages
			g.Go(func() error {
				unmarshalMessagesSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
					tracer.ResourceName("go.unmarshal.messages"), tracer.Tag("org_id", organizationID))
				messagesParsed := make(map[string][]interface{})
				if err := json.Unmarshal([]byte(messages), &messagesParsed); err != nil {
					return fmt.Errorf("error decoding message data: %w", err)
				}
				if len(messagesParsed["messages"]) > 0 {
					obj := &model.MessagesObject{SessionID: sessionID, Messages: messages}
					if err := r.DB.Create(obj).Error; err != nil {
						return e.Wrap(err, "error creating messages object")
					}
				}
				unmarshalMessagesSpan.Finish()
				return nil
			})

			// unmarshal resources
			g.Go(func() error {
				unmarshalResourcesSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
					tracer.ResourceName("go.unmarshal.resources"), tracer.Tag("org_id", organizationID))
				resourcesParsed := make(map[string][]interface{})
				if err := json.Unmarshal([]byte(resources), &resourcesParsed); err != nil {
					return fmt.Errorf("error decoding resource data: %w", err)
				}
				if len(resourcesParsed["resources"]) > 0 {
					obj := &model.ResourcesObject{SessionID: sessionID, Resources: resources}
					if err := r.DB.Create(obj).Error; err != nil {
						return e.Wrap(err, "error creating resources object")
					}
				}
				unmarshalResourcesSpan.Finish()
				return nil
			})

			// process errors
			g.Go(func() error {
				// filter out empty errors
				var filteredErrors []*customModels.ErrorObjectInput
				for _, errorObject := range errors {
					if errorObject.Event == "[{}]" {
						var objString string
						objBytes, err := json.Marshal(errorObject)
						if err != nil {
							log.Error(e.Wrap(err, "error marshalling error object when filtering"))
							objString = ""
						} else {
							objString = string(objBytes)
						}
						log.WithFields(log.Fields{
							"org_id":       organizationID,
							"session_id":   sessionID,
							"error_object": objString,
						}).Warn("caught empty error, continuing...")
					} else {
						filteredErrors = append(filteredErrors, errorObject)
					}
				}
				errors = filteredErrors

				wp := workerpool.New(5)

				// increment daily error table
				wp.Submit(func() {
					if len(errors) > 0 {
						n := time.Now()
						dailyError := &model.DailyErrorCount{}
						currentDate := time.Date(n.UTC().Year(), n.UTC().Month(), n.UTC().Day(), 0, 0, 0, 0, time.UTC)
						if err := r.DB.Where(&model.DailyErrorCount{
							OrganizationID: organizationID,
							Date:           &currentDate,
						}).Attrs(&model.DailyErrorCount{
							Count: 0,
						}).FirstOrCreate(&dailyError).Error; err != nil {
							log.Error(e.Wrap(err, "error getting or creating daily error count"))
							return
						}

						if err := r.DB.Exec("UPDATE daily_error_counts SET count = count + ? WHERE date = ? AND organization_id = ?", len(errors), currentDate, organizationID).Error; err != nil {
							log.Error(e.Wrap(err, "error updating daily error count"))
							return
						}
					}
				})

				// put errors in db
				putErrorsToDBSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
					tracer.ResourceName("db.errors"), tracer.Tag("org_id", organizationID))
				for _, v := range errors {
					wp.Submit(func() {
						traceBytes, err := json.Marshal(v.StackTrace)
						if err != nil {
							log.Errorf("Error marshaling trace: %v", v.StackTrace)
							return
						}
						traceString := string(traceBytes)

						errorToInsert := &model.ErrorObject{
							OrganizationID: organizationID,
							SessionID:      sessionID,
							Environment:    sessionObj.Environment,
							Event:          v.Event,
							Type:           v.Type,
							URL:            v.URL,
							Source:         v.Source,
							LineNumber:     v.LineNumber,
							ColumnNumber:   v.ColumnNumber,
							OS:             sessionObj.OSName,
							Browser:        sessionObj.BrowserName,
							StackTrace:     &traceString,
							Timestamp:      v.Timestamp,
							Payload:        v.Payload,
						}

						//create error fields array
						metaFields := []*model.ErrorField{}
						metaFields = append(metaFields, &model.ErrorField{OrganizationID: organizationID, Name: "browser", Value: sessionObj.BrowserName})
						metaFields = append(metaFields, &model.ErrorField{OrganizationID: organizationID, Name: "os_name", Value: sessionObj.OSName})
						metaFields = append(metaFields, &model.ErrorField{OrganizationID: organizationID, Name: "visited_url", Value: errorToInsert.URL})
						metaFields = append(metaFields, &model.ErrorField{OrganizationID: organizationID, Name: "event", Value: errorToInsert.Event})
						group, err := r.HandleErrorAndGroup(errorToInsert, v, metaFields, organizationID)
						if err != nil {
							log.Errorf("Error updating error group: %v", errorToInsert)
							return
						}

						// Get ErrorAlert object and send respective alert
						r.AlertWorkerPool.Submit(func() {
							var errorAlert model.ErrorAlert
							if err := r.DB.Model(&model.ErrorAlert{}).Where(&model.ErrorAlert{Alert: model.Alert{OrganizationID: organizationID}}).First(&errorAlert).Error; err != nil {
								log.Error(e.Wrap(err, "error fetching ErrorAlert object"))
								return
							}
							if errorAlert.CountThreshold < 1 {
								return
							}
							excludedEnvironments, err := errorAlert.GetExcludedEnvironments()
							if err != nil {
								log.Error(e.Wrap(err, "error getting excluded environments from ErrorAlert"))
								return
							}
							for _, env := range excludedEnvironments {
								if env != nil && *env == sessionObj.Environment {
									return
								}
							}
							numErrors := int64(-1)
							if errorAlert.ThresholdWindow == nil {
								t := 30
								errorAlert.ThresholdWindow = &t
							}
							if err := r.DB.Model(&model.ErrorObject{}).Where(&model.ErrorObject{OrganizationID: organizationID, ErrorGroupID: group.ID}).Where("created_at > ?", time.Now().Add(time.Duration(-(*errorAlert.ThresholdWindow))*time.Minute)).Count(&numErrors).Error; err != nil {
								log.Error(e.Wrapf(err, "error counting errors from past %d minutes", *errorAlert.ThresholdWindow))
								return
							}
							if numErrors+1 < int64(errorAlert.CountThreshold) {
								return
							}
							var org model.Organization
							if err := r.DB.Model(&model.Organization{}).Where(&model.Organization{Model: model.Model{ID: organizationID}}).First(&org).Error; err != nil {
								log.Error(e.Wrap(err, "error querying organization"))
								return
							}
							err = errorAlert.SendSlackAlert(&org, sessionID, sessionObj.Identifier, group, &errorToInsert.URL, nil, nil, &numErrors)
							if err != nil {
								log.Error(e.Wrap(err, "error sending slack error message"))
								return
							}
						})
					}
				}

				wp.StopWait()

				putErrorsToDBSpan.Finish()
				return nil
			})

			if err := g.Wait(); err != nil {
				log.Error(err)
				return
			}

			now := time.Now()
			if err := r.DB.Model(&model.Session{Model: model.Model{ID: sessionID}}).Updates(&model.Session{PayloadUpdatedAt: &now}).Error; err != nil {
				log.Error(e.Wrap(err, "error updating session payload time"))
				return
			}
		},
	)
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
	if err := r.DB.Select("organization_id").Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session).Error; err != nil {
		return -1, e.Wrap(err, "error querying session by sessionID for adding session feedback")
	}

	feedbackComment := &model.SessionComment{SessionId: sessionID, Text: verbatim, Metadata: metadata, Type: model.SessionCommentTypes.FEEDBACK, OrganizationID: session.OrganizationID}
	if err := r.DB.Create(feedbackComment).Error; err != nil {
		return -1, e.Wrap(err, "error creating session feedback")
	}

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
