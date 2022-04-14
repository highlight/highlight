package kafka_queue

import (
	"encoding/json"
	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"testing"
	"time"
)

const (
	workers          = 8
	submitsPerWorker = 1024
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

	kafkaP, err := MakeProducer()
	if err != nil {
		b.Fatalf("error creating producer: %v", err)
	}
	kafkaC, err := MakeConsumer()
	if err != nil {
		b.Fatalf("error creating consumer: %v", err)
	}

	k := New("dev", kafkaP, kafkaC)

	for i := 0; i < workers; i++ {
		go func() {
			for j := 0; j < submitsPerWorker; j++ {
				k.Submit(&Message{
					Type: PushPayload,
					PushPayload: &PushPayloadArgs{
						SessionID: 0,
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
				}, 0)
			}
		}()
		go func() {
			for {
				msg := k.Receive()
				if msg.Type != PushPayload {
					b.Errorf("expected to consume dummy payload of PushPayload")
				}
				if msg.PushPayload.SessionID != -1 {
					b.Errorf("expected to consume dummy session -1")
				}
			}
		}()
	}
	time.Sleep(16 * time.Second)
	k.Stop()
}
