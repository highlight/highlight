package timeseries

import (
	"context"
	"fmt"
	"os"
	"sort"
	"sync"
	"time"

	"github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"github.com/influxdata/influxdb-client-go/v2/domain"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/hlog"
)

type Measurement string

type MeasurementConfig struct {
	Name                   Measurement
	AggName                Measurement
	DownsampleInterval     time.Duration
	DownsampleThreshold    time.Duration
	DownsampleRetention    time.Duration
	DownsampleBucketSuffix string
	Version                int
}

const Metrics Measurement = "metrics"
const Errors Measurement = "errors"

var Error = MeasurementConfig{
	Name:                   Errors,
	AggName:                Measurement(fmt.Sprintf("%s-aggregate-hour", Errors)),
	DownsampleInterval:     time.Hour,
	DownsampleThreshold:    time.Hour,
	DownsampleRetention:    0,
	DownsampleBucketSuffix: "/downsampled",
	Version:                2,
}

var Metric = MeasurementConfig{
	Name:                   Metrics,
	AggName:                Measurement(fmt.Sprintf("%s-aggregate-minute", Metrics)),
	DownsampleInterval:     time.Minute,
	DownsampleThreshold:    time.Hour,
	DownsampleRetention:    time.Hour * 24 * 90,
	DownsampleBucketSuffix: "/downsampled",
}

var Configs = map[Measurement]MeasurementConfig{
	"errors": Error, "metrics": Metric,
}

var IgnoredTags = map[string]bool{
	"group_name": true,
	"request_id": true,
	"project_id": true,
	"session_id": true,
}

type Point struct {
	Time   time.Time
	Tags   map[string]string
	Fields map[string]interface{}
}

type Result struct {
	Name      string
	Time      time.Time
	Value     interface{}
	Values    map[string]interface{}
	TableName string
}

type DB interface {
	GetBucket(bucket string, m Measurement) string
	GetSampledMeasurement(defaultBucket string, defaultMeasurement Measurement, timeRange time.Duration) (bucket string, m Measurement)
	Write(bucket string, m Measurement, points []Point)
	Query(ctx context.Context, query string) (results []*Result, e error)
}

type InfluxDB struct {
	BucketPrefix string
	org          string
	orgID        string
	Client       influxdb2.Client
	writeAPILock sync.Mutex
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
	client := influxdb2.NewClientWithOptions(server, token, influxdb2.DefaultOptions().SetHTTPRequestTimeout(60))
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
		Client:       client,
		writeAPIs:    make(map[string]api.WriteAPI),
		queryAPI:     queryAPI,
	}
}

func (i *InfluxDB) GetBucket(projectID string, measurement Measurement) string {
	switch measurement {
	case Configs["metrics"].Name:
		return fmt.Sprintf("%s-%s", i.BucketPrefix, projectID)
	case Configs["metrics"].AggName:
		return fmt.Sprintf("%s-%s/downsampled", i.BucketPrefix, projectID)
	case Configs["errors"].AggName:
		return fmt.Sprintf("%s-%s-errors/downsampled", i.BucketPrefix, projectID)
	}
	return fmt.Sprintf("%s-%s-%s", i.BucketPrefix, projectID, measurement)
}

func (i *InfluxDB) createWriteAPI(bucket string, measurement Measurement) api.WriteAPI {
	config := Configs[measurement]
	b := i.GetBucket(bucket, measurement)
	// ignore bucket already exists error
	_, _ = i.Client.BucketsAPI().CreateBucketWithNameWithID(context.Background(), i.orgID, b, domain.RetentionRule{
		// short data expiry for granular data since we will only store downsampled data long term
		EverySeconds: int64(config.DownsampleThreshold.Seconds()),
		Type:         domain.RetentionRuleTypeExpire,
	})
	// create a downsample bucket. ignore bucket already exists error
	downsampleB := b + config.DownsampleBucketSuffix
	_, _ = i.Client.BucketsAPI().CreateBucketWithNameWithID(context.Background(), i.orgID, downsampleB, domain.RetentionRule{
		// long term data expiry for downsampled data
		EverySeconds: int64(config.DownsampleRetention.Seconds()),
		Type:         domain.RetentionRuleTypeExpire,
	})
	taskName := fmt.Sprintf("task-%s", downsampleB)
	if config.Version > 1 {
		taskName = fmt.Sprintf("%s-v%d", taskName, config.Version)
	}
	tasks, err := i.Client.TasksAPI().FindTasks(context.Background(), &api.TaskFilter{
		Name:  taskName,
		OrgID: i.orgID,
		Limit: 1,
	})
	if err == nil && len(tasks) < 1 {
		// create a task to downsample data
		taskFlux := getDownsampleTask(b, downsampleB, taskName, config)
		_, _ = i.Client.TasksAPI().CreateTaskByFlux(context.Background(), taskFlux, i.orgID)
	}
	// since the create operation is not idempotent, check if we created duplicate tasks and clean up
	tasks, _ = i.Client.TasksAPI().FindTasks(context.Background(), &api.TaskFilter{
		Name:  taskName,
		OrgID: i.orgID,
	})
	if len(tasks) > 1 {
		sort.Slice(tasks, func(i, j int) bool {
			return tasks[i].CreatedAt.Sub(*tasks[j].CreatedAt) < time.Duration(0)
		})
		for _, t := range tasks[1:] {
			_ = i.Client.TasksAPI().DeleteTaskWithID(context.Background(), t.Id)
		}
	}
	for version := 1; version < config.Version; version++ {
		taskName := fmt.Sprintf("task-%s", downsampleB)
		if version > 1 {
			taskName = fmt.Sprintf("%s-v%d", taskName, version)
		}
		tasks, _ = i.Client.TasksAPI().FindTasks(context.Background(), &api.TaskFilter{
			Name:  taskName,
			OrgID: i.orgID,
		})
		for _, t := range tasks {
			_ = i.Client.TasksAPI().DeleteTaskWithID(context.Background(), t.Id)
		}
	}

	// Get non-blocking write client
	writeAPI := i.Client.WriteAPI(i.org, b)
	// Get errors channel
	errorsCh := writeAPI.Errors()
	// Create go proc for reading and logging errors
	go func() {
		for err := range errorsCh {
			log.Errorf("influxdb write error on %s: %s\n", b, err.Error())
		}
	}()
	return writeAPI
}

func (i *InfluxDB) getWriteAPI(bucket string, measurement Measurement) api.WriteAPI {
	i.writeAPILock.Lock()
	defer i.writeAPILock.Unlock()
	b := i.GetBucket(bucket, measurement)
	if _, ok := i.writeAPIs[b]; !ok {
		i.writeAPIs[b] = i.createWriteAPI(bucket, measurement)
	}
	return i.writeAPIs[b]
}

func (i *InfluxDB) Write(bucket string, measurement Measurement, points []Point) {
	start := time.Now()
	writeAPI := i.getWriteAPI(bucket, measurement)
	for _, point := range points {
		p := influxdb2.NewPointWithMeasurement(string(measurement))
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
	i.messagesSent += len(points)
	// periodically flush messages
	if i.messagesSent%10000 == 0 {
		for _, w := range i.writeAPIs {
			// Force all unwritten data to be sent
			w.Flush()
		}
	}
	hlog.Incr("worker.influx.writeCount", nil, 1)
	hlog.Histogram("worker.influx.writeMessageCount", float64(len(points)), nil, 1)
	hlog.Histogram("worker.influx.writeSec", time.Since(start).Seconds(), nil, 1)
}

// GetSampledMeasurement returns the bucket and measurement to query depending on the time range
func (i *InfluxDB) GetSampledMeasurement(defaultBucket string, defaultMeasurement Measurement, timeRange time.Duration) (bucket string, m Measurement) {
	config := Configs[defaultMeasurement]
	if timeRange >= config.DownsampleThreshold {
		return defaultBucket + config.DownsampleBucketSuffix, config.AggName
	}
	return defaultBucket, defaultMeasurement
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
	i.Client.Close()
}

func GetDownsampleQuery(bucket string, config MeasurementConfig, extraFilters string) string {
	switch config.Name {
	case Configs["errors"].Name:
		return fmt.Sprintf(`
import "join"

counts = from(bucket: "%[2]s")
		|> range(start: -%[1]dm)
		|> filter(fn: (r) => r._measurement == "%[3]s")
		|> filter(fn: (r) => r._field == "Identifier")
		%[5]s
		|> group(columns: ["%[4]s"])
		|> aggregateWindow(every: %[1]dm, fn: count)
		|> keep(columns: ["_measurement","_time","_field","_value", "%[4]s"])

sessionCounts = from(bucket: "%[2]s")
		|> range(start: -%[1]dm)
		|> filter(fn: (r) => r._measurement == "%[3]s")
		|> filter(fn: (r) => r._field == "Identifier")
		%[5]s
		|> unique(column: "SessionID")
		|> group(columns: ["%[4]s"])
		|> aggregateWindow(every: %[1]dm, fn: count)
		|> keep(columns: ["_measurement","_time","_field","_value", "%[4]s"])

identifierCounts = from(bucket: "%[2]s")
		|> range(start: -%[1]dm)
		|> filter(fn: (r) => r._measurement == "%[3]s")
		|> filter(fn: (r) => r._field == "Identifier")
		%[5]s
		|> unique()
		|> group(columns: ["%[4]s"])
		|> aggregateWindow(every: %[1]dm, fn: count)
		|> keep(columns: ["_measurement","_time","_field","_value", "%[4]s"])

environmentCounts = from(bucket: "%[2]s")
		|> range(start: -%[1]dm)
		|> filter(fn: (r) => r._measurement == "%[3]s")
		|> filter(fn: (r) => r._field == "Environment")
		%[5]s
		|> unique()
		|> group(columns: ["%[4]s"])
		|> aggregateWindow(every: %[1]dm, fn: count)
		|> keep(columns: ["_measurement","_time","_field","_value", "%[4]s"])

join.time(left: counts, right: sessionCounts, as: (l, r) => ({l with count: l._value, sessionCount: r._value}))
	|> join.time(right: identifierCounts, as: (l, r) => ({l with identifierCount: r._value}))
	|> join.time(right: environmentCounts, as: (l, r) => ({l with environmentCount: r._value}))
	`, int(config.DownsampleInterval.Minutes()), bucket, config.Name, "ErrorGroupID", extraFilters)
	}
	return fmt.Sprintf(`
		from(bucket: "%s")
			|> range(start: -%dm)
			|> filter(fn: (r) => r._measurement == "%s")
			|> aggregateWindow(every: %dm, fn: mean)
	`, bucket, int(config.DownsampleInterval.Minutes()), config.Name, int(config.DownsampleInterval.Minutes()))
}

func getDownsampleTask(bucket string, downsampleBucket string, taskName string, config MeasurementConfig) string {
	switch config.Name {
	case Configs["errors"].Name:
		return fmt.Sprintf(`
import "join"

option task = {name: "%[1]s", every: %[2]dm}
%[5]s
	|> set(key: "_measurement", value: "%[3]s")
	|> to(bucket: "%[4]s", fieldFn: (r) => ({"count": r.count, "sessionCount": r.sessionCount, "identifierCount": r.identifierCount, "environmentCount": r.environmentCount}))
	`, taskName, int(config.DownsampleInterval.Minutes()), config.AggName, downsampleBucket, GetDownsampleQuery(bucket, config, ""))
	}
	return fmt.Sprintf(`
		option task = {name: "%s", every: %dm}
%s
			|> set(key: "_measurement", value: "%s")
			|> to(bucket: "%s")
	`, taskName, int(config.DownsampleInterval.Minutes()), GetDownsampleQuery(bucket, config, ""), config.AggName, downsampleBucket)
}
