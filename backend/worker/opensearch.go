package worker

import (
	"reflect"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const BATCH_SIZE = 2000

func (w *Worker) indexItem(index opensearch.Index, item interface{}) {
	val := reflect.ValueOf(item).Elem()
	id := int(val.FieldByName("ID").Int())

	// Add an item to the indexer
	if err := w.Resolver.OpenSearch.Index(index, id, item); err != nil {
		log.Error(e.Wrap(err, "OPENSEARCH_ERROR error adding field to the indexer"))
	}
}

type OpenSearchSession struct {
	*model.Session
	Fields []*OpenSearchField `json:"fields"`
}

type OpenSearchField struct {
	*model.Field
	Key      string
	KeyValue string
}

func (w *Worker) IndexSessions() {
	modelProto := &model.Session{}
	results := &[]*model.Session{}

	inner := func(tx *gorm.DB, batch int) error {
		for _, result := range *results {
			fields := []*OpenSearchField{}
			for _, field := range result.Fields {
				f := OpenSearchField{
					Field:    field,
					Key:      field.Type + "_" + field.Name,
					KeyValue: field.Type + "_" + field.Name + "_" + field.Value,
				}
				fields = append(fields, &f)
			}
			os := OpenSearchSession{
				Session: result,
				Fields:  fields,
			}
			w.indexItem(opensearch.IndexSessions, &os)
		}
		return nil
	}

	if err := w.Resolver.DB.Preload("Fields").Model(modelProto).
		FindInBatches(results, BATCH_SIZE, inner).Error; err != nil {
		log.Fatalf("OPENSEARCH_ERROR error querying objects: %+v", err)
	}
}

type OpenSearchError struct {
	*model.ErrorGroup
	Fields []*OpenSearchErrorField `json:"fields"`
}

type OpenSearchErrorField struct {
	*model.ErrorField
	Key      string
	KeyValue string
}

func (w *Worker) IndexErrors() {
	modelProto := &model.ErrorGroup{}
	results := &[]*model.ErrorGroup{}

	inner := func(tx *gorm.DB, batch int) error {
		for _, result := range *results {
			fields := []*OpenSearchErrorField{}
			for _, field := range result.Fields {
				f := OpenSearchErrorField{
					ErrorField: field,
					Key:        field.Name,
					KeyValue:   field.Name + "_" + field.Value,
				}
				fields = append(fields, &f)
			}
			result.Fields = nil
			os := OpenSearchError{
				ErrorGroup: result,
				Fields:     fields,
			}
			w.indexItem(opensearch.IndexErrors, &os)
		}
		return nil
	}

	if err := w.Resolver.DB.Preload("Fields").Model(modelProto).
		FindInBatches(results, BATCH_SIZE, inner).Error; err != nil {
		log.Fatalf("OPENSEARCH_ERROR error querying objects: %+v", err)
	}
}

func (w *Worker) IndexTable(index opensearch.Index, modelPrototype interface{}) {
	modelProto := modelPrototype

	rows, err := w.Resolver.DB.Model(modelProto).Order("created_at asc").Rows()
	if err != nil {
		log.Fatalf("OPENSEARCH_ERROR error retrieving objects: %+v", err)
	}

	for rows.Next() {
		modelObj := modelPrototype
		if err := w.Resolver.DB.ScanRows(rows, modelObj); err != nil {
			log.Fatalf("OPENSEARCH_ERROR error scanning rows: %+v", err)
		}

		w.indexItem(index, modelObj)
	}
}

const NESTED_FIELD_MAPPINGS = `
{
	"properties": {
		"fields": {
			"properties": {
				"Key": {
					"type": "keyword",
					"normalizer": "lowercase"
				},
				"KeyValue": {
					"type": "keyword",
					"normalizer": "lowercase"
				}
			}
		}
	}
}`

const FIELD_MAPPINGS = ` 
{
	"properties": {
		"Value": {
			"type": "search_as_you_type"
		}
	}
}`

func (w *Worker) InitIndexMappings() {
	if err := w.Resolver.OpenSearch.PutMapping(opensearch.IndexSessions, NESTED_FIELD_MAPPINGS); err != nil {
		log.Warnf("OPENSEARCH_ERROR error creating session mappings: %+v", err)
	}
	if err := w.Resolver.OpenSearch.PutMapping(opensearch.IndexFields, FIELD_MAPPINGS); err != nil {
		log.Warnf("OPENSEARCH_ERROR error creating field mappings: %+v", err)
	}
	if err := w.Resolver.OpenSearch.PutMapping(opensearch.IndexErrors, NESTED_FIELD_MAPPINGS); err != nil {
		log.Warnf("OPENSEARCH_ERROR error creating error mappings: %+v", err)
	}
	if err := w.Resolver.OpenSearch.PutMapping(opensearch.IndexErrorFields, FIELD_MAPPINGS); err != nil {
		log.Warnf("OPENSEARCH_ERROR error creating error field mappings: %+v", err)
	}
}
