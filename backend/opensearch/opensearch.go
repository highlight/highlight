package opensearch

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/retryables"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	"github.com/opensearch-project/opensearch-go"
	"github.com/opensearch-project/opensearch-go/opensearchapi"
	"github.com/opensearch-project/opensearch-go/opensearchutil"
)

var (
	OpensearchIndexPrefix string = func() string {
		prefix := os.Getenv("OPENSEARCH_INDEX_PREFIX")
		if len(prefix) > 0 {
			return prefix
		} else {
			return os.Getenv("DOPPLER_CONFIG")
		}
	}()
	OpensearchDomain     string = os.Getenv("OPENSEARCH_DOMAIN")
	OpensearchReadDomain string = os.Getenv("OPENSEARCH_DOMAIN_READ")
	OpensearchPassword   string = os.Getenv("OPENSEARCH_PASSWORD")
	OpensearchUsername   string = os.Getenv("OPENSEARCH_USERNAME")
)

type Index string

var (
	IndexSessions       Index = "sessions"
	IndexFields         Index = "fields"
	IndexErrorFields    Index = "error-fields"
	IndexErrorsCombined Index = "errors-combined"
)

func GetIndex(suffix Index) string {
	return OpensearchIndexPrefix + "_" + string(suffix)
}

type Script string

var (
	ScriptAppendFields Script = "append_fields"
)

func GetScript(suffix Script) string {
	return OpensearchIndexPrefix + "_" + string(suffix)
}

type Client struct {
	Client          *opensearch.Client
	ReadClient      *opensearch.Client
	BulkIndexer     opensearchutil.BulkIndexer
	RetryableClient retryables.Client
	isInitialized   bool
}

type Aggregation interface {
	GetAggsString() string
}

type TermsAggregation struct {
	Field          string
	Missing        *string // Optional: The value to use when the field is missing.
	SubAggregation Aggregation
	Include        *string
	Exclude        *string
	Size           *int
}

func (t *TermsAggregation) GetAggsString() string {
	subAggString := ""
	if t.SubAggregation != nil {
		subAggString = t.SubAggregation.GetAggsString()
	}

	includePart := ""
	if t.Include != nil {
		includePart = fmt.Sprintf(`, "include": "%s"`, *t.Include)
	}

	excludePart := ""
	if t.Exclude != nil {
		excludePart = fmt.Sprintf(`, "exclude": "%s"`, *t.Exclude)
	}

	sizePart := ""
	if t.Size != nil {
		sizePart = fmt.Sprintf(`, "size": %d`, *t.Size)
	}

	missing := ""
	if t.Missing != nil {
		missing = fmt.Sprintf(`, "missing": "%s"`, *t.Missing)
	}
	return fmt.Sprintf(`
		"aggregate": {
			"terms": {
				"field": "%s"
				%s
				%s
				%s
				%s
			},
			"aggs": {
				%s
			}
		}
	`, t.Field, includePart, excludePart, sizePart, missing, subAggString)
}

type DateBounds struct {
	Min int64
	Max int64
}

type DateHistogramAggregation struct {
	Field            string
	CalendarInterval string
	SortOrder        string
	Format           string
	TimeZone         string
	DateBounds       *DateBounds
	SubAggregation   Aggregation
}

func (d *DateHistogramAggregation) GetAggsString() string {
	subAggString := ""
	if d.SubAggregation != nil {
		subAggString = d.SubAggregation.GetAggsString()
	}
	boundsString := ""
	if d.DateBounds != nil {
		boundsString = fmt.Sprintf(
			`, "extended_bounds": {"min": %d, "max": %d}, "hard_bounds": {"min": %d, "max": %d}, "min_doc_count": 0`,
			d.DateBounds.Min,
			d.DateBounds.Max,
			d.DateBounds.Min,
			d.DateBounds.Max)
	}
	return fmt.Sprintf(`
		"aggregate": {
			"date_histogram": {
				"field": "%s",
				"calendar_interval": "%s",
				"order": {
					"_key": "%s"
				},
				"format": "%s",
				"time_zone": "%s"
				%s
			},
			"aggs": {
				%s
			}
		}
	`, d.Field, d.CalendarInterval, d.SortOrder, d.Format, d.TimeZone, boundsString, subAggString)
}

type AggregationResult struct {
	Key                   string
	DocCount              int64
	SubAggregationResults []AggregationResult
}

type aggregateBucket struct {
	Key         interface{} `json:"key"`
	KeyAsString string      `json:"key_as_string"`
	DocCount    int64       `json:"doc_count"`
	Aggregate   struct {
		Buckets []aggregateBucket `json:"buckets"`
	} `json:"aggregate"`
}

type SearchOptions struct {
	MaxResults        *int
	ResultsFrom       *int
	SortField         *string
	SortOrder         *string
	ReturnCount       *bool
	ProjectIDOnParent *bool
	ExcludeFields     []string
	IncludeFields     []string
	Aggregation       Aggregation
	SearchAfter       []interface{}
}

func NewOpensearchClient(db *gorm.DB) (*Client, error) {
	client, err := opensearch.NewClient(opensearch.Config{
		Transport: http.DefaultTransport,
		Addresses: []string{OpensearchDomain},
		Username:  OpensearchUsername,
		Password:  OpensearchPassword,
	})
	if err != nil {
		return nil, e.Wrap(err, "OPENSEARCH_ERROR failed to initialize opensearch client")
	}

	readClient, err := opensearch.NewClient(opensearch.Config{
		Transport: http.DefaultTransport,
		Addresses: []string{OpensearchReadDomain},
		Username:  OpensearchUsername,
		Password:  OpensearchPassword,
	})
	if err != nil {
		return nil, e.Wrap(err, "OPENSEARCH_ERROR failed to initialize opensearch read replica client")
	}

	indexer, err := opensearchutil.NewBulkIndexer(opensearchutil.BulkIndexerConfig{
		Client:        client,
		NumWorkers:    4,                // The number of workers. Defaults to runtime.NumCPU().
		FlushBytes:    5e+6,             // The flush threshold in bytes. Defaults to 5MB.
		FlushInterval: 10 * time.Second, // The flush threshold as duration. Defaults to 30sec.
		OnError: func(ctx context.Context, err error) {
			log.WithContext(ctx).Error(e.Wrap(err, "OPENSEARCH_ERROR bulk indexer error"))
		},
	})
	if err != nil {
		return nil, e.Wrap(err, "OPENSEARCH_ERROR failed to initialize opensearch bulk indexer")
	}

	var rClient retryables.Client = &retryables.DummyClient{}
	if db != nil {
		rClient = &retryables.RetryableClient{DB: db}
	}
	return &Client{
		Client:          client,
		ReadClient:      readClient,
		RetryableClient: rClient,
		BulkIndexer:     indexer,
		isInitialized:   true,
	}, nil
}

func (c *Client) UpdateAsync(ctx context.Context, index Index, id int, obj interface{}) error {
	if c == nil || !c.isInitialized {
		return nil
	}

	documentId := strconv.Itoa(id)

	b, err := json.Marshal(obj)
	if err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error marshalling map for update")
	}
	body := strings.NewReader(fmt.Sprintf("{ \"doc\" : %s }", string(b)))

	indexStr := GetIndex(index)

	item := opensearchutil.BulkIndexerItem{
		Index:           indexStr,
		Action:          "update",
		DocumentID:      documentId,
		Body:            body,
		RetryOnConflict: pointy.Int(3),
	}

	if err := c.BulkIndexer.Add(ctx, item); err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error adding bulk indexer item for update")
	}

	return nil
}

func (c *Client) UpdateSynchronous(index Index, id int, obj interface{}) error {
	if c == nil || !c.isInitialized {
		return nil
	}

	documentId := strconv.Itoa(id)

	b, err := json.Marshal(obj)
	if err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error marshalling map for update")
	}

	body := strings.NewReader(fmt.Sprintf("{ \"doc\" : %s }", string(b)))

	indexStr := GetIndex(index)

	req := opensearchapi.UpdateRequest{
		Index:           indexStr,
		DocumentID:      documentId,
		Body:            body,
		RetryOnConflict: pointy.Int(3),
		Refresh:         "true",
	}

	res, err := req.Do(context.Background(), c.Client)
	if err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error updating document")
	}

	if res.IsError() {
		return e.New("OPENSEARCH_ERROR error updating document: " + res.String())
	}

	// log.WithContext(ctx).Infof("OPENSEARCH_SUCCESS (%s : %s) [%d] created", indexStr, documentId, res.StatusCode)

	return nil
}

func (c *Client) Delete(index Index, id int) error {
	if c == nil || !c.isInitialized {
		return nil
	}

	documentId := strconv.Itoa(id)

	indexStr := GetIndex(index)

	item := opensearchutil.BulkIndexerItem{
		Index:           indexStr,
		Action:          "delete",
		DocumentID:      documentId,
		RetryOnConflict: pointy.Int(3),
		OnFailure: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem, err error) {
			if err != nil {
				c.RetryableClient.ReportError(ctx, model.RetryableOpensearchError, item.Index, item.DocumentID, map[string]interface{}{"item.Action": item.Action, "res": res}, err)
				log.WithContext(ctx).Errorf("OPENSEARCH_ERROR (%s : %s) %s", indexStr, item.DocumentID, err)
			} else {
				c.RetryableClient.ReportError(ctx, model.RetryableOpensearchError, item.Index, item.DocumentID, map[string]interface{}{"item.Action": item.Action, "res": res}, nil)
				log.WithContext(ctx).Errorf("OPENSEARCH_ERROR (%s : %s) %s %s", indexStr, item.DocumentID, res.Error.Type, res.Error.Reason)
			}
		},
	}

	if err := c.BulkIndexer.Add(context.Background(), item); err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error adding bulk indexer item for delete")
	}

	return nil
}

func (c *Client) Index(ctx context.Context, params IndexParams) error {
	if c == nil || !c.isInitialized {
		return nil
	}

	req, err := makeIndexRequest(params)
	if err != nil {
		return err
	}

	item := opensearchutil.BulkIndexerItem{
		Index:      req.Index,
		Action:     "index",
		DocumentID: req.DocumentID,
		Body:       req.Body,
		Routing:    req.Routing,
		OnSuccess: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem) {
			// log.WithContext(ctx).Infof("OPENSEARCH_SUCCESS (%s : %s) [%d] %s", indexStr, item.DocumentID, res.Status, res.Result)
		},
		OnFailure: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem, err error) {
			if err != nil {
				c.RetryableClient.ReportError(ctx, model.RetryableOpensearchError, item.Index, item.DocumentID, map[string]interface{}{"item.Action": item.Action, "res": res}, err)
				log.WithContext(ctx).Errorf("OPENSEARCH_ERROR (%s : %s) %s", req.Index, item.DocumentID, err)
			} else {
				c.RetryableClient.ReportError(ctx, model.RetryableOpensearchError, item.Index, item.DocumentID, map[string]interface{}{"item.Action": item.Action, "res": res}, nil)
				log.WithContext(ctx).Errorf("OPENSEARCH_ERROR (%s : %s) %s %s", req.Index, item.DocumentID, res.Error.Type, res.Error.Reason)
			}
		},
	}

	if err := c.BulkIndexer.Add(ctx, item); err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error adding bulk indexer item for index")
	}

	return nil
}

func (c *Client) AppendToField(index Index, sessionID int, fieldName string, fields []interface{}) error {
	if c == nil || !c.isInitialized {
		return nil
	}

	// Nothing to append, skip the OpenSearch request
	if len(fields) == 0 {
		return nil
	}

	documentId := strconv.Itoa(sessionID)

	b, err := json.Marshal(fields)
	if err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error marshalling fields")
	}
	body := strings.NewReader(fmt.Sprintf(`{"script" : {"id": "%s", "params" : {"toAppend" : %s, "fieldName": "%s"}}}`, GetScript(ScriptAppendFields), string(b), fieldName))

	indexStr := GetIndex(index)

	item := opensearchutil.BulkIndexerItem{
		Index:           indexStr,
		Action:          "update",
		DocumentID:      documentId,
		Body:            body,
		RetryOnConflict: pointy.Int(3),
		OnSuccess: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem) {
			// log.WithContext(ctx).Infof("OPENSEARCH_SUCCESS (%s : %s) [%d] %s", indexStr, item.DocumentID, res.Status, res.Result)
		},
		OnFailure: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem, err error) {
			if err != nil {
				c.RetryableClient.ReportError(ctx, model.RetryableOpensearchError, item.Index, item.DocumentID, map[string]interface{}{"item.Action": item.Action, "res": res}, err)
				log.WithContext(ctx).Errorf("OPENSEARCH_ERROR (%s : %s) %s", indexStr, item.DocumentID, err)
			} else {
				c.RetryableClient.ReportError(ctx, model.RetryableOpensearchError, item.Index, item.DocumentID, map[string]interface{}{"item.Action": item.Action, "res": res}, nil)
				log.WithContext(ctx).Errorf("OPENSEARCH_ERROR (%s : %s) %s %s", indexStr, item.DocumentID, res.Error.Type, res.Error.Reason)
			}
		},
	}

	if err := c.BulkIndexer.Add(context.Background(), item); err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error adding bulk indexer item for update (append session fields)")
	}

	return nil
}

type IndexParams struct {
	Index    Index
	ID       int64
	ParentID *int
	Object   interface{}
}

func (c *Client) IndexSynchronous(ctx context.Context, params IndexParams) error {
	if c == nil || !c.isInitialized {
		return nil
	}

	req, err := makeIndexRequest(params)
	if err != nil {
		return err
	}

	response, err := req.Do(ctx, c.Client)
	if err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error indexing document")
	}

	if response.IsError() {
		return e.New("OPENSEARCH_ERROR error indexing document: " + response.String())
	}

	return nil
}

func makeIndexRequest(params IndexParams) (opensearchapi.IndexRequest, error) {
	documentId := ""
	joinClause := ""
	routing := ""
	if params.ParentID != nil {
		if *params.ParentID > 0 {
			// Parent/child document ids could collide - prepend child document ids with 'child_'
			documentId += "child_"
			joinClause = fmt.Sprintf(`,"join_type":{"name":"child","parent":"%d"},"routing":"%d"`, *params.ParentID, *params.ParentID)
			routing = strconv.Itoa(*params.ParentID)
		} else {
			joinClause = `,"join_type": {"name": "parent"}`
		}
	}
	documentId += strconv.FormatInt(params.ID, 10)

	b, err := json.Marshal(params.Object)
	if err != nil {
		return opensearchapi.IndexRequest{}, e.Wrap(err, "OPENSEARCH_ERROR error marshalling map for index")
	}
	bodyStr := string(b)

	// If there's a join clause, splice it into the end of the body
	if joinClause != "" {
		bodyStr = fmt.Sprintf("%s%s}", bodyStr[:len(bodyStr)-1], joinClause)
	}
	body := strings.NewReader(bodyStr)

	indexStr := GetIndex(params.Index)

	return opensearchapi.IndexRequest{
		Index:      indexStr,
		DocumentID: documentId,
		Body:       body,
		Routing:    routing,
	}, nil
}

func getAggregationResults(buckets []aggregateBucket) []AggregationResult {
	results := []AggregationResult{}
	for _, bucket := range buckets {
		// If key_as_string is defined, use that, else default to key.
		key := bucket.KeyAsString
		if key == "" {
			key = bucket.Key.(string)
		}

		result := AggregationResult{
			Key:      key,
			DocCount: bucket.DocCount,
		}

		if bucket.Aggregate.Buckets != nil {
			result.SubAggregationResults = getAggregationResults(bucket.Aggregate.Buckets)
		}

		results = append(results, result)
	}

	return results
}

func (c *Client) Search(indexes []Index, projectID int, query string, options SearchOptions, results interface{}) (resultCount int64, aggregateResults []AggregationResult, err error) {
	if err := json.Unmarshal([]byte(query), &struct{}{}); err != nil {
		return 0, nil, e.Wrap(err, "query is not valid JSON")
	}

	q := query
	if projectID != -1 {
		if options.ProjectIDOnParent != nil && *options.ProjectIDOnParent {
			q = fmt.Sprintf(
				`{"bool":{"must":[{"has_parent": {"parent_type": "parent","query": {"term":{"project_id":"%d"}}}}, %s]}}`,
				projectID, query)
		} else {
			q = fmt.Sprintf(`{"bool":{"must":[{"term":{"project_id":"%d"}}, %s]}}`, projectID, query)
		}
	}

	sort := ""
	if options.SortField != nil {
		sortOrder := "asc"
		if options.SortOrder != nil {
			sortOrder = *options.SortOrder
		}
		sort = fmt.Sprintf(`, "sort" : [{"%s" : {"order" : "%s"}}]`, *options.SortField, sortOrder)
	}

	trackTotalHits := "false"
	if options.ReturnCount != nil && *options.ReturnCount {
		trackTotalHits = "true"
	}

	count := 10
	if options.MaxResults != nil {
		count = *options.MaxResults
	}

	from := 0
	if options.ResultsFrom != nil {
		from = *options.ResultsFrom
	}

	excludesStr := ""
	for _, e := range options.ExcludeFields {
		if excludesStr != "" {
			excludesStr += ", "
		}
		excludesStr += `"` + e + `"`
	}

	includesStr := ""
	if len(options.IncludeFields) > 0 {
		innerIncludes := ""
		for _, e := range options.IncludeFields {
			if innerIncludes != "" {
				innerIncludes += ", "
			}
			innerIncludes += `"` + e + `"`
		}
		includesStr = fmt.Sprintf(`, "includes": [%s]`, innerIncludes)
	}

	searchAfterStr := ""
	if len(options.SearchAfter) > 0 {
		innerSearchAfter := ""
		for _, sa := range options.SearchAfter {
			if innerSearchAfter != "" {
				innerSearchAfter += ", "
			}
			innerSearchAfter += fmt.Sprintf("%#v", sa)
		}
		searchAfterStr = fmt.Sprintf(`, "search_after": [%s]`, innerSearchAfter)
	}

	aggs := ""
	if options.Aggregation != nil {
		aggs = fmt.Sprintf(`, "aggs" : {%s}`, options.Aggregation.GetAggsString())
	}

	contentStr := fmt.Sprintf(`{"_source": {"excludes": [%s]%s}%s, "size": %d, "from": %d, "query": %s%s, "track_total_hits": %s%s}`,
		excludesStr, includesStr, searchAfterStr, count, from, q, sort, trackTotalHits, aggs)
	content := strings.NewReader(contentStr)

	searchIndexes := []string{}
	for _, index := range indexes {
		searchIndexes = append(searchIndexes, GetIndex(index))
	}
	search := opensearchapi.SearchRequest{
		Index: searchIndexes,
		Body:  content,
	}

	searchResponse, err := search.Do(context.Background(), c.ReadClient)
	if err != nil {
		return 0, nil, e.Wrap(err, "failed to search index")
	}

	res, err := io.ReadAll(searchResponse.Body)
	if err != nil {
		return 0, nil, e.Wrap(err, "failed to read search response")
	}

	if err := searchResponse.Body.Close(); err != nil {
		return 0, nil, e.Wrap(err, "failed to close search response")
	}

	var response struct {
		Hits struct {
			Total struct {
				Value int64 `json:"value"`
			} `json:"total"`
			Hits []struct {
				Source interface{} `json:"_source"`
			} `json:"hits"`
		} `json:"hits"`
	}

	if err := json.Unmarshal(res, &response); err != nil {
		return 0, nil, e.Wrap(err, "failed to unmarshal response")
	}

	sources := []interface{}{}
	for _, hit := range response.Hits.Hits {
		sources = append(sources, hit.Source)
	}

	marshalled, err := json.Marshal(sources)
	if err != nil {
		return 0, nil, e.Wrap(err, "failed to re-marshal sources")
	}

	if err := json.Unmarshal(marshalled, results); err != nil {
		return 0, nil, e.Wrap(err, "failed to unmarshal sources")
	}

	var aggregate struct {
		Aggregations struct {
			Aggregate struct {
				Buckets []aggregateBucket `json:"buckets"`
			} `json:"aggregate"`
		} `json:"aggregations"`
	}

	var aggregationResults []AggregationResult
	if options.Aggregation != nil {
		if err := json.Unmarshal(res, &aggregate); err != nil {
			return 0, nil, e.Wrap(err, "failed to unmarshal aggregations")
		}
		aggregationResults = getAggregationResults(aggregate.Aggregations.Aggregate.Buckets)
	}

	return response.Hits.Total.Value, aggregationResults, nil
}

func (c *Client) RawSearch(index Index, query string) ([]byte, error) {
	searchIndexes := []string{GetIndex(index)}
	search := opensearchapi.SearchRequest{
		Index: searchIndexes,
		Body:  strings.NewReader(query),
	}

	searchResponse, err := search.Do(context.Background(), c.ReadClient)
	if err != nil {
		return nil, e.Wrap(err, "failed to search index")
	}

	res, err := io.ReadAll(searchResponse.Body)
	if err != nil {
		return nil, e.Wrap(err, "failed to read search response")
	}

	if err := searchResponse.Body.Close(); err != nil {
		return nil, e.Wrap(err, "failed to close search response")
	}

	return res, nil
}

func (c *Client) PutMapping(ctx context.Context, index Index, bodyStr string) error {
	body := strings.NewReader(bodyStr)

	indexStr := GetIndex(index)

	createRequest := opensearchapi.IndicesCreateRequest{
		Index: indexStr,
	}

	createResponse, err := createRequest.Do(context.Background(), c.Client)
	if err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error creating index")
	}

	log.WithContext(ctx).Infof("OPENSEARCH_SUCCESS (%s) [%d] index created", indexStr, createResponse.StatusCode)

	mappingRequest := opensearchapi.IndicesPutMappingRequest{
		Index: []string{indexStr},
		Body:  body,
	}

	mappingResponse, err := mappingRequest.Do(context.Background(), c.Client)
	if err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error creating mapping")
	}

	log.WithContext(ctx).Infof("OPENSEARCH_SUCCESS (%s) [%d] mapping created", indexStr, mappingResponse.StatusCode)

	return nil
}

func (c *Client) PutScript(ctx context.Context, script Script, bodyStr string) error {
	body := strings.NewReader(bodyStr)

	scriptStr := GetScript(script)
	putRequest := opensearchapi.PutScriptRequest{
		ScriptID: scriptStr,
		Body:     body,
	}

	createResponse, err := putRequest.Do(context.Background(), c.Client)
	if err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error upserting script")
	}

	log.WithContext(ctx).Infof("OPENSEARCH_SUCCESS (%s) [%d] script created", scriptStr, createResponse.StatusCode)

	return nil
}

func (c *Client) Close() error {
	if c == nil || !c.isInitialized {
		return nil
	}

	return c.BulkIndexer.Close(context.Background())
}

// Common types for indexing in OpenSearch
// These can differ slightly from the types they're
// based on in order to support different query patterns
// or to omit fields for better performance.
type OpenSearchSession struct {
	*model.Session
	Fields []*OpenSearchField `json:"fields"`
}

type OpenSearchField struct {
	*model.Field
	Key      string
	KeyValue string
}

type OpenSearchError struct {
	*model.ErrorGroup
	Fields []*OpenSearchErrorField `json:"fields"`
}

type OpenSearchErrorObject struct {
	Url         string    `json:"visited_url"`
	Os          string    `json:"os_name"`
	Browser     string    `json:"browser"`
	Timestamp   time.Time `json:"timestamp"`
	Environment string    `json:"environment"`
	ServiceName string    `json:"service_name"`
}

type OpenSearchErrorField struct {
	*model.ErrorField
	Key      string
	KeyValue string
}
