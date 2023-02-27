package main

import (
	"context"
	"math/rand"
	"strconv"
	"time"

	"github.com/highlight-run/highlight/backend/clickhouse"
	log "github.com/sirupsen/logrus"
)

func makeRandTime() time.Time {
	now := time.Now()

	randomTimes := [3]time.Time{
		now.Add(-time.Hour * 72),
		now.Add(-time.Hour * 144),
		now,
	}

	return randomTimes[rand.Intn(len(randomTimes))]
}

func makeRandProjectId() uint32 {
	projectIDs := make([]uint32, 0)
	projectIDs = append(projectIDs, 1, 2, 3, 4, 5)
	return projectIDs[rand.Intn(len(projectIDs))]
}

var letterRunes = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func makeRandomBody() string {
	b := make([]rune, 30)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}

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

// Run via
// `doppler run -- go run backend/clickhouse/seeds/main.go“
func main() {
	ctx := context.Background()
	client, err := clickhouse.NewClient(clickhouse.PrimaryDatabase)

	if err != nil {
		log.WithContext(ctx).Fatal("could not connect to clickhouse db")
	}

	for i := 1; i < 100; i++ {
		logRows := []*clickhouse.LogRow{}
		for j := 1; j < 100; j++ {
			logRows = append(logRows, &clickhouse.LogRow{
				Timestamp:     makeRandTime(),
				ProjectId:     makeRandProjectId(),
				Body:          makeRandomBody(),
				LogAttributes: makeRandLogAttributes(),
				SeverityText:  makeRandomSeverityText(),
			})
		}
		err = client.BatchWriteLogRows(context.Background(), logRows)

		if err != nil {
			log.WithContext(ctx).Fatalf("failed to write log row data: %v", err)
		}
	}
}
