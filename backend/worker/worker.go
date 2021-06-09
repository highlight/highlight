package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/pkg/errors"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
	"golang.org/x/sync/errgroup"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	mgraph "github.com/highlight-run/highlight/backend/private-graph/graph"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
)

// Worker is a job runner that parses sessions
const MIN_INACTIVE_DURATION = 10

type Worker struct {
	Resolver *mgraph.Resolver
	S3Client *storage.StorageClient
}

func (w *Worker) pushToObjectStorageAndWipe(ctx context.Context, s *model.Session, migrationState *string) error {
	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{MigrationState: migrationState},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}
	fmt.Printf("starting push for: %v \n", s.ID)
	events := []model.EventsObject{}
	if err := w.Resolver.DB.Where(&model.EventsObject{SessionID: s.ID}).Order("created_at asc").Find(&events).Error; err != nil {
		return errors.Wrap(err, "retrieving events")
	}
	sessionPayloadSize, err := w.S3Client.PushSessionsToS3(s.ID, s.OrganizationID, events)
	// If this is unsucessful, return early (we treat this session as if it is stored in psql).
	if err != nil {
		return errors.Wrap(err, "error pushing session payload to s3")
	}

	resourcesObject := []*model.ResourcesObject{}
	if res := w.Resolver.DB.Order("created_at desc").Where(&model.ResourcesObject{SessionID: s.ID}).Find(&resourcesObject); res.Error != nil {
		return errors.Wrap(res.Error, "error reading from resources")
	}
	resourcePayloadSize, err := w.S3Client.PushResourcesToS3(s.ID, s.OrganizationID, resourcesObject)
	if err != nil {
		return errors.Wrap(err, "error pushing network payload to s3")
	}

	messagesObj := []*model.MessagesObject{}
	if res := w.Resolver.DB.Order("created_at desc").Where(&model.MessagesObject{SessionID: s.ID}).Find(&messagesObj); res.Error != nil {
		return errors.Wrap(res.Error, "error reading from messages")
	}
	messagePayloadSize, err := w.S3Client.PushMessagesToS3(s.ID, s.OrganizationID, messagesObj)
	if err != nil {
		return errors.Wrap(err, "error pushing network payload to s3")
	}

	var totalPayloadSize int64
	if sessionPayloadSize != nil {
		totalPayloadSize += *sessionPayloadSize
	}
	if resourcePayloadSize != nil {
		totalPayloadSize += *resourcePayloadSize
	}
	if messagePayloadSize != nil {
		totalPayloadSize += *messagePayloadSize
	}

	// Mark this session as stored in S3.
	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{ObjectStorageEnabled: &model.T, PayloadSize: &totalPayloadSize},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to storage enabled")
	}
	// Delete all the events_objects in the DB.
	if len(events) > 0 {
		if err := w.Resolver.DB.Unscoped().Delete(&events).Error; err != nil {
			return errors.Wrapf(err, "error deleting all event records with length: %v", len(events))
		}
	}
	if len(resourcesObject) > 0 {
		if err := w.Resolver.DB.Unscoped().Delete(&resourcesObject).Error; err != nil {
			return errors.Wrapf(err, "error deleting all network resource records with length %v", len(resourcesObject))
		}
	}
	if len(messagesObj) > 0 {
		if err := w.Resolver.DB.Unscoped().Delete(&messagesObj).Error; err != nil {
			return errors.Wrapf(err, "error deleting all messages with length %v", len(messagesObj))
		}
	}
	fmt.Println("parsed: ", s.ID)
	return nil
}

func (w *Worker) processSession(ctx context.Context, s *model.Session) error {
	// Set the session as processed; if any is error thrown after this, the session gets ignored.
	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		&model.Session{Processed: &model.T},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}

	// load all events
	events := []model.EventsObject{}
	if err := w.Resolver.DB.Where(&model.EventsObject{SessionID: s.ID}).Order("created_at asc").Find(&events).Error; err != nil {
		return errors.Wrap(err, "retrieving events")
	}
	// Delete the session if there's no events.
	if len(events) == 0 {
		if err := w.Resolver.DB.Delete(&model.Session{Model: model.Model{ID: s.ID}}).Error; err != nil {
			return errors.Wrap(err, "error trying to delete session with no events")
		}
		return nil
	}

	firstEventsParsed, err := parse.EventsFromString(events[0].Events)
	if err != nil {
		return errors.Wrap(err, "error parsing first set of events")
	}
	lastEventsParsed, err := parse.EventsFromString(events[len(events)-1].Events)
	if err != nil {
		return errors.Wrap(err, "error parsing last set of events")
	}

	// Calculate total session length and write the length to the session.
	diff := CalculateSessionLength(firstEventsParsed, lastEventsParsed)
	length := diff.Milliseconds()
	activeLength, err := getActiveDuration(events)
	if err != nil {
		return errors.Wrap(err, "error parsing active length")
	}
	activeLengthSec := activeLength.Milliseconds()

	// Delete the session if the length of the session is 0.
	// 1. Nothing happened in the session
	// 2. A web crawler visited the page and produced no events
	if length == 0 {
		if err := w.Resolver.DB.Delete(&model.Session{Model: model.Model{ID: s.ID}}).Error; err != nil {
			return errors.Wrap(err, "error trying to delete session with no events")
		}
		return nil
	}

	if err := w.Resolver.DB.Model(&model.Session{}).Where(
		&model.Session{Model: model.Model{ID: s.ID}},
	).Updates(
		model.Session{
			Processed:    &model.T,
			Length:       length,
			ActiveLength: activeLengthSec,
		},
	).Error; err != nil {
		return errors.Wrap(err, "error updating session to processed status")
	}

	var g errgroup.Group
	organizationID := s.OrganizationID
	org := &model.Organization{}
	if err := w.Resolver.DB.Where(&model.Organization{Model: model.Model{ID: s.OrganizationID}}).First(&org).Error; err != nil {
		return e.Wrap(err, "error querying org")
	}

	g.Go(func() error {
		// Sending New User Alert
		// Get SessionAlert object and send alert if is new user
		if s.FirstTime != nil && *s.FirstTime {
			var sessionAlert model.SessionAlert
			if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{OrganizationID: organizationID}}).Where("type IS NULL OR type=?", model.AlertType.NEW_USER).First(&sessionAlert).Error; err != nil {
				return e.Wrapf(err, "[org_id: %d] error fetching new user alert", organizationID)
			} else {
				excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
				if err != nil {
					return e.Wrapf(err, "[org_id: %d] error getting excluded environments from new user alert", organizationID)
				} else {
					isExcludedEnvironment := false
					for _, env := range excludedEnvironments {
						if env != nil && *env == s.Environment {
							isExcludedEnvironment = true
							break
						}
					}
					if !isExcludedEnvironment {
						if channelsToNotify, err := sessionAlert.GetChannelsToNotify(); err != nil {
							return e.Wrapf(err, "[org_id: %d] error getting channels to notify from new user alert", organizationID)
						} else {
							userProperties, err := s.GetUserProperties()
							if err != nil {
								return e.Wrapf(err, "[org_id: %d] error getting user properties from new user alert", s.OrganizationID)
							}
							err = w.SendSlackNewUserMessage(org, s.ID, s.Identifier, channelsToNotify, userProperties)
							if err != nil {
								return e.Wrapf(err, "[org_id: %d] error sending slack message for new user alert", organizationID)
							}
						}
					}
				}
			}
		}
		return nil
	})

	g.Go(func() error {
		// Sending Track Properties Alert
		var sessionAlert model.SessionAlert
		if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{OrganizationID: organizationID}}).Where("type=?", model.AlertType.TRACK_PROPERTIES).First(&sessionAlert).Error; err != nil {
			return e.Wrapf(err, "[org_id: %d] error fetching track properties alert", organizationID)
		} else {
			excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
			if err != nil {
				return e.Wrapf(err, "[org_id: %d] error getting excluded environments from track properties alert", organizationID)
			} else {
				isExcludedEnvironment := false
				for _, env := range excludedEnvironments {
					if env != nil && *env == s.Environment {
						isExcludedEnvironment = true
						break
					}
				}
				if !isExcludedEnvironment {
					if channelsToNotify, err := sessionAlert.GetChannelsToNotify(); err != nil {
						return e.Wrapf(err, "[org_id: %d] error getting channels to notify from track properties alert", organizationID)
					} else {
						trackProperties, err := sessionAlert.GetTrackProperties()
						if err != nil {
							return e.Wrap(err, "error getting track properties from session")
						}
						var trackPropertyIds []int
						for _, trackProperty := range trackProperties {
							trackPropertyIds = append(trackPropertyIds, trackProperty.ID)
						}
						stmt := w.Resolver.DB.Model(&model.Field{}).
							Where(&model.Field{OrganizationID: organizationID, Type: "track"}).
							Where("id IN (SELECT field_id FROM session_fields WHERE session_id=?)", s.ID).
							Where("id IN ?", trackPropertyIds)
						var matchedFields []*model.Field
						if err := stmt.Find(&matchedFields).Error; err != nil {
							return e.Wrap(err, "error querying matched fields by session_id")
						}
						if len(matchedFields) < 1 {
							return nil
						}
						err = w.SendSlackTrackPropertiesMessage(org, s.ID, channelsToNotify, matchedFields)
						if err != nil {
							return e.Wrapf(err, "[org_id: %d] error sending track properties alert slack message", organizationID)
						}
					}
				}
			}
		}
		return nil
	})

	g.Go(func() error {
		// Sending User Properties Alert
		var sessionAlert model.SessionAlert
		if err := w.Resolver.DB.Model(&model.SessionAlert{}).Where(&model.SessionAlert{Alert: model.Alert{OrganizationID: organizationID}}).Where("type=?", model.AlertType.USER_PROPERTIES).First(&sessionAlert).Error; err != nil {
			return e.Wrapf(err, "[org_id: %d] error fetching user properties alert", organizationID)
		} else {
			excludedEnvironments, err := sessionAlert.GetExcludedEnvironments()
			if err != nil {
				return e.Wrapf(err, "[org_id: %d] error getting excluded environments from user properties alert", organizationID)
			} else {
				isExcludedEnvironment := false
				for _, env := range excludedEnvironments {
					if env != nil && *env == s.Environment {
						isExcludedEnvironment = true
						break
					}
				}
				if !isExcludedEnvironment {
					if channelsToNotify, err := sessionAlert.GetChannelsToNotify(); err != nil {
						return e.Wrapf(err, "[org_id: %d] error getting channels to notify from user properties alert", organizationID)
					} else {
						userProperties, err := sessionAlert.GetUserProperties()
						if err != nil {
							return e.Wrap(err, "error getting user properties from session")
						}
						var userPropertyIds []int
						for _, userProperty := range userProperties {
							userPropertyIds = append(userPropertyIds, userProperty.ID)
						}
						stmt := w.Resolver.DB.Model(&model.Field{}).
							Where(&model.Field{OrganizationID: organizationID, Type: "user"}).
							Where("id IN (SELECT field_id FROM session_fields WHERE session_id=?)", s.ID).
							Where("id IN ?", userPropertyIds)
						var matchedFields []*model.Field
						if err := stmt.Find(&matchedFields).Error; err != nil {
							return e.Wrap(err, "error querying matched fields by session_id")
						}
						if len(matchedFields) < 1 {
							return fmt.Errorf("matched fields is empty in user properties alert")
						}
						err = w.SendSlackUserPropertiesMessage(org, s.ID, channelsToNotify, matchedFields)
						if err != nil {
							return e.Wrapf(err, "[org_id: %d] error sending user properties alert slack message", organizationID)
						}
					}
				}
			}
		}
		return nil
	})

	// Waits for all goroutines to finish, then returns the first non-nil error (if any).
	if err := g.Wait(); err != nil {
		log.Error(err)
	}

	// Upload to s3 and wipe from the db.
	if os.Getenv("ENABLE_OBJECT_STORAGE") == "true" {
		state := "normal"
		if err := w.pushToObjectStorageAndWipe(ctx, s, &state); err != nil {
			log.Errorf("error pushing to object and wiping from db (%v): %v", s.ID, err)
		}
	}
	return nil
}

// Start begins the worker's tasks.
func (w *Worker) Start() {
	ctx := context.Background()
	for {
		time.Sleep(1 * time.Second)
		workerSpan, ctx := tracer.StartSpanFromContext(ctx, "worker.operation", tracer.ResourceName("worker.unit"))
		workerSpan.SetTag("backend", util.Worker)
		now := time.Now()
		seconds := 30
		if os.Getenv("ENVIRONMENT") == "dev" {
			seconds = 8
		}
		someSecondsAgo := now.Add(time.Duration(-1*seconds) * time.Second)
		sessions := []*model.Session{}
		sessionsSpan, ctx := tracer.StartSpanFromContext(ctx, "worker.sessionsQuery", tracer.ResourceName(now.String()))
		if err := w.Resolver.DB.Where("(payload_updated_at < ? OR payload_updated_at IS NULL) AND (processed = ?)", someSecondsAgo, false).Find(&sessions).Error; err != nil {
			log.Errorf("error querying unparsed, outdated sessions: %v", err)
			sessionsSpan.Finish()
			continue
		}
		sessionsSpan.Finish()
		for _, session := range sessions {
			span, ctx := tracer.StartSpanFromContext(ctx, "worker.processSession", tracer.ResourceName(strconv.Itoa(session.ID)))
			if err := w.processSession(ctx, session); err != nil {
				log.Errorf("error processing main session(%v): %v", session.ID, err)
				tracer.WithError(e.Wrapf(err, "error processing session: %v", session.ID))
				span.Finish()
				continue
			}
			span.Finish()
		}
		workerSpan.Finish()
	}
}

// CalculateSessionLength gets the session length given two sets of ReplayEvents.
func CalculateSessionLength(first *parse.ReplayEvents, last *parse.ReplayEvents) time.Duration {
	d := time.Duration(0)
	fe := first.Events
	le := last.Events
	if len(fe) <= 0 {
		return d
	}
	start := first.Events[0].Timestamp
	end := time.Time{}
	if len(le) <= 0 {
		end = first.Events[len(first.Events)-1].Timestamp
	} else {
		end = last.Events[len(last.Events)-1].Timestamp
	}
	d = end.Sub(start)
	return d
}

func getActiveDuration(events []model.EventsObject) (*time.Duration, error) {
	d := time.Duration(0)
	// unnests the events from EventObjects
	allEvents := []*parse.ReplayEvent{}
	for _, eventObj := range events {
		subEvents, err := parse.EventsFromString(eventObj.Events)
		if err != nil {
			return nil, err
		}
		allEvents = append(allEvents, subEvents.Events...)
	}
	// Iterate through all events and sum up time between interactions
	prevUserEvent := &parse.ReplayEvent{}
	for _, eventObj := range allEvents {
		if eventObj.Type == 3 {
			aux := struct {
				Source float64 `json:"source"`
			}{}
			if err := json.Unmarshal([]byte(eventObj.Data), &aux); err != nil {
				return nil, err
			}
			if aux.Source > 0 && aux.Source <= 5 {
				if prevUserEvent != (&parse.ReplayEvent{}) {
					diff := eventObj.Timestamp.Sub(prevUserEvent.Timestamp)
					if diff.Seconds() <= MIN_INACTIVE_DURATION {
						d += eventObj.Timestamp.Sub(prevUserEvent.Timestamp)
					}
				}
				prevUserEvent = eventObj
			}
		}
	}
	return &d, nil
}

func (w *Worker) SendSlackNewUserMessage(organization *model.Organization, sessionID int, userIdentifier string, channels []*modelInputs.SanitizedSlackChannel, userProperties map[string]string) error {
	integratedSlackChannels, err := organization.IntegratedSlackChannels()
	if err != nil {
		return e.Wrap(err, "error getting slack webhook url for alert")
	}
	if len(integratedSlackChannels) <= 0 {
		return nil
	}
	sessionLink := fmt.Sprintf("<https://app.highlight.run/%d/sessions/%d/>", organization.ID, sessionID)

	var messageBlock []*slack.TextBlockObject
	if userIdentifier != "" {
		messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*User:*\n"+userIdentifier, false, false))
	}
	messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*Session:*\n"+sessionLink, false, false))
	for k, v := range userProperties {
		if k == "" {
			continue
		}
		if v == "" {
			v = "_empty_"
		}
		messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*%s:*\n%s", strings.Title(strings.ToLower(k)), v), false, false))
	}

	for _, channel := range channels {
		if channel.WebhookChannel != nil {
			var slackWebhookURL string
			for _, ch := range integratedSlackChannels {
				if id := channel.WebhookChannelID; id != nil && ch.WebhookChannelID == *id {
					slackWebhookURL = ch.WebhookURL
					break
				}
			}
			if slackWebhookURL == "" {
				log.Errorf("[org_id: %d] requested channel has no matching slackWebhookURL: channel %s at url %s", organization.ID, *channel.WebhookChannel, slackWebhookURL)
				continue
			}

			msg := slack.WebhookMessage{
				Channel: *channel.WebhookChannel,
				Blocks: &slack.Blocks{
					BlockSet: []slack.Block{
						slack.NewSectionBlock(
							slack.NewTextBlockObject(slack.MarkdownType, "*Highlight New User:*\n\n", false, false),
							messageBlock,
							nil,
						),
						slack.NewDividerBlock(),
					},
				},
			}
			err := slack.PostWebhook(
				slackWebhookURL,
				&msg,
			)
			if err != nil {
				return e.Wrap(err, "error sending slack msg")
			}
		}
	}

	return nil
}

func (w *Worker) SendSlackTrackPropertiesMessage(organization *model.Organization, sessionID int, channels []*modelInputs.SanitizedSlackChannel, matchedFields []*model.Field) error {
	//TODO: make this more generic to reduce *code smell*
	integratedSlackChannels, err := organization.IntegratedSlackChannels()
	if err != nil {
		return e.Wrap(err, "error getting slack webhook url for track properties alert")
	}
	if len(integratedSlackChannels) <= 0 {
		return nil
	}
	sessionLink := fmt.Sprintf("<https://app.highlight.run/%d/sessions/%d/>", organization.ID, sessionID)

	var formattedFields []string
	for _, addr := range matchedFields {
		formattedFields = append(formattedFields, fmt.Sprintf("{name: %s, value: %s}", addr.Name, addr.Value))
	}

	var messageBlock []*slack.TextBlockObject
	messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*Session:*\n"+sessionLink, false, false))
	messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Matched Track Properties:*\n%+v", formattedFields), false, false))

	for _, channel := range channels {
		if channel.WebhookChannel != nil {
			var slackWebhookURL string
			for _, ch := range integratedSlackChannels {
				if id := channel.WebhookChannelID; id != nil && ch.WebhookChannelID == *id {
					slackWebhookURL = ch.WebhookURL
					break
				}
			}
			if slackWebhookURL == "" {
				log.Errorf("[org_id: %d] requested channel for track properties alert has no matching slackWebhookURL: channel %s at url %s", organization.ID, *channel.WebhookChannel, slackWebhookURL)
				continue
			}

			msg := slack.WebhookMessage{
				Channel: *channel.WebhookChannel,
				Blocks: &slack.Blocks{
					BlockSet: []slack.Block{
						slack.NewSectionBlock(
							slack.NewTextBlockObject(slack.MarkdownType, "*Highlight Track Properties:*\n\n", false, false),
							messageBlock,
							nil,
						),
						slack.NewDividerBlock(),
					},
				},
			}
			err := slack.PostWebhook(
				slackWebhookURL,
				&msg,
			)
			if err != nil {
				return e.Wrap(err, "error sending slack msg")
			}
		}
	}

	return nil
}

func (w *Worker) SendSlackUserPropertiesMessage(organization *model.Organization, sessionID int, channels []*modelInputs.SanitizedSlackChannel, matchedFields []*model.Field) error {
	integratedSlackChannels, err := organization.IntegratedSlackChannels()
	if err != nil {
		return e.Wrap(err, "error getting slack webhook url for user properties alert")
	}
	if len(integratedSlackChannels) <= 0 {
		return nil
	}
	sessionLink := fmt.Sprintf("<https://app.highlight.run/%d/sessions/%d/>", organization.ID, sessionID)

	var formattedFields []string
	for _, addr := range matchedFields {
		formattedFields = append(formattedFields, fmt.Sprintf("{name: %s, value: %s}", addr.Name, addr.Value))
	}

	var messageBlock []*slack.TextBlockObject
	messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, "*Session:*\n"+sessionLink, false, false))
	messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Matched User Properties:*\n%+v", formattedFields), false, false))

	for _, channel := range channels {
		if channel.WebhookChannel != nil {
			var slackWebhookURL string
			for _, ch := range integratedSlackChannels {
				if id := channel.WebhookChannelID; id != nil && ch.WebhookChannelID == *id {
					slackWebhookURL = ch.WebhookURL
					break
				}
			}
			if slackWebhookURL == "" {
				log.Errorf("requested channel for user properties alert has no matching slackWebhookURL: channel %s at url %s", *channel.WebhookChannel, slackWebhookURL)
				continue
			}

			msg := slack.WebhookMessage{
				Channel: *channel.WebhookChannel,
				Blocks: &slack.Blocks{
					BlockSet: []slack.Block{
						slack.NewSectionBlock(
							slack.NewTextBlockObject(slack.MarkdownType, "*Highlight User Properties:*\n\n", false, false),
							messageBlock,
							nil,
						),
						slack.NewDividerBlock(),
					},
				},
			}
			err := slack.PostWebhook(
				slackWebhookURL,
				&msg,
			)
			if err != nil {
				return e.Wrap(err, "error sending slack msg")
			}
		}
	}

	return nil
}
