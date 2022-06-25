package timeseries

import (
	"context"
	"fmt"
	"github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	log "github.com/sirupsen/logrus"
	"os"
	"time"
)

type Measurement string

const (
	Metrics Measurement = "metrics"
)

type Point struct {
	Measurement Measurement
	Time        time.Time
	Tags        map[string]string
	Fields      map[string]interface{}
}

type DB interface {
	Write(points []Point)
	Query(ctx context.Context, m Measurement) error
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

func (i *InfluxDB) Write(points []Point) {
	for _, point := range points {
		p := influxdb2.NewPointWithMeasurement(string(point.Measurement))
		for k, v := range point.Tags {
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

func (i *InfluxDB) Query(ctx context.Context, m Measurement) error {
	// TODO(vkorolik) not yet implemented
	// get QueryTableResult
	result, err := i.queryAPI.Query(ctx, fmt.Sprintf(`from(bucket:"%s")|> range(start: -1h) |> filter(fn: (r) => r._measurement == "%s")`, i.Bucket, m))
	if err != nil {
		return err
	}
	// Iterate over query response
	for result.Next() {
		// Notice when group key has changed
		if result.TableChanged() {
			fmt.Printf("table: %s\n", result.TableMetadata().String())
		}
		// Access data
		fmt.Printf("value: %v\n", result.Record().Value())
	}
	// check for an error
	if result.Err() != nil {
		log.Errorf("query parsing error: %s\n", result.Err().Error())
	}
	return nil
}

func (i *InfluxDB) Stop() {
	// Ensures background processes finishes
	i.client.Close()
}
