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
	SharedFSDirectory = os.Getenv("PROCESS_PAYLOAD_SHARED_FS")
)

const (
	EventsFile    = "events.json"
	MessagesFile  = "messages.json"
	ResourcesFile = "resources.json"
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

type ResourceMeta struct {
	SessionID int
	Resources string
	IsBeacon  bool
}

type Processor struct {
	DB   *gorm.DB
	Path string
}

func (s *Processor) Process(ctx context.Context, sessionObj *model.Session, events customModels.ReplayEventsInput, messages string, resources string, isBeacon bool) error {
	if len(SharedFSDirectory) > 0 {
		return s.processSessionPayloadSharedFS(ctx, sessionObj, events, messages, resources, isBeacon)
	} else {
		return s.processSessionPayloadSQL(ctx, sessionObj, events, messages, resources, isBeacon)
	}
}

func (s *Processor) prepareFSFile(file string) ([]byte, func(), error) {
	filePath := path.Join(s.Path, file)
	lockFilePath := fmt.Sprintf("%s.lock", filePath)
	fileLock := flock.New(lockFilePath)
	locked, err := fileLock.TryLock()
	if err != nil || !locked {
		return nil, nil, e.New("another worker is holding lock " + lockFilePath)
	}

	f, err := os.Open(filePath)
	if err != nil && !e.Is(err, os.ErrNotExist) {
		return nil, nil, err
	}
	var byteValue []byte
	if err == nil {
		defer f.Close()
		byteValue, err = ioutil.ReadAll(f)
		if err != nil {
			return nil, nil, err
		}
	}
	if byteValue == nil {
		byteValue = []byte("[]")
	}
	return byteValue, func() {
		unlockError := fileLock.Unlock()
		if unlockError != nil {
			log.Errorf("failed to unlock %s: %s", lockFilePath, unlockError)
		}
	}, nil
}

func (s *Processor) processSessionPayloadSharedFS(ctx context.Context, sessionObj *model.Session, events customModels.ReplayEventsInput, messages string, resources string, isBeacon bool) error {
	var g errgroup.Group
	projectID := sessionObj.ProjectID
	sessionID := sessionObj.ID
	hasBeacon := sessionObj.BeaconTime != nil
	s.Path = path.Join(SharedFSDirectory, strconv.Itoa(projectID), strconv.Itoa(sessionID))
	if err := os.MkdirAll(s.Path, 0755); err != nil {
		return e.Wrap(err, "failed to prepare session shared directory")
	}
	g.Go(func() error {
		byteValue, unlock, err := s.prepareFSFile(EventsFile)
		if err != nil {
			return e.Wrap(err, "failed to prepare fs file")
		}
		defer unlock()

		// extract json file data into events list
		var eventRows []*EventMeta
		if err := json.Unmarshal(byteValue, &eventRows); err != nil {
			return e.Wrap(err, "failed to unmarshall local session events file")
		}
		// only keep non-beacon events if this request is a beacon
		eventRows = lo.Filter(eventRows, func(v *EventMeta, i int) bool {
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
		eventRows = append(eventRows, &EventMeta{
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
		if err != nil {
			return e.Wrap(err, "failed to prepare fs file")
		}
		defer unlock()

		// extract json file data into messages list
		var messageRows []*MessageMeta
		if err := json.Unmarshal(byteValue, &messageRows); err != nil {
			return e.Wrap(err, "failed to unmarshall local session messages file")
		}
		// only keep non-beacon messages if this request is a beacon
		messageRows = lo.Filter(messageRows, func(v *MessageMeta, i int) bool {
			return !hasBeacon || !v.IsBeacon
		})
		// process new messages
		messagesParsed := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(messages), &messagesParsed); err != nil {
			return e.Wrap(err, "error decoding message data")
		}
		if len(messagesParsed["messages"]) > 0 {
			messageRows = append(messageRows, &MessageMeta{
				SessionID: sessionID,
				Messages:  messages,
				IsBeacon:  isBeacon,
			})
		}
		// write all messages back to file
		data, err := json.Marshal(&messageRows)
		if err != nil {
			return e.Wrap(err, "failed to marshall local session messages file")
		}
		if err := ioutil.WriteFile(path.Join(s.Path, MessagesFile), data, 0644); err != nil {
			return e.Wrap(err, "failed to write local session messages file")
		}
		return nil
	})
	g.Go(func() error {
		byteValue, unlock, err := s.prepareFSFile(ResourcesFile)
		if err != nil {
			return e.Wrap(err, "failed to prepare fs file")
		}
		defer unlock()

		// extract json file data into messages list
		var resourcesRows []*ResourceMeta
		if err := json.Unmarshal(byteValue, &resourcesRows); err != nil {
			return e.Wrap(err, "failed to unmarshall local session resources file")
		}
		// only keep non-beacon resources if this request is a beacon
		resourcesRows = lo.Filter(resourcesRows, func(v *ResourceMeta, i int) bool {
			return !hasBeacon || !v.IsBeacon
		})
		// process new resources
		resourcesParsed := make(map[string][]NetworkResource)
		if err := json.Unmarshal([]byte(resources), &resourcesParsed); err != nil {
			return e.Wrap(err, "error decoding resource data")
		}
		if len(resourcesParsed["resources"]) > 0 {
			if projectID == 1 {
				if err := s.submitFrontendNetworkMetric(ctx, sessionObj, resourcesParsed["resources"]); err != nil {
					return err
				}
			}
			resourcesRows = append(resourcesRows, &ResourceMeta{
				SessionID: sessionID,
				Resources: resources,
				IsBeacon:  isBeacon,
			})
		}
		// write all resources back to file
		data, err := json.Marshal(&resourcesRows)
		if err != nil {
			return e.Wrap(err, "failed to marshall local session resources file")
		}
		if err := ioutil.WriteFile(path.Join(s.Path, ResourcesFile), data, 0644); err != nil {
			return e.Wrap(err, "failed to write local session resources file")
		}
		return nil
	})

	return g.Wait()
}

func (s *Processor) processSessionPayloadSQL(ctx context.Context, sessionObj *model.Session, events customModels.ReplayEventsInput, messages string, resources string, isBeacon bool) error {
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

	return g.Wait()
}

func (s *Processor) submitFrontendNetworkMetric(_ context.Context, sessionObj *model.Session, resources []NetworkResource) error {
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
