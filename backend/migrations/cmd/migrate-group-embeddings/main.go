package main

import (
	"context"
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
		log.WithContext(ctx).Fatal(err)
	}

	if err := db.Exec(`
		CREATE TABLE IF NOT EXISTS migrated_embeddings (
			project_id INTEGER PRIMARY KEY NOT NULL,
			embedding_id INTEGER NOT NULL
		)`).Error; err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	var lastCreatedPart int
	if err := db.Raw("select split_part(relname, '_', 5) from pg_stat_all_tables where relname like 'error_object_embeddings_partitioned%' order by relid desc limit 1").
		Scan(&lastCreatedPart).Error; err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	for i := 0; i <= lastCreatedPart; i++ {
		log.WithContext(ctx).Infof("beginning loop: %d", i)

		var prevEmbeddingId int
		if err := db.Raw("select coalesce(max(embedding_id), 0) from migrated_embeddings where project_id = ?", i).Scan(&prevEmbeddingId).Error; err != nil {
			log.WithContext(ctx).Fatal(err)
		}
		log.WithContext(ctx).Infof("prevEmbeddingId: %d", prevEmbeddingId)

		var maxEmbeddingId int
		if err := db.Raw(fmt.Sprintf("select coalesce(max(id), 0) from error_object_embeddings_partitioned eoe where project_id = %d", i)).Scan(&maxEmbeddingId).Error; err != nil {
			log.WithContext(ctx).Fatal(err)
		}
		log.WithContext(ctx).Infof("maxEmbeddingId: %d", maxEmbeddingId)

		start := prevEmbeddingId
		for start < maxEmbeddingId {
			var end int
			if err := db.Raw(
				fmt.Sprintf(`select coalesce(max(id), ?) from (
					select id
					from error_object_embeddings_partitioned
					where project_id = %d
					and gte_large_embedding is not null
					and id > ?
					and id <= ?
					order by id
					limit 10000) a`, i), maxEmbeddingId, start, maxEmbeddingId).Scan(&end).Error; err != nil {
				log.WithContext(ctx).Fatal(err)
			}

			log.WithContext(ctx).Infof("loop (%d, %d]", start, end)

			if err := db.Transaction(func(tx *gorm.DB) error {
				if err := tx.Exec(`
					insert into error_group_embeddings (project_id, error_group_id, count, gte_large_embedding)
					select a.* from (
						select eo.project_id, eo.error_group_id, count(*) as count, AVG(eoe.gte_large_embedding) as gte_large_embedding
						from error_object_embeddings_partitioned eoe
						inner join error_objects eo
						on eoe.error_object_id = eo.id
						where eoe.project_id = ?
						and eo.project_id = ?
						and eoe.gte_large_embedding is not null
						and eoe.id > ?
						and eoe.id <= ?
						group by eo.project_id, eo.error_group_id) a
					on conflict (project_id, error_group_id)
					do update set
						gte_large_embedding =
							error_group_embeddings.gte_large_embedding * array_fill(error_group_embeddings.count::numeric / (error_group_embeddings.count + excluded.count), '{1024}')::vector
							+ excluded.gte_large_embedding * array_fill(excluded.count::numeric / (error_group_embeddings.count + excluded.count), '{1024}')::vector,
						count = error_group_embeddings.count + excluded.count
				`, i, i, start, end).Error; err != nil {
					return err
				}

				log.WithContext(ctx).Info("done upserting new embeddings")

				if err := tx.Exec(`
					insert into migrated_embeddings (project_id, embedding_id)
					values (?, ?)
					on conflict (project_id)
					do update set embedding_id = excluded.embedding_id
				`, i, end).Error; err != nil {
					return err
				}

				log.WithContext(ctx).Info("done updating maxEmbeddingId")

				return nil
			}); err != nil {
				log.WithContext(ctx).Fatal(err)
			}

			start = end
		}
	}

}
