package timeseries

import (
	"context"
	"github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"github.com/openlyinc/pointy"
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
	"session_id": true,
}

type Point struct {
	Measurement Measurement
	Time        time.Time
	Tags        map[string]string
	Fields      map[string]interface{}
}

type Result struct {
	Name   string
	Time   time.Time
	Value  *float64
	Values map[string]interface{}
}

type DB interface {
	GetBucket() string
	Write(points []Point)
	Query(ctx context.Context, query string) (results []*Result, e error)
}

type InfluxDB struct {
	Bucket   string
	client   influxdb2.Client
	writeAPI api.WriteAPI
	queryAPI api.QueryAPI
	errorsCh <-chan error
}

func New() *InfluxDB {
	org := os.Getenv("INFLUXDB_ORG")
	bucket := os.Getenv("INFLUXDB_BUCKET")
	server := os.Getenv("INFLUXDB_SERVER")
	token := os.Getenv("INFLUXDB_TOKEN")
	// initialize client
	client := influxdb2.NewClient(server, token)
	// Get non-blocking write client
	writeAPI := client.WriteAPI(org, bucket)
	// Get errors channel
	errorsCh := writeAPI.Errors()
	// Create go proc for reading and logging errors
	go func() {
		for err := range errorsCh {
			log.Errorf("influxdb write error: %s\n", err.Error())
		}
	}()
	// Get query client
	queryAPI := client.QueryAPI(org)
	return &InfluxDB{
		Bucket:   bucket,
		client:   client,
		writeAPI: writeAPI,
		queryAPI: queryAPI,
		errorsCh: errorsCh,
	}
}

func (i *InfluxDB) GetBucket() string {
	return i.Bucket
}

func (i *InfluxDB) Write(points []Point) {
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
		i.writeAPI.WritePoint(p)
	}
	// Force all unwritten data to be sent
	i.writeAPI.Flush()
}

func (i *InfluxDB) Query(ctx context.Context, query string) (results []*Result, e error) {
	result, err := i.queryAPI.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	for result.Next() {
		val := result.Record().Value()
		var v *float64
		if val != nil {
			v = pointy.Float64(val.(float64))
		}
		results = append(results, &Result{
			Name:   result.Record().Result(),
			Time:   result.Record().Time(),
			Value:  v,
			Values: result.Record().Values(),
		})
	}
	if err = result.Err(); err != nil {
		return nil, err
	}
	return
}

func (i *InfluxDB) Stop() {
	// Ensures background processes finishes
	i.client.Close()
}
