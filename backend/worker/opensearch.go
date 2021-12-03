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

func (w *Worker) IndexSessions() {
	modelProto := &model.Session{}
	results := &[]*model.Session{}

	inner := func(tx *gorm.DB, batch int) error {
		for _, result := range *results {
			w.indexItem(opensearch.IndexSessions, result)
		}
		return nil
	}

	if err := w.Resolver.DB.Preload("Fields").Model(modelProto).
		Order("created_at asc").
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
