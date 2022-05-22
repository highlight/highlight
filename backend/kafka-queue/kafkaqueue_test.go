package kafka_queue

import (
	"fmt"
	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/segmentio/kafka-go"
	log "github.com/sirupsen/logrus"
	"math/rand"
	"sync"
	"testing"
	"time"
)

const (
	workers          = 24
	submitsPerWorker = 32
	msgSizeBytes     = 128 * 1000
)

func BenchmarkQueue_Submit(b *testing.B) {
	log.SetLevel(log.DebugLevel)
	log.Infof("Starting benchmark")

	rand.Seed(time.Now().UnixNano())

	writer := New("dev", Producer)
	reader := New("dev", Consumer)

	sendWg := sync.WaitGroup{}
	sendWg.Add(workers)

	recWg := sync.WaitGroup{}
	recWg.Add(workers)
	receive := true

	for i := 0; i < workers; i++ {
		go func(w int) {
			dataBytes := make([]byte, msgSizeBytes)
			for j := 0; j < submitsPerWorker; j++ {
				rand.Read(dataBytes)
				err := writer.Submit(&Message{
					Type: PushPayload,
					PushPayload: &PushPayloadArgs{
						SessionID: -1,
						Events: model.ReplayEventsInput{
							Events: []*model.ReplayEventInput{{
								Type:      0,
								Timestamp: 0,
								Sid:       0,
								Data:      dataBytes,
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
				if err != nil {
					log.Error(err)
				}
			}
			sendWg.Done()
		}(i)
		go func() {
			for receive {
				msg := reader.Receive()
				if msg == nil {
					if receive {
						b.Errorf("expected to get a message")
					}
					continue
				} else if msg.Type != PushPayload {
					b.Errorf("expected to consume dummy payload of PushPayload")
				} else if msg.PushPayload.SessionID != -1 {
					b.Errorf("expected to consume dummy session -1")
				}
			}
			recWg.Done()
		}()
	}
	log.Infof("Waiting for senders to finish.")
	sendWg.Wait()
	log.Infof("Senders finished. Stopping writer.")
	writer.Stop()
	log.Infof("Stopping receiving.")
	receive = false
	log.Infof("Waiting for receivers to finish.")
	recWg.Wait()
	log.Infof("Receivers finished. Stopping reader.")
	reader.Stop()
}

func TestPartitionKey(t *testing.T) {
	h := kafka.Hash{}
	partitions := make([]int, 768)
	partitionID := h.Balance(kafka.Message{
		Key:   []byte("37683927"),
		Value: []byte(""),
	}, partitions...)
	if partitionID != 730 {
		t.Fatalf("unexpected partition %d", partitionID)
	}
}
