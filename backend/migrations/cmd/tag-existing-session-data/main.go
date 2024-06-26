package main

import (
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/storage"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

func main() {
	ctx := context.Background()
	log.WithContext(ctx).Info("setting up db")
	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	storageClient, err := storage.NewS3Client(ctx)
	if err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	projects := []*model.Project{}
	if err := db.Model(&model.Project{}).Find(&projects).Error; err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	workspaces := []*model.Workspace{}
	if err := db.Model(&model.Workspace{}).Find(&workspaces).Error; err != nil {
		log.WithContext(ctx).Fatal(err)
	}

	workspaceIdToRetentionPeriod := lo.Associate(workspaces, func(w *model.Workspace) (int, modelInputs.RetentionPeriod) {
		retentionPeriod := modelInputs.RetentionPeriodSixMonths
		if w.RetentionPeriod != nil {
			retentionPeriod = *w.RetentionPeriod
		}
		return w.ID, retentionPeriod
	})

	projectIdToRetentionPeriod := lo.Associate(projects, func(p *model.Project) (int, modelInputs.RetentionPeriod) {
		return p.ID, workspaceIdToRetentionPeriod[p.WorkspaceID]
	})

	projectIds := lo.Keys(projectIdToRetentionPeriod)
	slices.Sort(projectIds)

	type config struct {
		bucket string
		prefix string
	}

	configs := []config{
		{
			bucket: storage.S3SessionsPayloadBucketNameNew,
			prefix: "v2/",
		},
		{
			bucket: storage.S3ResourcesBucketName,
			prefix: "",
		},
	}

	for _, config := range configs {
		log.WithContext(ctx).Infof("starting tagging for bucket %s", config.bucket)

		for _, projectId := range projectIds {
			log.WithContext(ctx).Infof("starting tagging for project %d", projectId)

			retentionPeriod := projectIdToRetentionPeriod[projectId]

			var continuationToken *string
			for {
				resp, err := storageClient.S3ClientEast2.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
					Bucket:            pointy.String(config.bucket),
					Prefix:            pointy.String(fmt.Sprintf("%s%d/", config.prefix, projectId)),
					ContinuationToken: continuationToken,
				})
				if err != nil {
					log.WithContext(ctx).Fatal(err)
				}

				for _, item := range resp.Contents {
					_, err := storageClient.S3ClientEast2.PutObjectTagging(ctx, &s3.PutObjectTaggingInput{
						Bucket: pointy.String(config.bucket),
						Key:    item.Key,
						Tagging: &types.Tagging{
							TagSet: []types.Tag{
								{
									Key:   pointy.String("RetentionPeriod"),
									Value: pointy.String(string(retentionPeriod))},
							},
						},
					})
					if err != nil {
						log.WithContext(ctx).Fatal(err)
					}
				}

				if resp.IsTruncated == nil || !*resp.IsTruncated {
					break
				}
				continuationToken = resp.NextContinuationToken
			}

			log.WithContext(ctx).Infof("done tagging for project %d", projectId)
		}
	}
}
