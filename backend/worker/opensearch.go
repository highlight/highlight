package worker

import (
	"context"
	"fmt"
	"reflect"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const BATCH_SIZE = 2

func (w *Worker) indexItem(ctx context.Context, index opensearch.Index, item interface{}) {
	val := reflect.ValueOf(item).Elem()
	id := val.FieldByName("ID").Int()

	// Add an item to the indexer
	if err := w.Resolver.OpenSearch.Index(ctx, opensearch.IndexParams{
		Index:  index,
		ID:     id,
		Object: item,
	}); err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "OPENSEARCH_ERROR error adding field to the indexer"))
	}
}

func (w *Worker) IndexSessions(ctx context.Context, isUpdate bool) {
	results := &[]*model.Session{}

	inner := func(tx *gorm.DB, batch int) error {
		for _, result := range *results {
			fields := []*opensearch.OpenSearchField{}
			for _, field := range result.Fields {
				f := opensearch.OpenSearchField{
					Field:    field,
					Key:      field.Type + "_" + field.Name,
					KeyValue: field.Type + "_" + field.Name + "_" + field.Value,
				}
				fields = append(fields, &f)
			}
			os := opensearch.OpenSearchSession{
				Session: result,
				Fields:  fields,
			}
			w.indexItem(ctx, opensearch.IndexSessions, &os)
		}
		return nil
	}

	start := time.Now()
	query := w.Resolver.DB.Model(&model.Session{})
	if isUpdate {
		query = query.Where(fmt.Sprintf(`
			exists (
				select * 
				from retryables r 
				where r.deleted_at is null
				and r.type = 'OPENSEARCH_ERROR'
				and r.payload_type = '%s'
				and r.payload_id ~ '^[0-9]+$'
				and cast(r.payload_id as bigint) = sessions.id
				and r.created_at <= ?)`, opensearch.GetIndex(opensearch.IndexSessions)), start)
	}

	if err := query.Preload("Fields").
		FindInBatches(results, BATCH_SIZE, inner).Error; err != nil {
		log.WithContext(ctx).Errorf("OPENSEARCH_ERROR error querying objects: %+v", err)
	}

	if isUpdate {
		w.Resolver.DB.Exec(fmt.Sprintf(`
			update retryables r
			set deleted_at = now()
			where r.deleted_at is null
			and r.type = 'OPENSEARCH_ERROR'
			and r.payload_type = '%s'
			and r.created_at <= ?`, opensearch.GetIndex(opensearch.IndexSessions)), start)
	}
}

func (w *Worker) IndexErrorGroups(ctx context.Context, isUpdate bool) {
	start := time.Now()
	query := w.Resolver.DB.Model(&model.ErrorGroup{})
	if isUpdate {
		query = query.Where(fmt.Sprintf(`
			exists (
				select * 
				from retryables r 
				where r.deleted_at is null
				and r.type = 'OPENSEARCH_ERROR'
				and r.payload_type = '%s'
				and r.payload_id ~ '^[0-9]+$'
				and cast(r.payload_id as bigint) = error_groups.id
				and r.created_at <= ?)`, opensearch.GetIndex(opensearch.IndexErrorsCombined)), start)
	}

	rows, err := query.
		Order("created_at asc").Rows()
	if err != nil {
		log.WithContext(ctx).Errorf("OPENSEARCH_ERROR error retrieving objects: %+v", err)
	}

	for rows.Next() {
		eg := model.ErrorGroup{}
		if err := w.Resolver.DB.ScanRows(rows, &eg); err != nil {
			log.WithContext(ctx).Errorf("OPENSEARCH_ERROR error scanning rows: %+v", err)
		}
		var filename *string
		if eg.MappedStackTrace != nil {
			filename = model.GetFirstFilename(*eg.MappedStackTrace)
		} else {
			filename = model.GetFirstFilename(eg.StackTrace)
		}
		eg.FieldGroup = nil
		eg.Fields = nil
		eg.Environments = ""
		eg.MappedStackTrace = nil
		eg.StackTrace = ""
		os := opensearch.OpenSearchError{
			ErrorGroup: &eg,
			Fields:     nil,
			Filename:   filename,
		}
		if err := w.Resolver.OpenSearch.Index(ctx, opensearch.IndexParams{
			Index:    opensearch.IndexErrorsCombined,
			ID:       int64(eg.ID),
			ParentID: pointy.Int(0),
			Object:   os,
		}); err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "OPENSEARCH_ERROR error adding error group to the indexer (combined)"))
		}
	}

	if isUpdate {
		w.Resolver.DB.Exec(fmt.Sprintf(`
			update retryables r
			set deleted_at = now()
			where r.deleted_at is null
			and r.type = 'OPENSEARCH_ERROR'
			and r.payload_type = '%s'
			and r.created_at <= ?
			and r.payload_id not like 'child_%%'`, opensearch.GetIndex(opensearch.IndexErrorsCombined)), start)
	}
}

func (w *Worker) IndexErrorObjects(ctx context.Context, isUpdate bool) {
	start := time.Now()
	query := w.Resolver.DB.Model(&model.ErrorObject{})
	if isUpdate {
		query = query.Where(fmt.Sprintf(`
			exists (
				select * 
				from retryables r 
				where r.deleted_at is null
				and r.type = 'OPENSEARCH_ERROR'
				and r.payload_type = '%s'
				and r.payload_id ~ '^child_[0-9]+$'
				and cast(ltrim(r.payload_id, 'child_') as bigint) = error_objects.id
				and r.created_at <= ?)`, opensearch.GetIndex(opensearch.IndexErrorsCombined)), start)
	}

	rows, err := query.
		Order("created_at asc").Rows()

	if err != nil {
		log.WithContext(ctx).Errorf("OPENSEARCH_ERROR error retrieving objects: %+v", err)
	}

	for rows.Next() {
		eo := model.ErrorObject{}
		if err := w.Resolver.DB.ScanRows(rows, &eo); err != nil {
			log.WithContext(ctx).Errorf("OPENSEARCH_ERROR error scanning rows: %+v", err)
		}

		os := opensearch.OpenSearchErrorObject{
			Url:         eo.URL,
			Os:          eo.OS,
			Browser:     eo.Browser,
			Timestamp:   eo.Timestamp,
			Environment: eo.Environment,
		}

		if err := w.Resolver.OpenSearch.Index(ctx, opensearch.IndexParams{
			Index:    opensearch.IndexErrorsCombined,
			ID:       int64(eo.ID),
			ParentID: pointy.Int(eo.ErrorGroupID),
			Object:   os,
		}); err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "OPENSEARCH_ERROR error adding error object to the indexer (combined)"))
		}
	}

	if isUpdate {
		w.Resolver.DB.Exec(fmt.Sprintf(`
			update retryables r
			set deleted_at = now()
			where r.deleted_at is null
			and r.type = 'OPENSEARCH_ERROR'
			and r.payload_type = '%s'
			and r.created_at <= ?
			and r.payload_id like 'child_%%'`, opensearch.GetIndex(opensearch.IndexErrorsCombined)), start)
	}
}

func (w *Worker) IndexTable(ctx context.Context, index opensearch.Index, modelPrototype interface{}, isUpdate bool) {
	modelProto := modelPrototype

	start := time.Now()
	query := w.Resolver.DB.Model(modelProto)
	if isUpdate {
		table := "fields"
		if index == opensearch.IndexErrorFields {
			table = "error_fields"
		}
		query = query.Where(fmt.Sprintf(`
			exists (
				select * 
				from retryables r 
				where r.deleted_at is null
				and r.type = 'OPENSEARCH_ERROR'
				and r.payload_type = '%s'
				and r.payload_id ~ '^[0-9]+$'
				and cast(r.payload_id as bigint) = %s.id
				and r.created_at <= ?)`, opensearch.GetIndex(index), table), start)
	}

	rows, err := query.Order("created_at asc").Rows()
	if err != nil {
		log.WithContext(ctx).Errorf("OPENSEARCH_ERROR error retrieving objects: %+v", err)
	}

	for rows.Next() {
		modelObj := modelPrototype
		if err := w.Resolver.DB.ScanRows(rows, modelObj); err != nil {
			log.WithContext(ctx).Errorf("OPENSEARCH_ERROR error scanning rows: %+v", err)
		}

		w.indexItem(ctx, index, modelObj)
	}

	if isUpdate {
		w.Resolver.DB.Exec(fmt.Sprintf(`
			update retryables r
			set deleted_at = now()
			where r.deleted_at is null
			and r.type = 'OPENSEARCH_ERROR'
			and r.payload_type = '%s'
			and r.created_at <= ?`, opensearch.GetIndex(index)), start)
	}
}

const JOIN_MAPPINGS = `
{
	"properties": {
		"Event": {
			"type" : "text",
			"fields" : {
				"keyword" : {
					"type" : "keyword",
					"ignore_above" : 30000
				}
			}
		},
		"join_type": {
			"type": "join",
			"relations": {
				"parent": "child"
			}
		}
	}
}`

const NESTED_FIELD_MAPPINGS = `
{
	"properties": {
		"fields": {
			"properties": {
				"Key": {
					"type": "keyword",
					"normalizer": "lowercase",
					"fields": {
						"raw": { 
						  "type":  "keyword"
						}
					}
				},
				"KeyValue": {
					"type": "keyword",
					"normalizer": "lowercase",
					"ignore_above": 30000
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

// Had to write the "source" field as one line, wouldn't accept triple quotes
// even though it works in the OpenSearch dashboard.
const FIELD_APPEND_SCRIPT = `
{
	"script": {
		"lang": "painless",
		"source": "def ids = new ArrayList(); def existingParams = ctx._source[params.fieldName]; if (existingParams == null) { existingParams = new ArrayList(); ctx._source[params.fieldName] = existingParams; } for (int i = 0; i < existingParams.length; i += 1) { ids.add(existingParams.get(i).id); } for (def id : ids) { int len = params.toAppend.length; for (int i = len - 1; i >= 0; i--) { def cur_item_id = params.toAppend.get(i).id; if (id.equals(cur_item_id)) { params.toAppend.remove(i); } } } if (params.toAppend.length > 0) { ctx._source[params.fieldName].addAll(params.toAppend); } else { ctx.op = \"noop\"; }"
	}
}
`

func (w *Worker) InitIndexMappings(ctx context.Context) {
	if err := w.Resolver.OpenSearch.PutMapping(ctx, opensearch.IndexSessions, NESTED_FIELD_MAPPINGS); err != nil {
		log.WithContext(ctx).Warnf("OPENSEARCH_ERROR error creating session mappings: %+v", err)
	}
	if err := w.Resolver.OpenSearch.PutMapping(ctx, opensearch.IndexFields, FIELD_MAPPINGS); err != nil {
		log.WithContext(ctx).Warnf("OPENSEARCH_ERROR error creating field mappings: %+v", err)
	}
	if err := w.Resolver.OpenSearch.PutMapping(ctx, opensearch.IndexErrorFields, FIELD_MAPPINGS); err != nil {
		log.WithContext(ctx).Warnf("OPENSEARCH_ERROR error creating error field mappings: %+v", err)
	}
	if err := w.Resolver.OpenSearch.PutMapping(ctx, opensearch.IndexErrorsCombined, JOIN_MAPPINGS); err != nil {
		log.WithContext(ctx).Warnf("OPENSEARCH_ERROR error creating errors combined mappings: %+v", err)
	}
	if err := w.Resolver.OpenSearch.PutScript(ctx, opensearch.ScriptAppendFields, FIELD_APPEND_SCRIPT); err != nil {
		log.WithContext(ctx).Warnf("OPENSEARCH_ERROR error creating field append script: %+v", err)
	}
}
