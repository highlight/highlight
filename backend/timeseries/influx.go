package timeseries

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/hlog"
	"github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"github.com/influxdata/influxdb-client-go/v2/domain"
	log "github.com/sirupsen/logrus"
	"os"
	"time"
)

type Measurement string

const (
	Metrics Measurement = "metrics"
)

var IgnoredTags = map[string]bool{
	"group_name": true,
	"request_id": true,
}

type Point struct {
	Measurement Measurement
	Time        time.Time
	Tags        map[string]string
	Fields      map[string]interface{}
}

type Result struct {
	Name      string
	Time      time.Time
	Value     interface{}
	Values    map[string]interface{}
	TableName string
}

type DB interface {
	GetBucket(bucket string) string
	Write(bucket string, points []Point)
	Query(ctx context.Context, query string) (results []*Result, e error)
}

type InfluxDB struct {
	BucketPrefix string
	org          string
	orgID        string
	client       influxdb2.Client
	writeAPIs    map[string]api.WriteAPI
	queryAPI     api.QueryAPI
	messagesSent int
}

func New() *InfluxDB {
	org := os.Getenv("INFLUXDB_ORG")
	bucketPrefix := os.Getenv("INFLUXDB_BUCKET")
	server := os.Getenv("INFLUXDB_SERVER")
	token := os.Getenv("INFLUXDB_TOKEN")
	// initialize client
	client := influxdb2.NewClient(server, token)
	var orgID *string
	orgs, err := client.OrganizationsAPI().GetOrganizations(context.Background())
	if err != nil {
		log.Fatalf("failed to get influxdb organization")
	}
	orgID = (*orgs)[0].Id
	// Get query client
	queryAPI := client.QueryAPI(org)
	return &InfluxDB{
		BucketPrefix: bucketPrefix,
		org:          org,
		orgID:        *orgID,
		client:       client,
		writeAPIs:    make(map[string]api.WriteAPI),
		queryAPI:     queryAPI,
	}
}

func (i *InfluxDB) GetBucket(bucket string) string {
	return fmt.Sprintf("%s-%s", i.BucketPrefix, bucket)
}

func (i *InfluxDB) createWriteAPI(bucket string) api.WriteAPI {
	b := i.GetBucket(bucket)
	// ignore bucket already exists error
	_, _ = i.client.BucketsAPI().CreateBucketWithNameWithID(context.Background(), i.orgID, b, domain.RetentionRule{
		// 90 day metric expiry
		EverySeconds: int64((time.Hour * 24 * 90).Seconds()),
		Type:         domain.RetentionRuleTypeExpire,
	})
	// Get non-blocking write client
	writeAPI := i.client.WriteAPI(i.org, b)
	// Get errors channel
	errorsCh := writeAPI.Errors()
	// Create go proc for reading and logging errors
	go func() {
		for err := range errorsCh {
			log.Errorf("influxdb write error: %s\n", err.Error())
		}
	}()
	return writeAPI
}

func (i *InfluxDB) getWriteAPI(bucket string) api.WriteAPI {
	b := i.GetBucket(bucket)
	if _, ok := i.writeAPIs[b]; !ok {
		i.writeAPIs[b] = i.createWriteAPI(bucket)
	}
	return i.writeAPIs[b]
}

func (i *InfluxDB) Write(bucket string, points []Point) {
	start := time.Now()
	writeAPI := i.getWriteAPI(bucket)
	for _, point := range points {
		p := influxdb2.NewPointWithMeasurement(string(point.Measurement))
		for k, v := range point.Tags {
			if ok := IgnoredTags[k]; ok {
				continue
			}
			p = p.AddTag(k, v)
		}
		for k, v := range point.Fields {
			p = p.AddField(k, v)
		}
		p.SetTime(point.Time)
		// write asynchronously
		writeAPI.WritePoint(p)
	}
	// periodically flush messages
	if i.messagesSent%10000 == 0 {
		for _, w := range i.writeAPIs {
			// Force all unwritten data to be sent
			w.Flush()
		}
	}
	i.messagesSent++
	hlog.Incr("worker.influx.writeMessageCount", nil, 1)
	hlog.Histogram("worker.influx.writeSec", time.Since(start).Seconds(), nil, 1)
}

func (i *InfluxDB) Query(ctx context.Context, query string) (results []*Result, e error) {
	result, err := i.queryAPI.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	for result.Next() {
		r := &Result{
			Name:   result.Record().Result(),
			Time:   result.Record().Time(),
			Value:  result.Record().Value(),
			Values: result.Record().Values(),
		}
		if result.TableChanged() {
			r.TableName = result.TableMetadata().Column(0).DefaultValue()
		}
		results = append(results, r)
	}
	if err = result.Err(); err != nil {
		return nil, err
	}
	return
}

func (i *InfluxDB) Stop() {
	for _, w := range i.writeAPIs {
		// Force all unwritten data to be sent
		w.Flush()
	}
	// Ensures background processes finishes
	i.client.Close()
}
