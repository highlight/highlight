package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"os"

	"golang.org/x/sync/errgroup"

	"github.com/samber/lo"

	"github.com/highlight-run/highlight/backend/payload"
	"github.com/highlight-run/highlight/backend/storage"

	log "github.com/sirupsen/logrus"

	"github.com/pkg/errors"

	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

const BatchSize = 100

func createFile(name string) (*os.File, error) {
	file, err := os.Create(name)
	if err != nil {
		return nil, errors.Wrap(err, "error creating file")
	}
	return file, nil
}

func main() {
	ctx := context.Background()
	log.WithContext(ctx).Info("ZANE_MIGRATION setting up db")
	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("ZANE_MIGRATION error setting up db: %+v", err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		log.WithContext(ctx).Fatalf("ZANE_MIGRATION error getting raw db: %+v", err)
	}
	if err := sqlDB.Ping(); err != nil {
		log.WithContext(ctx).Fatalf("ZANE_MIGRATION error pinging db: %+v", err)
	}

	storageClient, err := storage.NewS3Client(ctx)
	if err != nil {
		log.WithContext(ctx).Fatalf("ZANE_MIGRATION error creating storage client: %v", err)
	}

	max := 46656
	maxAscii := "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"

	chars := [36]byte{'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'}

	getAscii := func(i int) string {
		i--
		b0 := chars[i%36]
		b1 := chars[(i/36)%36]
		b2 := chars[(i/36/36)%36]
		return string([]byte{b2, b1, b0})
	}

	for {
		var start int
		if err := db.Raw(`
			with t as (
				insert into zane_work (done) values (false)
				returning start
			) select * from t
		`).Scan(&start).Error; err != nil {
			log.WithContext(ctx).Fatal(errors.Wrap(err, "ZANE_MIGRATION error querying next start"))
		}

		if start > max {
			log.WithContext(ctx).Info("ZANE_MIGRATION done all")
			break
		}

		startAscii := getAscii(start)
		endAscii := getAscii(start + 1)
		if start == max {
			endAscii = maxAscii
		}

		for {
			var nextEvents []struct {
				model.TimelineIndicatorEvent
				SessionID int
				ProjectID int
			}

			if err := db.Raw(`
				select tie.*, s.id as session_id, s.project_id
				from timeline_indicator_events tie
				inner join sessions s
				on tie.session_secure_id = s.secure_id
				where tie.session_secure_id in (
					select distinct session_secure_id from timeline_indicator_events
					where deleted_at is null
					and session_secure_id >= ? 
					and session_secure_id < ?
					limit ?
				)
				order by timestamp asc`, startAscii, endAscii, BatchSize).Scan(&nextEvents).Error; err != nil {
				log.WithContext(ctx).Fatalf("ZANE_MIGRATION error querying next sessions %v", err)
			}

			if len(nextEvents) == 0 {
				if err := db.Exec(`
					update zane_work
					set done = true
					where start = ?
				`, start).Error; err != nil {
					log.WithContext(ctx).Fatal(errors.Wrap(err, "ZANE_MIGRATION error updating work block"))
				}
				log.WithContext(ctx).Infof("ZANE_MIGRATION done block %d", start)
				break
			}

			fileMap := map[int]*os.File{}
			eventsMap := map[int][]model.TimelineIndicatorEvent{}
			projectIdMap := map[int]int{}
			secureIdMap := map[string]struct{}{}
			for _, ne := range nextEvents {
				secureIdMap[ne.SessionSecureID] = struct{}{}
				_, ok := fileMap[ne.SessionID]
				if !ok {
					file, err := createFile(fmt.Sprintf("%d.json.br", ne.SessionID))
					if err != nil {
						log.WithContext(ctx).Fatalf("error creating file")
					}
					fileMap[ne.SessionID] = file
					eventsMap[ne.SessionID] = []model.TimelineIndicatorEvent{}
					projectIdMap[ne.SessionID] = ne.ProjectID
				}
				eventsMap[ne.SessionID] = append(eventsMap[ne.SessionID], ne.TimelineIndicatorEvent)
			}
			secureIds := lo.Keys(secureIdMap)

			log.WithContext(ctx).Infof("ZANE_MIGRATION secure ids: %v", secureIds)

			var g errgroup.Group
			for sId, fi := range fileMap {
				f := fi
				sessionId := sId
				g.Go(func() error {
					projectId := projectIdMap[sessionId]
					writer := payload.NewCompressedWriter(f)
					eventBytes, err := json.Marshal(eventsMap[sessionId])
					if err != nil {
						return errors.Wrap(err, "error marshalling eventsForTimelineIndicator")
					}
					if err := writer.WriteString(string(eventBytes)); err != nil {
						return errors.Wrap(err, "error writing to TimelineIndicatorEvents")
					}
					if err := writer.Close(); err != nil {
						log.WithContext(ctx).Error(errors.Wrap(err, "ZANE_MIGRATION error closing TimelineIndicatorEvents writer"))
					}
					if _, err := storageClient.PushCompressedFile(context.Background(), sessionId, projectId, f, storage.TimelineIndicatorEvents, modelInputs.RetentionPeriodSixMonths); err != nil {
						return errors.Wrap(err, "error pushing to s3")
					}
					if err := f.Close(); err != nil {
						log.WithContext(ctx).Error(errors.Wrap(err, "ZANE_MIGRATION failed to close file"))
					}
					if err := os.Remove(f.Name()); err != nil {
						log.WithContext(ctx).Error(errors.Wrap(err, "ZANE_MIGRATION failed to remove file"))
					}
					return nil
				})
			}

			if err := g.Wait(); err != nil {
				log.WithContext(ctx).Fatal(errors.Wrap(err, "ZANE_MIGRATION error writing to s3"))
			}

			if err := db.Exec(`
				update sessions
				set avoid_postgres_storage = true
				where secure_id in ?
				`, secureIds).Error; err != nil {
				log.WithContext(ctx).Fatal(errors.Wrap(err, "ZANE_MIGRATION error updating sessions avoid_postgres_storage"))
			}

			if err := db.Exec(`
				update timeline_indicator_events
				set deleted_at = now()
				where session_secure_id in ?
				`, secureIds).Error; err != nil {
				log.WithContext(ctx).Fatal(errors.Wrap(err, "ZANE_MIGRATION error updating timeline_indicator_events deleted_at"))
			}
		}
	}
}
