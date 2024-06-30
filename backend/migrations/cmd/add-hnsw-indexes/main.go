package main

import (
	"context"
	"errors"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
)

func main() {
	ctx := context.Background()

	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	var lastCreatedPart int
	db.Raw("select split_part(relname, '_', 5) from pg_stat_all_tables where relname like 'error_object_embeddings_partitioned%' order by relid desc limit 1").Scan(&lastCreatedPart)

	for i := 0; i <= lastCreatedPart; i++ {
		tablename := fmt.Sprintf("error_object_embeddings_partitioned_%d", i)

		var exists int
		if err := db.Raw("select 1 from pg_indexes where indexdef ilike '%hnsw%' and tablename = ?", tablename).Scan(&exists).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			log.WithContext(ctx).Fatalf("error querying hnsw index for table %s: %+v", tablename, err)
		}

		if exists == 1 {
			log.WithContext(ctx).Infof("hnsw index exists for %d, skipping", i)
			continue
		}

		log.WithContext(ctx).Infof("creating hnsw index for %d", i)
		if err := db.Exec(fmt.Sprintf("CREATE INDEX CONCURRENTLY ON %s USING hnsw (gte_large_embedding vector_l2_ops)", tablename)).Error; err != nil {
			log.WithContext(ctx).Fatalf("error creating hnsw index for %d: %+v", i, err)
		}
		log.WithContext(ctx).Infof("created hnsw index for %d", i)
	}

}
