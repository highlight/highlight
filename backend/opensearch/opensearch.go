package opensearch

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	"github.com/opensearch-project/opensearch-go"
	"github.com/opensearch-project/opensearch-go/opensearchapi"
	"github.com/opensearch-project/opensearch-go/opensearchutil"
)

var (
	OpensearchIndexPrefix string = os.Getenv("OPENSEARCH_INDEX_PREFIX")
	OpensearchDomain      string = os.Getenv("OPENSEARCH_DOMAIN")
	OpensearchPassword    string = os.Getenv("OPENSEARCH_PASSWORD")
	OpensearchUsername    string = os.Getenv("OPENSEARCH_USERNAME")
)

type Index string

var (
	IndexSessions Index = "sessions"
	IndexFields   Index = "fields"
	IndexErrors   Index = "errors"
)

func GetIndex(suffix Index) string {
	return OpensearchIndexPrefix + "_" + string(suffix)
}

type Client struct {
	Client      *opensearch.Client
	BulkIndexer opensearchutil.BulkIndexer
}

func NewOpensearchClient() (*Client, error) {
	client, err := opensearch.NewClient(opensearch.Config{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // ZANETODO: For testing only. Use certificate for validation.
		},
		Addresses: []string{OpensearchDomain},
		Username:  OpensearchUsername,
		Password:  OpensearchPassword,
	})
	if err != nil {
		return nil, e.Wrap(err, "failed to initialize opensearch client")
	}

	indexer, err := opensearchutil.NewBulkIndexer(opensearchutil.BulkIndexerConfig{
		Client:        client,
		NumWorkers:    4,                // The number of workers. Defaults to runtime.NumCPU().
		FlushBytes:    5e+6,             // The flush threshold in bytes. Defaults to 5MB.
		FlushInterval: 10 * time.Second, // The flush threshold as duration. Defaults to 30sec.
		OnError: func(ctx context.Context, err error) {
			log.Error(e.Wrap(err, "bulk indexer error"))
		},
	})
	if err != nil {
		return nil, e.Wrap(err, "failed to initialize opensearch bulk indexer")
	}

	return &Client{
		Client:      client,
		BulkIndexer: indexer,
	}, nil
}

func (c *Client) Update(index Index, id int, obj map[string]interface{}) error {
	documentId := strconv.Itoa(id)

	b, err := json.Marshal(obj)
	if err != nil {
		return e.Wrap(err, "error marshalling map for update")
	}
	body := strings.NewReader(fmt.Sprintf("{ \"doc\" : %s }", string(b)))

	indexStr := GetIndex(index)

	item := opensearchutil.BulkIndexerItem{
		Index:      indexStr,
		Action:     "update",
		DocumentID: documentId,
		Body:       body,
		OnSuccess: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem) {
			log.Infof("OPENSEARCH SUCCESS (%s : %s) [%d] %s", indexStr, item.DocumentID, res.Status, res.Result)
		},
		OnFailure: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem, err error) {
			if err != nil {
				log.Errorf("OPENSEARCH ERROR (%s : %s) %s", indexStr, item.DocumentID, err)
			} else {
				log.Errorf("OPENSEARCH ERROR (%s : %s) %s %s", indexStr, item.DocumentID, res.Error.Type, res.Error.Reason)
			}
		},
	}

	if err := c.BulkIndexer.Add(context.Background(), item); err != nil {
		return e.Wrap(err, "error adding bulk indexer item for update")
	}

	return nil
}

func (c *Client) Index(index Index, id int, obj interface{}) error {
	documentId := strconv.Itoa(id)

	b, err := json.Marshal(obj)
	if err != nil {
		return e.Wrap(err, "error marshalling map for index")
	}
	body := strings.NewReader(string(b))

	indexStr := GetIndex(index)

	item := opensearchutil.BulkIndexerItem{
		Index:      indexStr,
		Action:     "index",
		DocumentID: documentId,
		Body:       body,
		OnSuccess: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem) {
			log.Infof("OPENSEARCH SUCCESS (%s : %s) [%d] %s", indexStr, item.DocumentID, res.Status, res.Result)
		},
		OnFailure: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem, err error) {
			if err != nil {
				log.Errorf("OPENSEARCH ERROR (%s : %s) %s", indexStr, item.DocumentID, err)
			} else {
				log.Errorf("OPENSEARCH ERROR (%s : %s) %s %s", indexStr, item.DocumentID, res.Error.Type, res.Error.Reason)
			}
		},
	}

	if err := c.BulkIndexer.Add(context.Background(), item); err != nil {
		return e.Wrap(err, "error adding bulk indexer item for index")
	}

	return nil
}

func (c *Client) AppendToField(index Index, sessionID int, fieldName string, fields []*model.Field) error {
	// Nothing to append, skip the OpenSearch request
	if len(fields) == 0 {
		return nil
	}

	documentId := strconv.Itoa(sessionID)

	b, err := json.Marshal(fields)
	if err != nil {
		return e.Wrap(err, "error marshalling fields")
	}
	body := strings.NewReader(fmt.Sprintf(`{"script" : {"source": "ctx._source.%s.addAll(params.toAppend)","params" : {"toAppend" : %s}}}`, fieldName, string(b)))

	indexStr := GetIndex(index)

	item := opensearchutil.BulkIndexerItem{
		Index:      indexStr,
		Action:     "update",
		DocumentID: documentId,
		Body:       body,
		OnSuccess: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem) {
			log.Infof("OPENSEARCH SUCCESS (%s : %s) [%d] %s", indexStr, item.DocumentID, res.Status, res.Result)
		},
		OnFailure: func(ctx context.Context, item opensearchutil.BulkIndexerItem, res opensearchutil.BulkIndexerResponseItem, err error) {
			if err != nil {
				log.Errorf("OPENSEARCH ERROR (%s : %s) %s", indexStr, item.DocumentID, err)
			} else {
				log.Errorf("OPENSEARCH ERROR (%s : %s) %s %s", indexStr, item.DocumentID, res.Error.Type, res.Error.Reason)
			}
		},
	}

	if err := c.BulkIndexer.Add(context.Background(), item); err != nil {
		return e.Wrap(err, "error adding bulk indexer item for update (append session fields)")
	}

	return nil

}

func (c *Client) IndexSynchronous(index Index, id int, obj interface{}) error {
	documentId := strconv.Itoa(id)

	b, err := json.Marshal(obj)
	if err != nil {
		return e.Wrap(err, "error marshalling map for index")
	}
	body := strings.NewReader(string(b))

	indexStr := GetIndex(index)

	req := opensearchapi.IndexRequest{
		Index:      indexStr,
		DocumentID: documentId,
		Body:       body,
	}
	if _, err := req.Do(context.Background(), c.Client); err != nil {
		return e.Wrap(err, "error indexing document")
	}

	return nil
}
