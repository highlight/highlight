package parse

import (
	"context"
	"encoding/json"
	"os"
	"testing"
	"time"

	"gorm.io/gorm"

	"github.com/aws/smithy-go/ptr"
	"github.com/go-test/deep"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/kylelemons/godebug/pretty"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

var DB *gorm.DB
var redisClient *redis.Client

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO())
	var err error
	DB, err = util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}
	redisClient = redis.NewClient()
	code := m.Run()
	os.Exit(code)
}

func TestEventsFromString(t *testing.T) {
	tables := []struct {
		input         string
		wantStruct    *ReplayEvents
		wantInterface interface{}
	}{
		{
			`
			{
				"events": [{
					"data": {"test": 5},
					"timestamp": 0,
					"type": 4,
					"_sid": 1234
				}]
			}
			`,
			&ReplayEvents{Events: []*ReplayEvent{
				{
					Timestamp: time.Date(1970, time.Month(1), 1, 0, 0, 0, 0, time.UTC),
					Type:      Meta,
					Data:      map[string]interface{}{"test": 5},
					SID:       1234,
				},
			}},
			map[string][]map[string]interface{}{
				"events": {
					{
						"data": map[string]interface{}{
							"test": 5,
						},
						"timestamp": 0,
						"type":      4,
						"_sid":      1234,
					},
				},
			},
		},
		{
			`
			{
				"events": [{
					"timestamp": 0,
					"type": 2,
					"_sid": 5678
				}]
			}
			`,
			&ReplayEvents{Events: []*ReplayEvent{
				{
					Timestamp: time.Date(1970, time.Month(1), 1, 0, 0, 0, 0, time.UTC),
					Type:      FullSnapshot,
					SID:       5678,
				},
			}},
			map[string][]map[string]interface{}{
				"events": {
					{
						"timestamp": 0,
						"type":      2,
						"data":      nil,
						"_sid":      5678,
					},
				},
			},
		},
	}
	for i, tt := range tables {
		gotEvents, err := EventsFromString(tt.input)
		if err != nil {
			t.Errorf("error converting: %v", err)
			continue
		}
		// Assert that the unmarshaled struct is what we're expecting.
		got := *gotEvents
		want := *tt.wantStruct
		if diff := deep.Equal(got, want); diff != nil {
			t.Errorf("[%v]: \n:%v", i, diff)
		}
		// Assert that when we marshal back, we get the same string.
		marshaled, err := json.Marshal(gotEvents)
		if err != nil {
			t.Errorf("error marshaling: %v", err)
			continue
		}

		gotInterface := make(map[string]interface{})
		err = json.Unmarshal(marshaled, &gotInterface)
		if err != nil {
			t.Errorf("error unmarshaling: %v", err)
			continue
		}
		if diff := pretty.Compare(gotInterface, tt.wantInterface); diff != "" {
			t.Errorf("[%v]: \n%v", i, diff)
		}
	}
}

func TestGetHostUrlFromEvents(t *testing.T) {
	now := time.Now()

	var tests = []struct {
		events      []*ReplayEvent
		expectedUrl *string
	}{
		{
			events:      []*ReplayEvent{},
			expectedUrl: nil,
		},
		{
			events: []*ReplayEvent{
				{
					Timestamp:    now,
					Type:         2,
					Data:         map[string]interface{}{"href": "https://www.google.com"},
					TimestampRaw: 2,
					SID:          1,
				},
			},
			expectedUrl: nil,
		},
		{
			events: []*ReplayEvent{
				{
					Timestamp:    now,
					Type:         4,
					Data:         map[string]interface{}{"href": "https://www.google.com"},
					TimestampRaw: 2,
					SID:          1,
				},
			},
			expectedUrl: ptr.String("https://www.google.com"),
		},
		{
			events: []*ReplayEvent{
				{
					Timestamp:    now,
					Type:         4,
					Data:         map[string]interface{}{"href": "https://www.google.com?test=1#testHash"},
					TimestampRaw: 2,
					SID:          1,
				},
			},
			expectedUrl: ptr.String("https://www.google.com"),
		},
		{
			events: []*ReplayEvent{
				{
					Timestamp:    now,
					Type:         1,
					Data:         map[string]interface{}{"href": "https://www.google.com?test=1#testHash"},
					TimestampRaw: 2,
					SID:          1,
				},
				{
					Timestamp:    time.Date(1970, time.Month(1), 1, 1, 0, 0, 0, time.UTC),
					Type:         4,
					Data:         map[string]interface{}{"href": "https://www.google.com?test=1#testHash"},
					TimestampRaw: 2,
					SID:          1,
				},
			},
			expectedUrl: nil,
		},
		{
			events: []*ReplayEvent{
				{
					Timestamp:    time.Date(1970, time.Month(1), 1, 1, 0, 0, 0, time.UTC),
					Type:         4,
					Data:         map[string]interface{}{"href": "https://www.google.com?test=1#testHash"},
					TimestampRaw: 2,
					SID:          1,
				},
				{
					Timestamp:    now,
					Type:         1,
					Data:         map[string]interface{}{"href": "https://www.google.com?test=1#testHash"},
					TimestampRaw: 2,
					SID:          1,
				},
			},
			expectedUrl: ptr.String("https://www.google.com"),
		},
	}

	for _, tt := range tests {
		hostUrl := GetHostUrlFromEvents(tt.events)
		if tt.expectedUrl == nil {
			assert.Nil(t, hostUrl)
		} else {
			assert.Equal(t, *tt.expectedUrl, *hostUrl)
		}
	}
}
