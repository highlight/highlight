package kafka_queue

import (
	"context"
	cryptorand "crypto/rand"
	"fmt"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"math/rand"
	"sync"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/segmentio/kafka-go"
	log "github.com/sirupsen/logrus"
)

const (
	writeWorkers     = 7
	readWorkers      = 5
	submitsPerWorker = 1024
	msgSizeBytes     = 1 * 1024 * 1024 // 1 MiB
)

func TestQueue_Submit(t *testing.T) {
	util.InDocker = "true"

	ctx := context.TODO()
	log.SetLevel(log.DebugLevel)
	log.WithContext(ctx).Infof("Starting submit test")

	rand.New(rand.NewSource(time.Now().UnixNano()))

	topic := fmt.Sprintf("topic-%s", util.GenerateRandomString(6))

	sendWg := sync.WaitGroup{}
	sendWg.Add(writeWorkers)

	recWg := sync.WaitGroup{}
	recWg.Add(readWorkers)

	writer := New(ctx, topic, Producer, nil)
	// wait for topic creation to complete
	time.Sleep(time.Second)
	writer.Stop(ctx)

	for i := 0; i < writeWorkers; i++ {
		go func(w int) {
			writer := New(ctx, topic, Producer, nil)

			dataBytes := make([]byte, msgSizeBytes)
			_, err := cryptorand.Read(dataBytes)
			if err != nil {
				log.WithContext(ctx).Error(err)
			}
			for j := 0; j < submitsPerWorker; j++ {
				err = writer.Submit(ctx, fmt.Sprintf("worker-%d", w), &Message{
					Type: PushPayload,
					PushPayload: &PushPayloadArgs{
						SessionSecureID: "",
						Events: model.ReplayEventsInput{
							Events: []*model.ReplayEventInput{{
								Type:      j,
								Timestamp: float64(time.Now().UnixMicro()),
								Data:      dataBytes,
							}},
						},
					},
				})
				if err != nil {
					log.WithContext(ctx).Error(err)
				}
			}

			log.WithContext(ctx).Infof("Sender %d finished. Stopping writer.", w)
			writer.Stop(ctx)

			sendWg.Done()
		}(i)
	}
	// wait for sender to create topic
	time.Sleep(time.Second)
	for i := 0; i < readWorkers; i++ {
		go func() {
			reader := New(ctx, topic, Consumer, &ConfigOverride{
				OnAssignGroups: func() {
					log.WithContext(ctx).Infof("Reader groups assigned.")
				},
			})

			var errors int64
			sids := map[string]int{}
			for errors < 3 {
				if len(sids) > 0 && lo.EveryBy(lo.Values(sids), func(sid int) bool { return sid >= submitsPerWorker }) {
					break
				}

				msg := reader.Receive(ctx)
				if msg == nil {
					t.Errorf("expected to get a message %+v", sids)
					errors++
					continue
				}
				assert.Equal(t, PushPayload, msg.GetType(), "expected to consume dummy payload of PushPayload")

				if _, ok := sids[string(msg.GetKafkaMessage().Key)]; !ok {
					sids[string(msg.GetKafkaMessage().Key)] = 0
				}

				sid := sids[string(msg.GetKafkaMessage().Key)]
				publicWorkerMessage, ok := msg.(*Message)
				payloadType := publicWorkerMessage.PushPayload.Events.Events[0].Type
				payloadTimeMicro := publicWorkerMessage.PushPayload.Events.Events[0].Timestamp
				payloadTime := time.UnixMicro(int64(payloadTimeMicro))
				assert.True(t, ok, "failed type assertion")
				assert.Equal(t, "", publicWorkerMessage.PushPayload.SessionSecureID, "expected to consume dummy session")
				assert.Equal(t, sid, payloadType)
				assert.True(t, payloadTime.After(time.Now().Add(-time.Hour)))
				assert.True(t, time.Now().After(payloadTime))

				sids[string(msg.GetKafkaMessage().Key)] += 1
			}
			recWg.Done()
		}()
	}
	log.WithContext(ctx).Infof("Waiting for senders to finish.")
	sendWg.Wait()
	log.WithContext(ctx).Infof("Waiting for receivers to finish.")
	recWg.Wait()
	log.WithContext(ctx).Infof("Receivers finished.")
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
