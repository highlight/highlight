package main

import (
	"context"
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"github.com/highlight-run/highlight/backend/clickhouse"
	log "github.com/sirupsen/logrus"
)

func makeRandLogAttributes() map[string]string {
	randomKeys := [21]string{
		"key1",
		"key2",
		"key3",
		"key4",
		"key5",
		"key6",
		"key7",
		"key8",
		"key9",
		"key10",
		"key11",
		"key12",
		"key13",
		"key14",
		"key15",
		"key16",
		"key17",
		"key18",
		"key19",
		"key20",
		"deeply.nested.log.value",
	}

	randomVals := [20]string{
		"val1",
		"val2",
		"val3",
		"val4",
		"val5",
		"val6",
		"val7",
		"val8",
		"val9",
		"val10",
		"val11",
		"val12",
		"val13",
		"val14",
		"val15",
		"val16",
		"val17",
		"val18",
		"val19",
		"val20",
	}

	randomServices := [6]string{
		"backend",
		"frontend",
		"middleware",
		"logger",
		"image parser",
		"flounder",
	}

	logAttributes := map[string]string{}

	randomKey := randomKeys[rand.Intn(len(randomKeys))]
	randomVal := randomVals[rand.Intn(len(randomVals))]
	randomService := randomServices[rand.Intn(len(randomServices))]

	logAttributes["workspace_id"] = strconv.Itoa(rand.Intn(100))
	logAttributes["user_id"] = strconv.Itoa(rand.Intn(100))
	logAttributes["service_name"] = randomService
	logAttributes[randomKey] = randomVal

	return logAttributes
}

func makeRandomSeverityText() string {
	severities := [6]string{
		"trace",
		"debug",
		"info",
		"warn",
		"error",
		"fatal",
	}

	return severities[rand.Intn(len(severities))]
}

func makeRandomTraceID() string {
	spanIDs := [6]string{
		"",
		"trace_1",
		"trace_2",
		"trace_3",
	}
	return spanIDs[rand.Intn(len(spanIDs))]
}

func makeRandomSpanID() string {
	spanIDs := [6]string{
		"",
		"span_1",
		"span_2",
		"span_3",
	}
	return spanIDs[rand.Intn(len(spanIDs))]
}

func makeRandomSecureSessionID() string {
	secureSessionIDs := [6]string{
		"",
		"secure_session_id_1",
		"secure_session_id_2",
		"secure_session_id_3",
	}
	return secureSessionIDs[rand.Intn(len(secureSessionIDs))]
}

// Run via
// `doppler run -- go run backend/clickhouse/seeds/main.go“
func main() {
	ctx := context.Background()
	client, err := clickhouse.NewClient(clickhouse.PrimaryDatabase)

	if err != nil {
		log.WithContext(ctx).Fatal("could not connect to clickhouse db")
	}

	now := time.Now()

	for i := 1; i < 10000; i++ {
		var logRows []*clickhouse.LogRow
		ts := now.Add(-time.Duration(i) * time.Second)

		logRows = append(logRows, clickhouse.NewLogRow(ts, 1,
			clickhouse.WithTraceID(makeRandomTraceID()),
			clickhouse.WithSpanID(makeRandomSpanID()),
			clickhouse.WithSecureSessionID(makeRandomSecureSessionID()),
			clickhouse.WithBody(ctx, fmt.Sprintf("Body %d", i)),
			clickhouse.WithLogAttributes(makeRandLogAttributes()),
			clickhouse.WithSeverityText(makeRandomSeverityText()),
		))
		err = client.BatchWriteLogRows(context.Background(), logRows)

		if err != nil {
			log.WithContext(ctx).Fatalf("failed to write log row data: %v", err)
		}
	}
}
