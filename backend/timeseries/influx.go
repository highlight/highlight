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
	"sort"
	"sync"
	"time"
)

type Measurement string

const (
	Metrics                 Measurement = "metrics"
	MetricsAggMinute        Measurement = "metrics-aggregate-minute"
	DownsampleInterval                  = time.Minute
	DownsampleThreshold                 = 60 * DownsampleInterval
	downsampledBucketSuffix string      = "/downsampled"
)

var IgnoredTags = map[string]bool{
	"group_name": true,
	"request_id": true,
	"session_id": true,
	"project_id": true,
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
	GetSampledMeasurement(defaultBucket string, defaultMeasurement Measurement, timeRange time.Duration) (bucket string, m Measurement)
	Write(bucket string, points []Point)
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

func (i *InfluxDB) GetBucket(bucket string) string {
	return fmt.Sprintf("%s-%s", i.BucketPrefix, bucket)
}

func (i *InfluxDB) createWriteAPI(bucket string) api.WriteAPI {
	b := i.GetBucket(bucket)
	// ignore bucket already exists error
	_, _ = i.Client.BucketsAPI().CreateBucketWithNameWithID(context.Background(), i.orgID, b, domain.RetentionRule{
		// short metric expiry for granular data since we will only store downsampled data long term
		EverySeconds: int64((DownsampleThreshold).Seconds()),
		Type:         domain.RetentionRuleTypeExpire,
	})
	// create a downsample bucket. ignore bucket already exists error
	downsampleB := b + downsampledBucketSuffix
	_, _ = i.Client.BucketsAPI().CreateBucketWithNameWithID(context.Background(), i.orgID, downsampleB, domain.RetentionRule{
		// 90 day metric expiry for downsampled data
		EverySeconds: int64((time.Hour * 24 * 90).Seconds()),
		Type:         domain.RetentionRuleTypeExpire,
	})
	taskName := fmt.Sprintf("task-%s", downsampleB)
	tasks, err := i.Client.TasksAPI().FindTasks(context.Background(), &api.TaskFilter{
		Name:  taskName,
		OrgID: i.orgID,
		Limit: 1,
	})
	if err == nil && len(tasks) < 1 {
		// create a task to downsample data
		_, _ = i.Client.TasksAPI().CreateTaskByFlux(context.Background(), fmt.Sprintf(`
		option task = {name: "%s", every: %dm}
		from(bucket: "%s")
			|> range(start: -task.every)
			|> filter(fn: (r) => r._measurement == "%s")
			|> aggregateWindow(every: %dm, fn: mean)
			|> set(key: "_measurement", value: "%s")
			|> to(bucket: "%s")
	`, taskName, int(DownsampleInterval.Minutes()), b, Metrics, int(DownsampleInterval.Minutes()), MetricsAggMinute, downsampleB), i.orgID)
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
	// Get non-blocking write client
	writeAPI := i.Client.WriteAPI(i.org, b)
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
	i.writeAPILock.Lock()
	defer i.writeAPILock.Unlock()
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

// GetSampledMeasurement returns the bucket and measurement to query depending on the time range
func (i *InfluxDB) GetSampledMeasurement(defaultBucket string, defaultMeasurement Measurement, timeRange time.Duration) (bucket string, m Measurement) {
	if timeRange > DownsampleThreshold {
		switch defaultMeasurement {
		case Metrics:
			return defaultBucket + downsampledBucketSuffix, MetricsAggMinute
		}
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
