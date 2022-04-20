package kafka_queue

import (
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"sync"
	"testing"
)

const (
	workers          = 1024
	submitsPerWorker = 128
)

func BenchmarkQueue_Submit(b *testing.B) {
	log.Infof("Starting benchmark")
	inputBytes, err := ioutil.ReadFile("../event-parse/sample-events/input.json")
	if err != nil {
		b.Fatalf("error reading: %v", err)
	}
	var inputMsg json.RawMessage
	err = json.Unmarshal(inputBytes, &inputMsg)
	if err != nil {
		b.Fatalf("error unmarshaling: %v", err)
	}

	writer := New("dev", Producer)
	reader := New("dev", Consumer)

	sendWg := sync.WaitGroup{}
	sendWg.Add(workers)

	recWg := sync.WaitGroup{}
	recWg.Add(workers)
	receive := true

	for i := 0; i < workers; i++ {
		go func(w int) {
			for j := 0; j < submitsPerWorker; j++ {
				_ = writer.Submit(&Message{
					Type: PushPayload,
					PushPayload: &PushPayloadArgs{
						SessionID: -1,
						Events: model.ReplayEventsInput{
							Events: []*model.ReplayEventInput{{
								Type:      0,
								Timestamp: 0,
								Sid:       0,
								Data:      inputMsg,
							}},
						},
						Messages:           "",
						Resources:          "",
						Errors:             nil,
						IsBeacon:           nil,
						HasSessionUnloaded: nil,
						HighlightLogs:      nil,
					},
				}, fmt.Sprintf("test-%d", w))
			}
			sendWg.Done()
		}(i)
		go func() {
			for receive {
				msg := reader.Receive()
				if msg == nil {
					b.Errorf("expected to get a message")
					continue
				}
				if msg.Type != PushPayload {
					b.Errorf("expected to consume dummy payload of PushPayload")
				}
				if msg.PushPayload.SessionID != -1 {
					b.Errorf("expected to consume dummy session -1")
				}
			}
			recWg.Done()
		}()
	}
	sendWg.Wait()
	writer.Stop()
	receive = false
	recWg.Wait()
	reader.Stop()
}
