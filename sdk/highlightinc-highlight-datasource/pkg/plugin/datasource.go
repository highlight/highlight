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
	"github.com/samber/lo"
	"go.openly.dev/pointy"
	"golang.org/x/oauth2/clientcredentials"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
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

type QueryKeyValue string

type KeyType string

const (
	KeyTypeString  KeyType = "String"
	KeyTypeNumeric KeyType = "Numeric"
)

func getValidResources() map[string]bool {
	return map[string]bool{
		"traces":   true,
		"logs":     true,
		"errors":   true,
		"sessions": true,
	}
}

func getValidGraphQLQuery() map[string]bool {
	return map[string]bool{
		"values": true,
		"keys":   true,
	}
}

func (d *Datasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	reqPathParts := strings.Split(req.Path, "-")
	if len(reqPathParts) != 2 {
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusNotFound,
		})
	}

	resource := reqPathParts[0]
	graphQLQuery := reqPathParts[1]

	validResources := getValidResources()
	validGraphQLQuery := getValidGraphQLQuery()

	if !validResources[resource] || !validGraphQLQuery[graphQLQuery] {
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

	caser := cases.Title(language.AmericanEnglish)
	productType := caser.String(resource)

	vars := map[string]interface{}{
		"product_type": ProductType(productType),
		"project_id":   ID(strconv.Itoa(dataSourceSettings.ProjectId)),
		"date_range": DateRangeRequiredInput{
			StartDate: time.Now().AddDate(0, -1, 0),
			EndDate:   time.Now(),
		},
	}

	if graphQLQuery == "keys" {
		keyType := KeyType(queryParams.Get("type"))
		vars["type"] = &keyType
		vars["query"] = &query
	} else if graphQLQuery == "values" {
		vars["query"] = query
	}

	var body []byte

	switch graphQLQuery {
	case "keys":
		var q struct {
			Keys []QueryKey `graphql:"keys(project_id: $project_id, date_range: $date_range, product_type: $product_type, query: $query, type: $type)"`
		}

		err = d.Client.Query(ctx, &q, vars)
		if err != nil {
			return err
		}

		body, err = json.Marshal(q.Keys)
		if err != nil {
			return err
		}
	case "values":
		var q struct {
			Values []QueryKeyValue `graphql:"key_values(project_id: $project_id, date_range: $date_range, product_type: $product_type, key_name: $query)"`
		}

		err = d.Client.Query(ctx, &q, vars)
		if err != nil {
			return err
		}

		body, err = json.Marshal(q.Values)
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
	BucketCount     int
	Limit           int
	LimitAggregator string
	LimitColumn     string
}

type MetricAggregator string

const (
	MetricAggregatorCount            MetricAggregator = "Count"
	MetricAggregatorCountDistinct    MetricAggregator = "CountDistinct"
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

type ProductType string

const (
	ProductTypeSessions ProductType = "Sessions"
	ProductTypeErrors   ProductType = "Errors"
	ProductTypeLogs     ProductType = "Logs"
	ProductTypeTraces   ProductType = "Traces"
)

type MetricBucket struct {
	BucketID    uint64           `json:"bucket_id" graphql:"bucket_id"`
	BucketMin   float64          `json:"bucket_min" graphql:"bucket_min"`
	BucketMax   float64          `json:"bucket_max" graphql:"bucket_max"`
	Group       []string         `json:"group" graphql:"group"`
	Column      string           `json:"column" graphql:"column"`
	MetricType  MetricAggregator `json:"metric_type" graphql:"metric_type"`
	MetricValue *float64         `json:"metric_value" graphql:"metric_value"`
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

type LogLevel string

const (
	LogLevelTrace LogLevel = "trace"
	LogLevelDebug LogLevel = "debug"
	LogLevelInfo  LogLevel = "info"
	LogLevelWarn  LogLevel = "warn"
	LogLevelError LogLevel = "error"
	LogLevelFatal LogLevel = "fatal"
)

type LogLine struct {
	Timestamp time.Time `json:"timestamp"`
	Body      string    `json:"body"`
	Severity  *LogLevel `json:"severity,omitempty"`
	Labels    string    `json:"labels"`
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

func (d *Datasource) queryLogLines(ctx context.Context, productType ProductType, from time.Time, to time.Time, refId string, input queryInput, dataSourceSettings DataSourceSettings) backend.DataResponse {
	var result struct {
		LogLines []LogLine `graphql:"log_lines(product_type: $product_type, project_id: $project_id, params: $params)"`
	}

	if err := d.Client.Query(ctx, &result, map[string]interface{}{
		"product_type": productType,
		"project_id":   ID(strconv.Itoa(dataSourceSettings.ProjectId)),
		"params": QueryInput{
			Query: input.QueryText,
			DateRange: &DateRangeRequiredInput{
				StartDate: from,
				EndDate:   to,
			},
		},
	}); err != nil {
		return backend.DataResponse{Error: err}
	}

	var timestamps []time.Time
	var bodies []string
	var severities []*string
	var labels []json.RawMessage
	for _, line := range result.LogLines {
		timestamps = append(timestamps, line.Timestamp)
		bodies = append(bodies, line.Body)
		severities = append(severities, (*string)(line.Severity))
		labels = append(labels, []byte(line.Labels))
	}

	frame := data.NewFrame(
		refId,
		data.NewField("timestamp", nil, timestamps),
		data.NewField("body", nil, bodies),
		data.NewField("severity", nil, severities),
		data.NewField("labels", nil, labels),
	)

	frame.SetMeta(&data.FrameMeta{
		Type:                   data.FrameTypeLogLines,
		PreferredVisualization: "logs",
	})

	var response backend.DataResponse

	response.Frames = append(response.Frames, frame)

	return response
}

func (d *Datasource) queryMetrics(ctx context.Context, productType ProductType, from time.Time, to time.Time, refId string, input queryInput, dataSourceSettings DataSourceSettings) backend.DataResponse {
	var result struct {
		MetricsBuckets MetricsBuckets `graphql:"metrics(product_type: $product_type, project_id: $project_id, params: $params, column: $column, metric_types: $metric_types, group_by: $group_by, bucket_by: $bucket_by, bucket_count: $bucket_count, limit: $limit, limit_aggregator: $limit_aggregator, limit_column: $limit_column)"`
	}

	var agg *MetricAggregator
	if input.LimitAggregator != "" {
		tmp := MetricAggregator(input.LimitAggregator)
		agg = &tmp
	}

	if err := d.Client.Query(ctx, &result, map[string]interface{}{
		"product_type": productType,
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
		"bucket_count":     input.BucketCount,
		"limit":            &input.Limit,
		"limit_aggregator": agg,
		"limit_column":     &input.LimitColumn,
	}); err != nil {
		return backend.DataResponse{Error: err}
	}

	bucketInfo := result.MetricsBuckets

	bucketIds := []uint64{}
	for i := uint64(0); i < bucketInfo.BucketCount; i++ {
		bucketIds = append(bucketIds, i)
	}

	bucketMins := make([]*float64, bucketInfo.BucketCount)
	bucketMaxs := make([]*float64, bucketInfo.BucketCount)
	for _, bucket := range bucketInfo.Buckets {
		bucketMins[bucket.BucketID] = pointy.Float64(bucket.BucketMin)
		bucketMaxs[bucket.BucketID] = pointy.Float64(bucket.BucketMax)
	}

	frame := data.NewFrame(refId)

	if input.BucketBy == "Timestamp" {
		timeValues := lo.Map(bucketIds, func(i uint64, _ int) time.Time {
			return from.Add(
				time.Duration(float64(i) / float64(bucketInfo.BucketCount) * float64(to.Sub(from))))
		})

		frame.Fields = append(frame.Fields, data.NewField("time", nil, timeValues))
	} else if input.BucketBy != "None" {
		frame.Fields = append(frame.Fields, data.NewField("xMin", nil, bucketMins))
		frame.Fields = append(frame.Fields, data.NewField("xMax", nil, bucketMaxs))
	}

	metricTypes := lo.Uniq(lo.Map(bucketInfo.Buckets, func(bucket *MetricBucket, _ int) MetricAggregator {
		return bucket.MetricType
	}))

	metricGroups := lo.Uniq(lo.Map(bucketInfo.Buckets, func(bucket *MetricBucket, _ int) string {
		return strings.Join(bucket.Group, "-")
	}))

	for _, metricType := range metricTypes {
		for _, metricGroup := range metricGroups {
			values := make([]*float64, bucketInfo.BucketCount)
			for _, bucket := range bucketInfo.Buckets {
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

func (d *Datasource) query(ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	from := query.TimeRange.From
	to := query.TimeRange.To
	refId := query.RefID

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

	var productType ProductType
	switch input.Table {
	case TableTraces:
		productType = ProductTypeTraces
	case TableLogs:
		productType = ProductTypeLogs
	case TableErrors:
		productType = ProductTypeErrors
	case TableSessions:
		productType = ProductTypeSessions
	}

	if input.Metric == "None" {
		return d.queryLogLines(ctx, productType, from, to, refId, input, dataSourceSettings)
	} else {
		return d.queryMetrics(ctx, productType, from, to, refId, input, dataSourceSettings)
	}
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
