package main

import (
	"context"
	"math/rand"
	"strconv"
	"time"

	goClickhouse "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/highlight-run/highlight/backend/clickhouse"
	log "github.com/sirupsen/logrus"
)

// CREATE database performance
// CREATE TABLE IF NOT EXISTS performance.logs
// (
//     Timestamp          DateTime64(9) CODEC (Delta, ZSTD(1)),
//     TraceId            String CODEC (ZSTD(1)),
//     SpanId             String CODEC (ZSTD(1)),
//     TraceFlags         UInt32 CODEC (ZSTD(1)),
//     SeverityText       LowCardinality(String) CODEC (ZSTD(1)),
//     SeverityNumber     Int32 CODEC (ZSTD(1)),
//     ServiceName        LowCardinality(String) CODEC (ZSTD(1)),
//     Body               String CODEC (ZSTD(1)),
//     ResourceAttributes Map(LowCardinality(String), String) CODEC (ZSTD(1)),
//     LogAttributes      Map(LowCardinality(String), String) CODEC (ZSTD(1)),
//     ProjectId          UInt32 CODEC (ZSTD(1)),
//     SecureSessionId    String CODEC (ZSTD(1)),
//     INDEX idx_trace_id          TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
//     INDEX idx_secure_session_id SecureSessionId TYPE bloom_filter(0.001) GRANULARITY 1,
//     INDEX idx_res_attr_key      mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
//     INDEX idx_res_attr_value    mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
//     INDEX idx_log_attr_key      mapKeys(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
//     INDEX idx_log_attr_value    mapValues(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
//     INDEX idx_body              Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
// )
//     ENGINE = MergeTree
//         PARTITION BY toDate(Timestamp)
//         ORDER BY (ProjectId, toUnixTimestamp(Timestamp), TraceId)
//         TTL toDateTime(Timestamp) + toIntervalDay(30)
//         SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;

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

func makeRandLogAttributes() map[string]string {
	randomKeys := [20]string{
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
		"imageparser",
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

func main() {
	options := &goClickhouse.Options{
		Addr: []string{"localhost:9000"},
		Auth: goClickhouse.Auth{
			Database: "performance",
			Username: "default",
			Password: "",
		},
		DialTimeout: time.Duration(10) * time.Second,
	}

	conn, err := goClickhouse.Open(options)

	client := &clickhouse.Client{
		Conn: conn,
	}

	if err != nil {
		log.Fatal("could not connect to performance db")
	}

	logRows := []*clickhouse.LogRow{}

	for i := 1; i < 1000; i++ {
		for j := 1; j < 1000; j++ {
			logRows = append(logRows, &clickhouse.LogRow{
				Timestamp:     makeRandTime(),
				ProjectId:     makeRandProjectId(),
				LogAttributes: makeRandLogAttributes(),
			})
		}

		err = client.BatchWriteLogRows(context.Background(), logRows)

		if err != nil {
			log.Fatalf("failed to write log row data: %v", err)
		}
	}
}

// Get all logs for a given project
// SELECT * from performance.logs where ProjectId = 1 order by Timestamp DESC
// Elapsed: 18.587 sec, read 94.60 million rows, 10.90 GB.

// Add a limit to the above query
// SELECT * from performance.logs where ProjectId = 1 order by Timestamp DESC LIMIT 100
// Elapsed: 1.775 sec, read 94.60 million rows, 10.90 GB.

// Get all facets for a given project
// SELECT arrayJoin(LogAttributes.keys) as keys, count() as cnt FROM performance.logs WHERE ProjectId = 1 GROUP BY keys ORDER BY cnt DESC;
// Elapsed: 1.178 sec, read 94.60 million rows, 1.44 GB.

// Query by one attribute
// SELECT * from performance.logs where ProjectId = 1 AND LogAttributes['key7'] = 'val4' order by Timestamp DESC
// Elapsed: 3.053 sec, read 93.92 million rows, 7.45 GB.

// Query by two attributes whereby one is fixed across all projects
// SELECT * from performance.logs where ProjectId = 1 AND LogAttributes['key7'] = 'val4' AND LogAttributes['user_id'] = '98' order by Timestamp DESC
// Elapsed: 3.177 sec, read 89.30 million rows, 4.44 GB

// Query by many attributes
// SELECT * from performance.logs where ProjectId = 1 AND LogAttributes['workspace_id'] = '60' AND LogAttributes['user_id'] = '28' AND LogAttributes['key8'] = 'val19'
// Elapsed: 1.897 sec, read 85.52 million rows, 4.33 GB

// Casting
// SELECT * from performance.logs where ProjectId = 1 AND LogAttributes['service_name'] = 'middleware' AND LogAttributes['workspace_id'] = '46' AND toInt8(LogAttributes['user_id']) > 1 order by Timestamp DESC LIMIT 100

// Wildcard search
// SELECT * from performance.logs where ProjectId = 1 AND LogAttributes['service_name'] LIKE '%middleware%' AND toInt8(LogAttributes['workspace_id']) < 99 AND toInt8(LogAttributes['user_id']) > 1 order by Timestamp DESC
// Elapsed: 3.051 sec, read 94.60 million rows, 6.09 GB

// Give me all the facets for this query
// SELECT arrayJoin(LogAttributes.keys) as keys, count() as cnt from performance.logs where ProjectId = 1 AND LogAttributes['service_name'] LIKE '%middleware%' AND toInt8(LogAttributes['workspace_id']) < 99 AND toInt8(LogAttributes['user_id']) > 1 GROUP BY keys ORDER BY cnt DESC
// Elapsed: 1.568 sec, read 94.60 million rows, 5.01 GB.
