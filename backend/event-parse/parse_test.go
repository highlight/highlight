package parse

import (
	"context"
	"encoding/json"
	"os"
	"strings"
	"testing"
	"time"

	"gorm.io/gorm"

	"github.com/aws/smithy-go/ptr"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"

	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/storage"
	"github.com/highlight-run/highlight/backend/util"

	"github.com/go-test/deep"
	"github.com/kylelemons/godebug/pretty"
)

var DB *gorm.DB

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO()).WithFields(log.Fields{"DB_HOST": os.Getenv("PSQL_HOST"), "DB_NAME": dbName})
	var err error
	DB, err = util.CreateAndMigrateTestDB(dbName)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}
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
					Data:      json.RawMessage(`{"test": 5}`),
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

type fetcherMock struct{}

func (u fetcherMock) fetchStylesheetData(href string, s *Snapshot) ([]byte, error) {
	body := []byte("@font-face {\n\tfont-display: swap;\n\tfont-family: 'Inter';\n\tfont-style: normal;\n\tfont-weight: bold;\n\tsrc: local('Inter Bold'), local('InterBold'),\n\t\turl('font/Inter-Bold.woff2') format('woff2'), url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bdu3f/BwAlfgctduB85QAAAABJRU5ErkJggg==\"), url(\"https://testing.psx-staging.energid.net/assets/fonts/roboto_medium_latin-ext.woff2\");\n}")
	body = replaceRelativePaths(body, href)
	body = append([]byte("/*highlight-inject*/\n"), body...)

	return body, nil
}

func TestInjectStyleSheets(t *testing.T) {
	// Get sample input of events and serialize.
	fetch = fetcherMock{}
	inputBytes, err := os.ReadFile("./sample-events/input.json")
	if err != nil {
		t.Fatalf("error reading: %v", err)
	}

	snapshot, err := NewSnapshot(inputBytes, nil)
	if err != nil {
		t.Fatalf("error parsing: %v", err)
	}

	// Pass sample set to `injectStylesheets` and convert to interface.
	err = snapshot.InjectStylesheets(context.TODO())
	if err != nil {
		t.Fatalf("error injecting: %v", err)
	}

	gotMsg, err := snapshot.Encode()
	if err != nil {
		t.Fatalf("error marshalling: %v", err)
	}

	var gotInterface interface{}
	err = json.Unmarshal(gotMsg, &gotInterface)
	if err != nil {
		t.Fatalf("error getting interface: %v", err)
	}

	// Get wanted output of events and serialize.
	wantBytes, err := os.ReadFile("./sample-events/output.json")
	if err != nil {
		t.Fatalf("error reading: %v", err)
	}
	var wantInterface interface{}
	err = json.Unmarshal(wantBytes, &wantInterface)
	if err != nil {
		t.Fatalf("error getting interface: %v", err)
	}

	// Compare.
	if diff := pretty.Compare(gotInterface, wantInterface); diff != "" {
		t.Errorf("(-got +want)\n%s", diff)
	}
}

func TestEscapeJavascript(t *testing.T) {
	inputBytes, err := os.ReadFile("./sample-events/dom-with-scripts.json")
	if err != nil {
		t.Fatalf("error reading: %v", err)
	}

	snapshot, err := NewSnapshot(inputBytes, nil)
	if err != nil {
		t.Fatalf("error parsing: %v", err)
	}

	err = snapshot.EscapeJavascript(context.TODO())
	if err != nil {
		t.Fatalf("error escaping: %v", err)
	}

	processed, err := snapshot.Encode()
	if err != nil {
		t.Fatalf("error marshalling: %v", err)
	}

	str := string(processed)
	if strings.Contains(str, "attack") {
		t.Errorf("attack substring not escaped %+v", str)
	}
}

func TestSnapshot_ReplaceAssets(t *testing.T) {
	util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
		ctx := context.TODO()
		inputBytes, err := os.ReadFile("./sample-events/input.json")
		if err != nil {
			t.Fatalf("error reading: %v", err)
		}

		snapshot, err := NewSnapshot(inputBytes, nil)
		if err != nil {
			t.Fatalf("error parsing: %v", err)
		}

		var storageClient storage.Client
		if storageClient, err = storage.NewFSClient(ctx, "https://test.highlight.io", "/tmp/test"); err != nil {
			log.WithContext(ctx).Fatalf("error creating filesystem storage client: %v", err)
		}
		if err := snapshot.ReplaceAssets(ctx, 1, storageClient, DB, redis.NewClient(), modelInputs.RetentionPeriodThreeMonths); err != nil {
			t.Fatalf("failed to replace assets %+v", err)
		}

		var assets []*model.SavedAsset
		if err := DB.Model(&model.SavedAsset{}).Find(&assets).Error; err != nil {
			t.Fatalf("failed to fetch assets %+v", err)
		}

		// broken asset "https://static.highlight.io/dev/test.mp4?AWSAccessKeyId=asdffdsa1234"
		// should not be stored
		assert.Equal(t, 3, len(assets))
		for _, exp := range []string{
			// check that we store <link> tags with an href
			"https://unpkg.com/@highlight-run/rrweb@0.9.27/dist/index.css",
			"https://static.highlight.io/dev/BigBuckBunny.mp4?AWSAccessKeyId=asdffdsa1234",
			"https://static.highlight.io/v6.2.0/index.js",
		} {
			matched := false
			for _, asset := range assets {
				if asset.OriginalUrl == exp {
					matched = true
					break
				}
			}
			assert.True(t, matched, "no asset matched %s", exp)
		}
	})
}
func TestSnapshot_ReplaceAssets_Capacitor(t *testing.T) {
	util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
		ctx := context.TODO()
		inputBytes, err := os.ReadFile("./sample-events/capacitor.json")
		if err != nil {
			t.Fatalf("error reading: %v", err)
		}

		snapshot, err := NewSnapshot(inputBytes, nil)
		if err != nil {
			t.Fatalf("error parsing: %v", err)
		}

		var storageClient storage.Client
		if storageClient, err = storage.NewFSClient(ctx, "https://test.highlight.io", "/tmp/test"); err != nil {
			log.WithContext(ctx).Fatalf("error creating filesystem storage client: %v", err)
		}
		if err := snapshot.ReplaceAssets(ctx, 33914, storageClient, DB, redis.NewClient(), modelInputs.RetentionPeriodThreeMonths); err != nil {
			t.Fatalf("failed to replace assets %+v", err)
		}

		var assets []*model.SavedAsset
		if err := DB.Model(&model.SavedAsset{}).Find(&assets).Error; err != nil {
			t.Fatalf("failed to fetch assets %+v", err)
		}

		assert.Equal(t, 21, len(assets))
		for _, exp := range []string{
			"capacitor://localhost/fonts/KFOmCnqEu92Fr1Mu4mxM.f1e2a767.woff",
			"capacitor://localhost/icons/favicon-128x128.png",
		} {
			var savedAsset *model.SavedAsset
			for _, asset := range assets {
				if asset.OriginalUrl == exp {
					savedAsset = asset
					break
				}
			}
			assert.NotNilf(t, savedAsset, "no asset matched %s", exp)
			if savedAsset != nil {
				assert.Falsef(t, strings.HasPrefix(savedAsset.HashVal, "Err"), "asset fetch errored %s", exp)
			}
		}
	})
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
					Data:         []byte("{\"href\": \"https://www.google.com\"}"),
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
					Data:         []byte("{\"href\": \"https://www.google.com\"}"),
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
					Data:         []byte("{\"href\": \"https://www.google.com?test=1#testHash\"}"),
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
					Data:         []byte("{\"href\": \"https://www.google.com?test=1#testHash\"}"),
					TimestampRaw: 2,
					SID:          1,
				},
				{
					Timestamp:    time.Date(1970, time.Month(1), 1, 1, 0, 0, 0, time.UTC),
					Type:         4,
					Data:         []byte("{\"href\": \"https://www.google.com?test=1#testHash\"}"),
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
					Data:         []byte("{\"href\": \"https://www.google.com?test=1#testHash\"}"),
					TimestampRaw: 2,
					SID:          1,
				},
				{
					Timestamp:    now,
					Type:         1,
					Data:         []byte("{\"href\": \"https://www.google.com?test=1#testHash\"}"),
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
