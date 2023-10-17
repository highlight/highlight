package kafka_queue

import (
	"context"
	cryptorand "crypto/rand"
	"fmt"
	"math/rand"
	"sync"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/segmentio/kafka-go"
	log "github.com/sirupsen/logrus"
)

const (
	workers          = 24
	submitsPerWorker = 32
	msgSizeBytes     = 128 * 1000
)

func BenchmarkQueue_Submit(b *testing.B) {
	ctx := context.TODO()
	log.SetLevel(log.DebugLevel)
	log.WithContext(ctx).Infof("Starting benchmark")

	rand.New(rand.NewSource(time.Now().UnixNano()))

	writer := New(ctx, "dev", Producer, nil)
	reader := New(ctx, "dev", Consumer, nil)

	sendWg := sync.WaitGroup{}
	sendWg.Add(workers)

	recWg := sync.WaitGroup{}
	recWg.Add(workers)
	receive := true

	for i := 0; i < workers; i++ {
		go func(w int) {
			dataBytes := make([]byte, msgSizeBytes)
			for j := 0; j < submitsPerWorker; j++ {
				_, err := cryptorand.Read(dataBytes)
				if err != nil {
					log.WithContext(ctx).Error(err)
				}

				err = writer.Submit(ctx, fmt.Sprintf("test-%d", w), &Message{
					Type: PushPayload,
					PushPayload: &PushPayloadArgs{
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
						PayloadID:          nil,
					},
				})
				if err != nil {
					log.WithContext(ctx).Error(err)
				}
			}
			sendWg.Done()
		}(i)
		go func() {
			for receive {
				msg := reader.Receive(context.TODO())
				if msg == nil {
					if receive {
						b.Errorf("expected to get a message")
					}
					continue
				} else if msg.Type != PushPayload {
					b.Errorf("expected to consume dummy payload of PushPayload")
				} else if msg.PushPayload.SessionSecureID != "" {
					b.Errorf("expected to consume dummy session")
				}
			}
			recWg.Done()
		}()
	}
	log.WithContext(ctx).Infof("Waiting for senders to finish.")
	sendWg.Wait()
	log.WithContext(ctx).Infof("Senders finished. Stopping writer.")
	writer.Stop(ctx)
	log.WithContext(ctx).Infof("Stopping receiving.")
	receive = false
	log.WithContext(ctx).Infof("Waiting for receivers to finish.")
	recWg.Wait()
	log.WithContext(ctx).Infof("Receivers finished. Stopping reader.")
	reader.Stop(ctx)
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
