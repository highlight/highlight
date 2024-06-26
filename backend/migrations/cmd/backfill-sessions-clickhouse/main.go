package main

import (
	"context"
	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
)

const SessionsMaxRowsPostgres = 500

func main() {
	ctx := context.Background()

	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	clickhouseClient, err := clickhouse.NewClient(clickhouse.PrimaryDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error creating clickhouse client: %v", err)
	}

	log.WithContext(ctx).Info("set up clients")

	var sessionIds []int
	if err := db.Raw(`
		SELECT id
		FROM sessions
		WHERE created_at >= now() - interval '30 days'
		AND project_id = 898
	`).Scan(&sessionIds).Error; err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	log.WithContext(ctx).Infof("got %d sessions", sessionIds)

	sessionIdChunks := lo.Chunk(lo.Uniq(sessionIds), SessionsMaxRowsPostgres)
	if len(sessionIdChunks) > 0 {
		allSessionObjs := []*model.Session{}
		for idx, chunk := range sessionIdChunks {
			log.WithContext(ctx).Infof("running chunk %d of %d", idx+1, len(sessionIdChunks))

			sessionObjs := []*model.Session{}
			if err := db.Model(&model.Session{}).Preload("ViewedByAdmins").Where("id in ?", chunk).Find(&sessionObjs).Error; err != nil {
				log.WithContext(ctx).Fatal(err)
			}

			fieldObjs := []*model.Field{}
			if err := db.Model(&model.Field{}).Where("id IN (SELECT field_id FROM session_fields sf WHERE sf.session_id IN ?)", chunk).Find(&fieldObjs).Error; err != nil {
				log.WithContext(ctx).Fatal(err)
			}
			fieldsById := lo.KeyBy(fieldObjs, func(f *model.Field) int64 {
				return f.ID
			})

			type sessionField struct {
				SessionID int
				FieldID   int64
			}
			sessionFieldObjs := []*sessionField{}
			if err := db.Table("session_fields").Where("session_id IN ?", chunk).Find(&sessionFieldObjs).Error; err != nil {
				log.WithContext(ctx).Fatal(err)
			}
			sessionToFields := lo.GroupBy(sessionFieldObjs, func(sf *sessionField) int {
				return sf.SessionID
			})

			for _, session := range sessionObjs {
				session.Fields = lo.Map(sessionToFields[session.ID], func(sf *sessionField, _ int) *model.Field {
					return fieldsById[sf.FieldID]
				})
			}

			allSessionObjs = append(allSessionObjs, sessionObjs...)

			if len(allSessionObjs) >= 10000 {
				log.WithContext(ctx).Infof("flushing with %d sessions", len(allSessionObjs))

				if err := clickhouseClient.WriteSessions(ctx, allSessionObjs); err != nil {
					log.WithContext(ctx).Fatal(err)
				}
				allSessionObjs = []*model.Session{}
			}
		}

		if len(allSessionObjs) > 0 {
			log.WithContext(ctx).Infof("final flush with %d sessions", len(allSessionObjs))
			if err := clickhouseClient.WriteSessions(ctx, allSessionObjs); err != nil {
				log.WithContext(ctx).Fatal(err)
			}
		}
	}
}
