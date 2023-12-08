package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/hasura/go-graphql-client"
	"github.com/samber/lo"
	"golang.org/x/oauth2/clientcredentials"
)

// Make sure Datasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler interfaces. Plugin should not implement all these
// interfaces - only those which are required for a particular task.
var (
	_ backend.QueryDataHandler      = (*Datasource)(nil)
	_ backend.CheckHealthHandler    = (*Datasource)(nil)
	_ instancemgmt.InstanceDisposer = (*Datasource)(nil)
)

// NewDatasource creates a new datasource instance.
func NewDatasource(ctx context.Context, settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	opts, err := settings.HTTPClientOptions(ctx)
	if err != nil {
		return nil, fmt.Errorf("http client options: %w", err)
	}

	opts.ForwardHTTPHeaders = true

	var dataSourceSettings DataSourceSettings
	err = json.Unmarshal(settings.JSONData, &dataSourceSettings)
	if err != nil {
		return nil, err
	}

	clientSecret := settings.DecryptedSecureJSONData["clientSecret"]

	config := clientcredentials.Config{
		ClientID:     dataSourceSettings.ClientId,
		ClientSecret: clientSecret,
		TokenURL:     "https://1b2278611b17.ngrok.app/oauth/token",
	}

	client := graphql.NewClient("https://1b2278611b17.ngrok.app/private", config.Client(ctx))

	return &Datasource{Client: client}, nil
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	Client *graphql.Client
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *Datasource) Dispose() {
	// Clean up datasource instance resources.
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	// create response struct
	response := backend.NewQueryDataResponse()

	// loop over queries and execute them individually.
	for _, q := range req.Queries {
		res := d.query(ctx, req.PluginContext, q)

		// save the response in a hashmap
		// based on with RefID as identifier
		response.Responses[q.RefID] = res
	}

	return response, nil
}

type queryModel struct{}

type queryInput struct {
	Table     string
	Column    string
	GroupBy   []string
	Metric    string
	QueryText string
}

type MetricAggregator string

const (
	MetricAggregatorCount            MetricAggregator = "Count"
	MetricAggregatorCountDistinctKey MetricAggregator = "CountDistinctKey"
	MetricAggregatorMin              MetricAggregator = "Min"
	MetricAggregatorAvg              MetricAggregator = "Avg"
	MetricAggregatorP50              MetricAggregator = "P50"
	MetricAggregatorP90              MetricAggregator = "P90"
	MetricAggregatorP95              MetricAggregator = "P95"
	MetricAggregatorP99              MetricAggregator = "P99"
	MetricAggregatorMax              MetricAggregator = "Max"
	MetricAggregatorSum              MetricAggregator = "Sum"
)

type TracesMetricColumn string

const (
	TracesMetricColumnDuration    TracesMetricColumn = "Duration"
	TracesMetricColumnMetricValue TracesMetricColumn = "MetricValue"
)

type TracesMetricBucket struct {
	BucketID    uint64             `json:"bucket_id" graphql:"bucket_id"`
	Group       []string           `json:"group" graphql:"group"`
	Column      TracesMetricColumn `json:"column" graphql:"column"`
	MetricType  MetricAggregator   `json:"metric_type" graphql:"metric_type"`
	MetricValue float64            `json:"metric_value" graphql:"metric_value"`
}

type TracesMetrics struct {
	Buckets      []*TracesMetricBucket `json:"buckets" graphql:"buckets"`
	BucketCount  uint64                `json:"bucket_count" graphql:"bucket_count"`
	SampleFactor float64               `json:"sample_factor" graphql:"sample_factor"`
}

type DateRangeRequiredInput struct {
	StartDate time.Time `json:"start_date" graphql:"start_date"`
	EndDate   time.Time `json:"end_date" graphql:"end_date"`
}

type QueryInput struct {
	Query     string                  `json:"query" graphql:"query"`
	DateRange *DateRangeRequiredInput `json:"date_range" graphql:"date_range"`
}

type DataSourceSettings struct {
	ClientId  string `json:"clientID"`
	ProjectId int    `json:"projectID"`
}

type DataSourceSecureSettings struct {
	ClientSecret string `json:"clientSecret"`
}

type ID string

func (d *Datasource) query(ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	from := query.TimeRange.From
	to := query.TimeRange.To

	var input queryInput
	err := json.Unmarshal(query.JSON, &input)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("json unmarshal: %v", err.Error()))
	}

	var dataSourceSettings DataSourceSettings
	err = json.Unmarshal(pCtx.DataSourceInstanceSettings.JSONData, &dataSourceSettings)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("json unmarshal: %v", err.Error()))
	}

	var q struct {
		TracesMetrics TracesMetrics `graphql:"traces_metrics(project_id: $project_id, params: $params, column: $column, metric_types: $metric_types, group_by: $group_by)"`
	}

	err = d.Client.Query(ctx, &q, map[string]interface{}{
		"project_id":   ID(strconv.Itoa(dataSourceSettings.ProjectId)),
		"metric_types": []MetricAggregator{MetricAggregator(input.Metric)},
		"group_by":     input.GroupBy,
		"params": QueryInput{
			Query: input.QueryText,
			DateRange: &DateRangeRequiredInput{
				StartDate: from,
				EndDate:   to,
			},
		},
		"column": TracesMetricColumn(input.Column),
	})
	if err != nil {
		return backend.DataResponse{Error: err}
	}

	bucketIds := []uint64{}
	for i := uint64(0); i < q.TracesMetrics.BucketCount; i++ {
		bucketIds = append(bucketIds, i)
	}

	frame := data.NewFrame("response")

	timeValues := lo.Map(bucketIds, func(i uint64, _ int) time.Time {
		return from.Add(
			time.Duration(float64(i) / float64(q.TracesMetrics.BucketCount) * float64(to.Sub(from))))
	})

	frame.Fields = append(frame.Fields, data.NewField("time", nil, timeValues))

	metricTypes := lo.Uniq(lo.Map(q.TracesMetrics.Buckets, func(bucket *TracesMetricBucket, _ int) MetricAggregator {
		return bucket.MetricType
	}))

	metricGroups := lo.Uniq(lo.Map(q.TracesMetrics.Buckets, func(bucket *TracesMetricBucket, _ int) string {
		return strings.Join(bucket.Group, "-")
	}))

	for _, metricType := range metricTypes {
		for _, metricGroup := range metricGroups {
			values := make([]float64, q.TracesMetrics.BucketCount)
			for _, bucket := range q.TracesMetrics.Buckets {
				if bucket.MetricType != metricType || strings.Join(bucket.Group, "-") != metricGroup {
					continue
				}

				values[bucket.BucketID] = bucket.MetricValue
			}

			frame.Fields = append(frame.Fields, data.NewField(string(metricType)+"."+metricGroup, nil, values))
		}
	}

	var response backend.DataResponse

	response.Frames = append(response.Frames, frame)

	return response
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *Datasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	var status = backend.HealthStatusOk
	var message = "Data source is working"

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}
