package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
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
	db, err := model.SetupDB(ctx, os.Getenv("PSQL_DB"))
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
		for _, projectId := range projectIds {
			retentionPeriod := projectIdToRetentionPeriod[projectId]

			var continuationToken *string
			for n := 0; ; n++ {
				log.WithContext(ctx).Infof("tagging for bucket %s project %d iteration %d", config.bucket, projectId, n)

				resp, err := storageClient.S3ClientEast2.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
					Bucket:            pointy.String(config.bucket),
					Prefix:            pointy.String(fmt.Sprintf("%s%d/", config.prefix, projectId)),
					ContinuationToken: continuationToken,
				})
				if err != nil {
					log.WithContext(ctx).Fatal(err)
				}

				var objectsToDelete []types.ObjectIdentifier
				for _, item := range resp.Contents {
					var retainUntil time.Time
					switch retentionPeriod {
					case modelInputs.RetentionPeriodThreeMonths:
						retainUntil = item.LastModified.AddDate(0, 3, 0)
					case modelInputs.RetentionPeriodSixMonths:
						retainUntil = item.LastModified.AddDate(0, 6, 0)
					case modelInputs.RetentionPeriodTwelveMonths:
						retainUntil = item.LastModified.AddDate(0, 12, 0)
					case modelInputs.RetentionPeriodTwoYears:
						retainUntil = item.LastModified.AddDate(2, 0, 0)
					default:
						log.WithContext(ctx).Fatalf("invalid retention period %s", retentionPeriod)
					}
					if retainUntil.Before(time.Now()) {
						objectsToDelete = append(objectsToDelete, types.ObjectIdentifier{Key: pointy.String(*item.Key)})
					}
				}

				if len(objectsToDelete) > 0 {
					if _, err := storageClient.S3ClientEast2.DeleteObjects(ctx, &s3.DeleteObjectsInput{
						Bucket: pointy.String(config.bucket),
						Delete: &types.Delete{
							Objects: objectsToDelete,
						},
					}); err != nil {
						log.WithContext(ctx).Fatal(err)
					}
				}

				if !resp.IsTruncated {
					break
				}
				continuationToken = resp.NextContinuationToken
			}

			log.WithContext(ctx).Infof("done tagging for project %d", projectId)
		}
	}
}
