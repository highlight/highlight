package parse

import (
	"context"
	"encoding/json"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/go-test/deep"
	"github.com/kylelemons/godebug/pretty"
)

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

func (u fetcherMock) fetchStylesheetData(href string) ([]byte, error) {
	return []byte("/*highlight-inject*/\n.highlight {\n    color: black;\n}"), nil
}

func TestInjectStyleSheets(t *testing.T) {
	// Get sample input of events and serialize.
	fetch = fetcherMock{}
	inputBytes, err := os.ReadFile("./sample-events/input.json")
	if err != nil {
		t.Fatalf("error reading: %v", err)
	}

	snapshot, err := NewSnapshot(inputBytes)
	if err != nil {
		t.Fatalf("error parsing: %v", err)
	}

	// Pass sample set to `injectStylesheets` and convert to interface.
	err = snapshot.InjectStylesheets()
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

	snapshot, err := NewSnapshot(inputBytes)
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
