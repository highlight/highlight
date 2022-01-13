package opensearch

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/model"
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
	IndexSessions    Index = "sessions"
	IndexFields      Index = "fields"
	IndexErrors      Index = "errors"
	IndexErrorFields Index = "error-fields"
)

func GetIndex(suffix Index) string {
	return OpensearchIndexPrefix + "_" + string(suffix)
}

type Client struct {
	Client        *opensearch.Client
	ReadClient    *opensearch.Client
	BulkIndexer   opensearchutil.BulkIndexer
	isInitialized bool
}

type SearchOptions struct {
	MaxResults    *int
	SortField     *string
	SortOrder     *string
	ReturnCount   *bool
	ExcludeFields []string
}

func NewOpensearchClient() (*Client, error) {
	client, err := opensearch.NewClient(opensearch.Config{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
		Addresses: []string{OpensearchDomain},
		Username:  OpensearchUsername,
		Password:  OpensearchPassword,
	})
	if err != nil {
		return nil, e.Wrap(err, "OPENSEARCH_ERROR failed to initialize opensearch client")
	}

	readClient, err := opensearch.NewClient(opensearch.Config{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
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
			log.Error(e.Wrap(err, "OPENSEARCH_ERROR bulk indexer error"))
		},
	})
	if err != nil {
		return nil, e.Wrap(err, "OPENSEARCH_ERROR failed to initialize opensearch bulk indexer")
	}

	return &Client{
		Client:        client,
		ReadClient:    readClient,
		BulkIndexer:   indexer,
		isInitialized: true,
	}, nil
}

func (c *Client) Update(index Index, id int, obj map[string]interface{}) error {
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
		OnSuccess: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem) {
			log.Infof("OPENSEARCH_SUCCESS (%s : %s) [%d] %s", indexStr, item.DocumentID, res.Status, res.Result)
		},
		OnFailure: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem, err error) {
			if err != nil {
				log.Errorf("OPENSEARCH_ERROR (%s : %s) %s", indexStr, item.DocumentID, err)
			} else {
				log.Errorf("OPENSEARCH_ERROR (%s : %s) %s %s", indexStr, item.DocumentID, res.Error.Type, res.Error.Reason)
			}
		},
	}

	if err := c.BulkIndexer.Add(context.Background(), item); err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error adding bulk indexer item for update")
	}

	return nil
}

func (c *Client) Index(index Index, id int, obj interface{}) error {
	if c == nil || !c.isInitialized {
		return nil
	}

	documentId := strconv.Itoa(id)

	b, err := json.Marshal(obj)
	if err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error marshalling map for index")
	}
	body := strings.NewReader(string(b))

	indexStr := GetIndex(index)

	item := opensearchutil.BulkIndexerItem{
		Index:      indexStr,
		Action:     "index",
		DocumentID: documentId,
		Body:       body,
		OnSuccess: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem) {
			log.Infof("OPENSEARCH_SUCCESS (%s : %s) [%d] %s", indexStr, item.DocumentID, res.Status, res.Result)
		},
		OnFailure: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem, err error) {
			if err != nil {
				log.Errorf("OPENSEARCH_ERROR (%s : %s) %s", indexStr, item.DocumentID, err)
			} else {
				log.Errorf("OPENSEARCH_ERROR (%s : %s) %s %s", indexStr, item.DocumentID, res.Error.Type, res.Error.Reason)
			}
		},
	}

	if err := c.BulkIndexer.Add(context.Background(), item); err != nil {
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
	body := strings.NewReader(fmt.Sprintf(`{"script" : {"source": "ctx._source.%s.addAll(params.toAppend)","params" : {"toAppend" : %s}}}`, fieldName, string(b)))

	indexStr := GetIndex(index)

	item := opensearchutil.BulkIndexerItem{
		Index:           indexStr,
		Action:          "update",
		DocumentID:      documentId,
		Body:            body,
		RetryOnConflict: pointy.Int(3),
		OnSuccess: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem) {
			log.Infof("OPENSEARCH_SUCCESS (%s : %s) [%d] %s", indexStr, item.DocumentID, res.Status, res.Result)
		},
		OnFailure: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem, err error) {
			if err != nil {
				log.Errorf("OPENSEARCH_ERROR (%s : %s) %s", indexStr, item.DocumentID, err)
			} else {
				log.Errorf("OPENSEARCH_ERROR (%s : %s) %s %s", indexStr, item.DocumentID, res.Error.Type, res.Error.Reason)
			}
		},
	}

	if err := c.BulkIndexer.Add(context.Background(), item); err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error adding bulk indexer item for update (append session fields)")
	}

	return nil

}

func (c *Client) IndexSynchronous(index Index, id int, obj interface{}) error {
	if c == nil || !c.isInitialized {
		return nil
	}

	documentId := strconv.Itoa(id)

	b, err := json.Marshal(obj)
	if err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error marshalling map for index")
	}
	body := strings.NewReader(string(b))

	indexStr := GetIndex(index)

	req := opensearchapi.IndexRequest{
		Index:      indexStr,
		DocumentID: documentId,
		Body:       body,
	}

	res, err := req.Do(context.Background(), c.Client)
	if err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error indexing document")
	}

	log.Infof("OPENSEARCH_SUCCESS (%s : %s) [%d] created", indexStr, documentId, res.StatusCode)

	return nil
}

func (c *Client) Search(indexes []Index, projectID int, query string, options SearchOptions, results interface{}) (resultCount int64, err error) {
	if err := json.Unmarshal([]byte(query), &struct{}{}); err != nil {
		return 0, e.Wrap(err, "query is not valid JSON")
	}

	q := fmt.Sprintf(`{"bool":{"must":[{"term":{"project_id":"%d"}}, %s]}}`, projectID, query)

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

	excludesStr := ""
	for _, e := range options.ExcludeFields {
		if excludesStr != "" {
			excludesStr += ", "
		}

		excludesStr += `"` + e + `"`
	}

	content := strings.NewReader(
		fmt.Sprintf(`{"_source": {"excludes": [%s]}, "size": %d, "query": %s%s, "track_total_hits": %s}`,
			excludesStr, count, q, sort, trackTotalHits))

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
		return 0, e.Wrap(err, "failed to search index")
	}

	res, err := ioutil.ReadAll(searchResponse.Body)
	if err != nil {
		return 0, e.Wrap(err, "failed to read search response")
	}

	if err := searchResponse.Body.Close(); err != nil {
		return 0, e.Wrap(err, "failed to close search response")
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
		return 0, e.Wrap(err, "failed to unmarshal response")
	}

	sources := []interface{}{}
	for _, hit := range response.Hits.Hits {
		sources = append(sources, hit.Source)
	}

	marshalled, err := json.Marshal(sources)
	if err != nil {
		return 0, e.Wrap(err, "failed to re-marshal sources")
	}

	if err := json.Unmarshal(marshalled, results); err != nil {
		return 0, e.Wrap(err, "failed to unmarshal sources")
	}

	return response.Hits.Total.Value, nil
}

func (c *Client) PutMapping(index Index, bodyStr string) error {
	body := strings.NewReader(bodyStr)

	indexStr := GetIndex(index)

	createRequest := opensearchapi.IndicesCreateRequest{
		Index: indexStr,
	}

	createResponse, err := createRequest.Do(context.Background(), c.Client)
	if err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error creating index")
	}

	log.Infof("OPENSEARCH_SUCCESS (%s) [%d] index created", indexStr, createResponse.StatusCode)

	mappingRequest := opensearchapi.IndicesPutMappingRequest{
		Index: []string{indexStr},
		Body:  body,
	}

	mappingResponse, err := mappingRequest.Do(context.Background(), c.Client)
	if err != nil {
		return e.Wrap(err, "OPENSEARCH_ERROR error creating mapping")
	}

	log.Infof("OPENSEARCH_SUCCESS (%s) [%d] mapping created", indexStr, mappingResponse.StatusCode)

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
	Fields   []*OpenSearchErrorField `json:"fields"`
	Filename *string                 `json:"filename"`
}

func (oe *OpenSearchError) ToErrorGroup() *model.ErrorGroup {
	inner := oe.ErrorGroup
	if oe.Filename != nil {
		inner.StackTrace = fmt.Sprintf(`[{"fileName":"%s"}]`, *oe.Filename)
	}
	return inner
}

type OpenSearchErrorField struct {
	*model.ErrorField
	Key      string
	KeyValue string
}
