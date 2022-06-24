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

const (
	Metrics = "metrics"
)

var (
	EnvironmentPrefix string = func() string {
		prefix := os.Getenv("KAFKA_ENV_PREFIX")
		if len(prefix) > 0 {
			return prefix
		} else {
			return os.Getenv("DOPPLER_CONFIG")
		}
	}()
)

type Point struct {
	Measurement string
	Time        time.Time
	Tags        map[string]string
	Fields      map[string]interface{}
}

type DB interface {
	Write(points []Point)
	Query(ctx context.Context)
}

type InfluxDB struct {
	client   influxdb2.Client
	writeAPI api.WriteAPI
	queryAPI api.QueryAPI
	errorsCh <-chan error
}

func New() *InfluxDB {
	org := os.Getenv("INFLUXDB_ORG")
	// create per-dev-profile data bucket
	bucket := fmt.Sprintf("%s_%s", EnvironmentPrefix, os.Getenv("INFLUXDB_BUCKET"))
	// initialize client
	client := influxdb2.NewClient(os.Getenv("INFLUXDB_SERVER"), os.Getenv("INFLUXDB_TOKEN"))
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
		client:   client,
		writeAPI: writeAPI,
		queryAPI: queryAPI,
		errorsCh: errorsCh,
	}
}

func (i *InfluxDB) Write(points []Point) {
	for _, point := range points {
		p := influxdb2.NewPointWithMeasurement(point.Measurement)
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

func (i *InfluxDB) Query(ctx context.Context) {
	// TODO(vkorolik) not yet implemented
	// get QueryTableResult
	result, err := i.queryAPI.Query(ctx, `from(bucket:"my-bucket")|> range(start: -1h) |> filter(fn: (r) => r._measurement == "stat")`)
	if err == nil {
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
			fmt.Printf("query parsing error: %s\n", result.Err().Error())
		}
	} else {
		panic(err)
	}
}

func (i *InfluxDB) Stop() {
	// Ensures background processes finishes
	i.client.Close()
}
