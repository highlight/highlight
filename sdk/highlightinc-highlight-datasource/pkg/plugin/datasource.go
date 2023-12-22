package plugin

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/hasura/go-graphql-client"
	"github.com/openlyinc/pointy"
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
	var dataSourceSettings DataSourceSettings
	if err := json.Unmarshal(settings.JSONData, &dataSourceSettings); err != nil {
		return nil, err
	}

	var httpClient *http.Client
	if dataSourceSettings.ClientId == "" {
		httpClient = http.DefaultClient
	} else {
		clientSecret := settings.DecryptedSecureJSONData["clientSecret"]

		config := clientcredentials.Config{
			ClientID:     dataSourceSettings.ClientId,
			ClientSecret: clientSecret,
			TokenURL:     dataSourceSettings.TokenURL,
		}

		httpClient = config.Client(context.Background())
	}

	graphqlClient := graphql.NewClient(dataSourceSettings.BackendURL, httpClient)

	return &Datasource{Client: graphqlClient}, nil
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

type QueryKey struct {
	Name string
	Type string
}

type KeyType string

const (
	KeyTypeString  KeyType = "String"
	KeyTypeNumeric KeyType = "Numeric"
)

func (d *Datasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	if req.Path != "traces-keys" && req.Path != "logs-keys" && req.Path != "errors-keys" && req.Path != "sessions-keys" {
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusNotFound,
		})
	}

	var dataSourceSettings DataSourceSettings
	err := json.Unmarshal(req.PluginContext.DataSourceInstanceSettings.JSONData, &dataSourceSettings)
	if err != nil {
		return err
	}

	u, err := url.Parse(req.URL)
	if err != nil {
		return err
	}

	queryParams := u.Query()

	query := queryParams.Get("query")
	keyType := KeyType(queryParams.Get("type"))

	vars := map[string]interface{}{
		"project_id": ID(strconv.Itoa(dataSourceSettings.ProjectId)),
		"date_range": DateRangeRequiredInput{
			StartDate: time.Now().AddDate(0, -1, 0),
			EndDate:   time.Now(),
		},
		"query": &query,
		"type":  &keyType,
	}

	var body []byte

	switch req.Path {
	case "traces-keys":
		var q struct {
			TracesKeys []QueryKey `graphql:"traces_keys(project_id: $project_id, date_range: $date_range, query: $query, type: $type)"`
		}

		err = d.Client.Query(ctx, &q, vars)
		if err != nil {
			return err
		}

		body, err = json.Marshal(q.TracesKeys)
		if err != nil {
			return err
		}

	case "logs-keys":
		var q struct {
			LogsKeys []QueryKey `graphql:"logs_keys(project_id: $project_id, date_range: $date_range, query: $query, type: $type)"`
		}

		err = d.Client.Query(ctx, &q, vars)
		if err != nil {
			return err
		}

		body, err = json.Marshal(q.LogsKeys)
		if err != nil {
			return err
		}

	case "errors-keys":
		var q struct {
			ErrorsKeys []QueryKey `graphql:"errors_keys(project_id: $project_id, date_range: $date_range, query: $query, type: $type)"`
		}

		err = d.Client.Query(ctx, &q, vars)
		if err != nil {
			return err
		}

		body, err = json.Marshal(q.ErrorsKeys)
		if err != nil {
			return err
		}

	case "sessions-keys":
		var q struct {
			SessionsKeys []QueryKey `graphql:"sessions_keys(project_id: $project_id, date_range: $date_range, query: $query, type: $type)"`
		}

		err = d.Client.Query(ctx, &q, vars)
		if err != nil {
			return err
		}

		body, err = json.Marshal(q.SessionsKeys)
		if err != nil {
			return err
		}
	}

	return sender.Send(&backend.CallResourceResponse{
		Status: http.StatusOK,
		Body:   body,
	})
}

type queryModel struct{}

type queryInput struct {
	Table           Table
	Column          string
	GroupBy         []string
	Metric          string
	QueryText       string
	BucketBy        string
	Limit           int
	LimitAggregator string
	LimitColumn     string
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

type MetricBucket struct {
	BucketID    uint64           `json:"bucket_id" graphql:"bucket_id"`
	Group       []string         `json:"group" graphql:"group"`
	Column      string           `json:"column" graphql:"column"`
	MetricType  MetricAggregator `json:"metric_type" graphql:"metric_type"`
	MetricValue float64          `json:"metric_value" graphql:"metric_value"`
}

type MetricsBuckets struct {
	Buckets      []*MetricBucket `json:"buckets" graphql:"buckets"`
	BucketCount  uint64          `json:"bucket_count" graphql:"bucket_count"`
	SampleFactor float64         `json:"sample_factor" graphql:"sample_factor"`
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
	ClientId   string `json:"clientID"`
	ProjectId  int    `json:"projectID"`
	TokenURL   string `json:"tokenURL"`
	BackendURL string `json:"backendURL"`
}

type DataSourceSecureSettings struct {
	ClientSecret string `json:"clientSecret"`
}

type ID string

type Admin struct {
	Id ID
}

type Table string

const (
	TableTraces   Table = "traces"
	TableLogs     Table = "logs"
	TableErrors   Table = "errors"
	TableSessions Table = "sessions"
)

func (d *Datasource) query(ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	from := query.TimeRange.From
	to := query.TimeRange.To

	var input queryInput
	err := json.Unmarshal(query.JSON, &input)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, err.Error())
	}

	var dataSourceSettings DataSourceSettings
	err = json.Unmarshal(pCtx.DataSourceInstanceSettings.JSONData, &dataSourceSettings)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, err.Error())
	}

	type TracesResult struct {
		TracesMetrics MetricsBuckets `graphql:"traces_metrics(project_id: $project_id, params: $params, column: $column, metric_types: $metric_types, group_by: $group_by, bucket_by: $bucket_by, limit: $limit, limit_aggregator: $limit_aggregator, limit_column: $limit_column)"`
	}

	type LogsResult struct {
		LogsMetrics MetricsBuckets `graphql:"logs_metrics(project_id: $project_id, params: $params, column: $column, metric_types: $metric_types, group_by: $group_by, bucket_by: $bucket_by, limit: $limit, limit_aggregator: $limit_aggregator, limit_column: $limit_column)"`
	}

	type ErrorsResult struct {
		ErrorsMetrics MetricsBuckets `graphql:"errors_metrics(project_id: $project_id, params: $params, column: $column, metric_types: $metric_types, group_by: $group_by, bucket_by: $bucket_by, limit: $limit, limit_aggregator: $limit_aggregator, limit_column: $limit_column)"`
	}

	type SessionsResult struct {
		SessionsMetrics MetricsBuckets `graphql:"sessions_metrics(project_id: $project_id, params: $params, column: $column, metric_types: $metric_types, group_by: $group_by, bucket_by: $bucket_by, limit: $limit, limit_aggregator: $limit_aggregator, limit_column: $limit_column)"`
	}

	var q any
	switch input.Table {
	case TableTraces:
		q = &TracesResult{}
	case TableLogs:
		q = &LogsResult{}
	case TableErrors:
		q = &ErrorsResult{}
	case TableSessions:
		q = &SessionsResult{}
	}

	var agg *MetricAggregator
	if input.LimitAggregator != "" {
		tmp := MetricAggregator(input.LimitAggregator)
		agg = &tmp
	}

	err = d.Client.Query(ctx, q, map[string]interface{}{
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
		"column":           input.Column,
		"bucket_by":        input.BucketBy,
		"limit":            &input.Limit,
		"limit_aggregator": agg,
		"limit_column":     &input.LimitColumn,
	})
	if err != nil {
		return backend.DataResponse{Error: err}
	}

	var result MetricsBuckets
	switch input.Table {
	case TableTraces:
		result = q.(*TracesResult).TracesMetrics
	case TableLogs:
		result = q.(*LogsResult).LogsMetrics
	case TableErrors:
		result = q.(*ErrorsResult).ErrorsMetrics
	case TableSessions:
		result = q.(*SessionsResult).SessionsMetrics
	}

	bucketIds := []uint64{}
	for i := uint64(0); i < result.BucketCount; i++ {
		bucketIds = append(bucketIds, i)
	}

	frame := data.NewFrame("response")

	timeValues := lo.Map(bucketIds, func(i uint64, _ int) time.Time {
		return from.Add(
			time.Duration(float64(i) / float64(result.BucketCount) * float64(to.Sub(from))))
	})

	if input.BucketBy != "None" {
		frame.Fields = append(frame.Fields, data.NewField("time", nil, timeValues))
	}

	metricTypes := lo.Uniq(lo.Map(result.Buckets, func(bucket *MetricBucket, _ int) MetricAggregator {
		return bucket.MetricType
	}))

	metricGroups := lo.Uniq(lo.Map(result.Buckets, func(bucket *MetricBucket, _ int) string {
		return strings.Join(bucket.Group, "-")
	}))

	for _, metricType := range metricTypes {
		for _, metricGroup := range metricGroups {
			values := make([]*float64, result.BucketCount)
			for _, bucket := range result.Buckets {
				if bucket.MetricType != metricType || strings.Join(bucket.Group, "-") != metricGroup {
					continue
				}

				values[bucket.BucketID] = pointy.Float64(bucket.MetricValue)
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
	var dataSourceSettings DataSourceSettings
	if err := json.Unmarshal(req.PluginContext.DataSourceInstanceSettings.JSONData, &dataSourceSettings); err != nil {
		return nil, err
	}

	var q struct {
		TracesMetrics MetricsBuckets `graphql:"traces_metrics(project_id: $project_id, params: $params, column: $column, metric_types: $metric_types, group_by: $group_by, bucket_by: $bucket_by)"`
	}

	if err := d.Client.Query(ctx, &q, map[string]interface{}{
		"project_id":   ID(strconv.Itoa(dataSourceSettings.ProjectId)),
		"metric_types": []MetricAggregator{MetricAggregatorCount},
		"group_by":     []string{},
		"params": QueryInput{
			DateRange: &DateRangeRequiredInput{
				StartDate: time.Now().AddDate(0, 0, -1),
				EndDate:   time.Now(),
			},
		},
		"column":    "",
		"bucket_by": "None",
	}); err != nil {
		return nil, err
	}

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Data source is working",
	}, nil
}
