package session

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gofrs/flock"
	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"io/ioutil"
	"os"
	"path"
	"strconv"
	"time"
)

var (
	SharedFSDirectory = os.Getenv("SHARED_WORKER_FS")
)

const (
	EventsFile   = "events.json"
	MessagesFile = "messages.json"
)

type Request struct {
	ID      string            `json:"id"`
	Headers map[string]string `json:"headers"`
	URL     string            `json:"url"`
	Method  string            `json:"verb"`
}

type Response struct {
	Body    string            `json:"body"`
	Headers map[string]string `json:"headers"`
	Status  int               `json:"status"`
	Size    int               `json:"size"`
}

type RequestResponsePairs struct {
	Request    Request  `json:"request"`
	Response   Response `json:"response"`
	URLBlocked bool     `json:"urlBlocked"`
}

type NetworkResource struct {
	StartTime            float64              `json:"startTime"`
	ResponseEnd          float64              `json:"responseEnd"`
	InitiatorType        string               `json:"initiatorType"`
	TransferSize         int64                `json:"transferSize"`
	EncodedBodySize      int64                `json:"encodedBodySize"`
	Name                 string               `json:"name"`
	RequestResponsePairs RequestResponsePairs `json:"requestResponsePairs"`
}

type EventMeta struct {
	SessionID int
	Events    string
	IsBeacon  bool
}

type MessageMeta struct {
	SessionID int
	Messages  string
	IsBeacon  bool
}

type Processor struct {
	DB   *gorm.DB
	Path string
}

func (s *Processor) Process(ctx context.Context, sessionObj *model.Session, events customModels.ReplayEventsInput, messages string, resources string, errors []*customModels.ErrorObjectInput, isBeacon bool) error {
	if len(SharedFSDirectory) > 0 {
		return s.processSessionPayloadSQL(ctx, sessionObj, events, messages, resources, errors, isBeacon)
	} else {
		return s.processSessionPayloadSharedFS(ctx, sessionObj, events, messages, resources, errors, isBeacon)
	}
}

func (s *Processor) prepareFSFile(file string) ([]byte, func(), error) {
	filePath := path.Join(s.Path, file)
	lockFilePath := fmt.Sprintf("%s.lock", filePath)
	fileLock := flock.New(lockFilePath)
	locked, err := fileLock.TryLock()
	if err != nil || !locked {
		return nil, nil, e.Wrapf(err, "another worker is holding lock %s", lockFilePath)
	}

	f, err := os.Open(filePath)
	defer f.Close()
	if err != nil {
		return nil, nil, err
	}
	byteValue, err := ioutil.ReadAll(f)
	if err != nil {
		return nil, nil, err
	}
	return byteValue, func() {
		unlockError := fileLock.Unlock()
		if unlockError != nil {
			log.Errorf("failed to unlock %s: %s", lockFilePath, unlockError)
		}
	}, nil
}

func (s *Processor) processSessionPayloadSharedFS(ctx context.Context, sessionObj *model.Session, events customModels.ReplayEventsInput, messages string, resources string, errors []*customModels.ErrorObjectInput, isBeacon bool) error {
	var g errgroup.Group
	projectID := sessionObj.ProjectID
	sessionID := sessionObj.ID
	hasBeacon := sessionObj.BeaconTime != nil
	s.Path = path.Join(SharedFSDirectory, strconv.Itoa(projectID), strconv.Itoa(sessionID))
	g.Go(func() error {
		byteValue, unlock, err := s.prepareFSFile(EventsFile)
		defer unlock()

		// extract json file data into events list
		var eventRows []EventMeta
		if err := json.Unmarshal(byteValue, &eventRows); err != nil {
			return e.Wrap(err, "failed to unmarshall local session events file")
		}
		// only keep non-beacon events if this request is a beacon
		eventRows = lo.Filter(eventRows, func(v EventMeta, i int) bool {
			return !hasBeacon || !v.IsBeacon
		})

		// process the new events
		newEventBytes, err := json.Marshal(events)
		if err != nil {
			return e.Wrap(err, "error marshaling events from schema interfaces")
		}
		parsedEvents, err := parse.EventsFromString(string(newEventBytes))
		if err != nil {
			return e.Wrap(err, "error parsing events from schema interfaces")
		}
		var lastUserInteractionTimestamp time.Time
		for _, event := range parsedEvents.Events {
			if event.Type == parse.FullSnapshot {
				// If we see a snapshot event, attempt to inject CORS stylesheets.
				d, err := parse.InjectStylesheets(event.Data)
				if err != nil {
					log.Error(e.Wrap(err, "Error unmarshalling full snapshot"))
					continue
				}
				event.Data = d
			} else if event.Type == parse.IncrementalSnapshot {
				mouseInteractionEventData, err := parse.UnmarshallMouseInteractionEvent(event.Data)
				if err != nil {
					log.Error(e.Wrap(err, "Error unmarshalling incremental event"))
					continue
				}
				if _, ok := map[parse.EventSource]bool{
					parse.MouseMove: true, parse.MouseInteraction: true, parse.Scroll: true,
					parse.Input: true, parse.TouchMove: true, parse.Drag: true,
				}[*mouseInteractionEventData.Source]; !ok {
					continue
				}
				lastUserInteractionTimestamp = event.Timestamp.Round(time.Millisecond)
			}
		}
		// store new event with old events
		b, err := json.Marshal(parsedEvents)
		if err != nil {
			return e.Wrap(err, "error marshaling events from schema interfaces")
		}
		eventRows = append(eventRows, EventMeta{
			SessionID: sessionID,
			Events:    string(b),
			IsBeacon:  isBeacon,
		})

		// write all events back to file
		data, err := json.Marshal(&eventRows)
		if err != nil {
			return e.Wrap(err, "failed to marshall local session events file")
		}
		if err := ioutil.WriteFile(path.Join(s.Path, EventsFile), data, 0644); err != nil {
			return e.Wrap(err, "failed to write local session events file")
		}
		// process interaction time from the new event set
		if !lastUserInteractionTimestamp.IsZero() {
			if err := s.DB.Model(&sessionObj).Update("LastUserInteractionTime", lastUserInteractionTimestamp).Error; err != nil {
				return e.Wrap(err, "error updating LastUserInteractionTime")
			}
		}
		return nil
	})
	g.Go(func() error {
		byteValue, unlock, err := s.prepareFSFile(MessagesFile)
		defer unlock()

		// extract json file data into messages list
		var messageRows []MessageMeta
		if err := json.Unmarshal(byteValue, &messageRows); err != nil {
			return e.Wrap(err, "failed to unmarshall local session events file")
		}
		// only keep non-beacon events if this request is a beacon
		messageRows = lo.Filter(messageRows, func(v MessageMeta, i int) bool {
			return !hasBeacon || !v.IsBeacon
		})
		// process new messages
		messagesParsed := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(messages), &messagesParsed); err != nil {
			return e.Wrap(err, "error decoding message data")
		}
		if len(messagesParsed["messages"]) > 0 {
			messageRows = append(messageRows, MessageMeta{
				SessionID: sessionID,
				Messages:  messages,
				IsBeacon:  isBeacon,
			})
		}
		// write all events back to file
		data, err := json.Marshal(&messageRows)
		if err != nil {
			return e.Wrap(err, "failed to marshall local session messages file")
		}
		if err := ioutil.WriteFile(path.Join(s.Path, MessagesFile), data, 0644); err != nil {
			return e.Wrap(err, "failed to write local session events file")
		}
		return nil
	})

	return g.Wait()
}

func (s *Processor) processSessionPayloadSQL(ctx context.Context, sessionObj *model.Session, events customModels.ReplayEventsInput, messages string, resources string, errors []*customModels.ErrorObjectInput, isBeacon bool) error {
	var g errgroup.Group
	projectID := sessionObj.ProjectID
	sessionID := sessionObj.ID
	hasBeacon := sessionObj.BeaconTime != nil
	g.Go(func() error {
		parseEventsSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("go.parseEvents"), tracer.Tag("project_id", projectID))
		if hasBeacon {
			s.DB.Table("events_objects_partitioned").Where(&model.EventsObject{SessionID: sessionID, IsBeacon: true}).Delete(&model.EventsObject{})
		}
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

			var lastUserInteractionTimestamp time.Time
			for _, event := range parsedEvents.Events {
				if event.Type == parse.FullSnapshot {
					// If we see a snapshot event, attempt to inject CORS stylesheets.
					d, err := parse.InjectStylesheets(event.Data)
					if err != nil {
						log.Error(e.Wrap(err, "Error unmarshalling full snapshot"))
						continue
					}
					event.Data = d
				} else if event.Type == parse.IncrementalSnapshot {
					mouseInteractionEventData, err := parse.UnmarshallMouseInteractionEvent(event.Data)
					if err != nil {
						log.Error(e.Wrap(err, "Error unmarshalling incremental event"))
						continue
					}
					if _, ok := map[parse.EventSource]bool{
						parse.MouseMove: true, parse.MouseInteraction: true, parse.Scroll: true,
						parse.Input: true, parse.TouchMove: true, parse.Drag: true,
					}[*mouseInteractionEventData.Source]; !ok {
						continue
					}
					lastUserInteractionTimestamp = event.Timestamp.Round(time.Millisecond)
				}
			}
			// Re-format as a string to write to the db.
			b, err := json.Marshal(parsedEvents)
			if err != nil {
				return e.Wrap(err, "error marshaling events from schema interfaces")
			}
			obj := &model.EventsObject{SessionID: sessionID, Events: string(b), IsBeacon: isBeacon}
			if err := s.DB.Table("events_objects_partitioned").Create(obj).Error; err != nil {
				return e.Wrap(err, "error creating events object")
			}
			if !lastUserInteractionTimestamp.IsZero() {
				if err := s.DB.Model(&sessionObj).Update("LastUserInteractionTime", lastUserInteractionTimestamp).Error; err != nil {
					return e.Wrap(err, "error updating LastUserInteractionTime")
				}
			}
		}
		parseEventsSpan.Finish()
		return nil
	})

	// unmarshal messages
	g.Go(func() error {
		unmarshalMessagesSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("go.unmarshal.messages"), tracer.Tag("project_id", projectID))
		if hasBeacon {
			s.DB.Where(&model.MessagesObject{SessionID: sessionID, IsBeacon: true}).Delete(&model.MessagesObject{})
		}
		messagesParsed := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(messages), &messagesParsed); err != nil {
			return e.Wrap(err, "error decoding message data")
		}
		if len(messagesParsed["messages"]) > 0 {
			obj := &model.MessagesObject{SessionID: sessionID, Messages: messages, IsBeacon: isBeacon}
			if err := s.DB.Create(obj).Error; err != nil {
				return e.Wrap(err, "error creating messages object")
			}
		}
		unmarshalMessagesSpan.Finish()
		return nil
	})

	// unmarshal resources
	g.Go(func() error {
		unmarshalResourcesSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("go.unmarshal.resources"), tracer.Tag("project_id", projectID))
		if hasBeacon {
			s.DB.Where(&model.ResourcesObject{SessionID: sessionID, IsBeacon: true}).Delete(&model.ResourcesObject{})
		}
		resourcesParsed := make(map[string][]NetworkResource)
		if err := json.Unmarshal([]byte(resources), &resourcesParsed); err != nil {
			return e.Wrap(err, "error decoding resource data")
		}
		if len(resourcesParsed["resources"]) > 0 {
			// TODO(vkorolik) frontend metrics recording only for highlight project for now to ensure we do not overwhelm our message processing
			if projectID == 1 {
				if err := s.submitFrontendNetworkMetric(ctx, sessionObj, resourcesParsed["resources"]); err != nil {
					return err
				}
			}
			obj := &model.ResourcesObject{SessionID: sessionID, Resources: resources, IsBeacon: isBeacon}
			if err := s.DB.Create(obj).Error; err != nil {
				return e.Wrap(err, "error creating resources object")
			}
		}
		unmarshalResourcesSpan.Finish()
		return nil
	})

	// process errors
	g.Go(func() error {
		if hasBeacon {
			s.DB.Where(&model.ErrorObject{SessionID: sessionID, IsBeacon: true}).Delete(&model.ErrorObject{})
		}
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
					"project_id":   projectID,
					"session_id":   sessionID,
					"error_object": objString,
				}).Warn("caught empty error, continuing...")
			} else {
				filteredErrors = append(filteredErrors, errorObject)
			}
		}
		errors = filteredErrors

		// increment daily error table
		if len(errors) > 0 {
			n := time.Now()
			currentDate := time.Date(n.UTC().Year(), n.UTC().Month(), n.UTC().Day(), 0, 0, 0, 0, time.UTC)
			dailyErrorCount := model.DailyErrorCount{
				ProjectID: projectID,
				Date:      &currentDate,
				Count:     int64(len(errors)),
				ErrorType: model.ErrorType.FRONTEND,
			}

			// Upsert error counts into daily_error_counts
			if err := s.DB.Table(model.DAILY_ERROR_COUNTS_TBL).Clauses(clause.OnConflict{
				OnConstraint: model.DAILY_ERROR_COUNTS_UNIQ,
				DoUpdates:    clause.Assignments(map[string]interface{}{"count": gorm.Expr("daily_error_counts.count + excluded.count")}),
			}).Create(&dailyErrorCount).Error; err != nil {
				return e.Wrap(err, "error getting or creating daily error count")
			}
		}

		// put errors in db
		putErrorsToDBSpan, _ := tracer.StartSpanFromContext(ctx, "public-graph.pushPayload",
			tracer.ResourceName("db.errors"), tracer.Tag("project_id", projectID))
		groups := make(map[int]struct {
			Group      *model.ErrorGroup
			VisitedURL string
			SessionObj *model.Session
		})
		for _, v := range errors {
			traceBytes, err := json.Marshal(v.StackTrace)
			if err != nil {
				log.Errorf("Error marshaling trace: %v", v.StackTrace)
				continue
			}
			traceString := string(traceBytes)

			errorToInsert := &model.ErrorObject{
				ProjectID:    projectID,
				SessionID:    sessionID,
				Environment:  sessionObj.Environment,
				Event:        v.Event,
				Type:         v.Type,
				URL:          v.URL,
				Source:       v.Source,
				LineNumber:   v.LineNumber,
				ColumnNumber: v.ColumnNumber,
				OS:           sessionObj.OSName,
				Browser:      sessionObj.BrowserName,
				StackTrace:   &traceString,
				Timestamp:    v.Timestamp,
				Payload:      v.Payload,
				RequestID:    nil,
				IsBeacon:     isBeacon,
			}

			//create error fields array
			metaFields := []*model.ErrorField{}
			metaFields = append(metaFields, &model.ErrorField{ProjectID: projectID, Name: "browser", Value: sessionObj.BrowserName})
			metaFields = append(metaFields, &model.ErrorField{ProjectID: projectID, Name: "os_name", Value: sessionObj.OSName})
			metaFields = append(metaFields, &model.ErrorField{ProjectID: projectID, Name: "visited_url", Value: errorToInsert.URL})
			metaFields = append(metaFields, &model.ErrorField{ProjectID: projectID, Name: "event", Value: errorToInsert.Event})
			group, err := s.Resolver.HandleErrorAndGroup(errorToInsert, "", v.StackTrace, metaFields, projectID)
			if err != nil {
				log.Errorf("Error updating error group: %v", errorToInsert)
				continue
			}

			groups[group.ID] = struct {
				Group      *model.ErrorGroup
				VisitedURL string
				SessionObj *model.Session
			}{Group: group, VisitedURL: errorToInsert.URL, SessionObj: sessionObj}
		}

		for _, data := range groups {
			s.Resolver.SendErrorAlert(data.Group.ProjectID, data.SessionObj, data.Group, data.VisitedURL)
		}

		putErrorsToDBSpan.Finish()
		return nil
	})

	return g.Wait()
}

func (s *Processor) submitFrontendNetworkMetric(ctx context.Context, sessionObj *model.Session, resources []NetworkResource) error {
	for _, re := range resources {
		mg := &model.MetricGroup{
			GroupName: re.RequestResponsePairs.Request.ID,
			SessionID: sessionObj.ID,
			ProjectID: sessionObj.ProjectID,
		}
		if err := s.DB.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "group_name"}, {Name: "session_id"}},
			DoNothing: true,
		}).Where(&model.MetricGroup{GroupName: mg.GroupName, SessionID: sessionObj.ID}).FirstOrCreate(&mg).Error; err != nil {
			return err
		}

		for key, value := range map[modelInputs.NetworkRequestAttribute]float64{
			modelInputs.NetworkRequestAttributeBodySize:     float64(re.EncodedBodySize),
			modelInputs.NetworkRequestAttributeResponseSize: float64(re.RequestResponsePairs.Response.Size),
			modelInputs.NetworkRequestAttributeStatus:       float64(re.RequestResponsePairs.Response.Status),
			modelInputs.NetworkRequestAttributeLatency:      float64((time.Millisecond * time.Duration(re.ResponseEnd-re.StartTime)).Nanoseconds()),
		} {
			mg.Metrics = append(mg.Metrics, &model.Metric{
				MetricGroupID: mg.ID,
				Name:          key.String(),
				Value:         value,
			})
		}
		for key, value := range map[modelInputs.NetworkRequestAttribute]string{
			modelInputs.NetworkRequestAttributeURL:       re.Name,
			modelInputs.NetworkRequestAttributeMethod:    re.RequestResponsePairs.Request.Method,
			modelInputs.NetworkRequestAttributeRequestID: re.RequestResponsePairs.Request.ID,
		} {
			mg.Metrics = append(mg.Metrics, &model.Metric{
				MetricGroupID: mg.ID,
				Name:          key.String(),
				Category:      value,
			})
		}
		if err := s.DB.Create(&mg.Metrics).Error; err != nil {
			return err
		}
	}
	return nil
}
