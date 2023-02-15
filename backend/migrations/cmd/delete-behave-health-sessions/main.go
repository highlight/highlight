package main

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/storage"
)

func main() {
	log.WithContext(ctx).Info("setting up db")
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up db: %+v", err)
	}

	var ids []int64
	if err := db.Debug().Raw(`
		SELECT id
		FROM sessions
		WHERE project_id=?
		AND identifier ILIKE '%?%'
	`, 1, "behavehealth.com").Scan(&ids).Error; err != nil {
		log.WithContext(ctx).Fatalf("epic fail lol gotem: %v", err)
	}

	var s3Keys []types.ObjectIdentifier
	for _, id := range ids {
		for _, suffix := range []string{"console-messages", "network-resources", "session-contents"} {
			key := fmt.Sprintf("1/%d/%s", id, suffix)
			s3Keys = append(s3Keys, types.ObjectIdentifier{Key: &key})
		}
	}

	storageClient, err := storage.NewStorageClient()
	if err != nil {
		log.WithContext(ctx).Fatalf("failed to initialize s3 client: %v", err)
	}
	_, err = storageClient.S3Client.DeleteObjects(context.Background(), &s3.DeleteObjectsInput{Bucket: &storage.S3SessionsPayloadBucketName, Delete: &types.Delete{Objects: s3Keys}})
	if err != nil {
		log.WithContext(ctx).Fatalf("failed to delete s3 objects: %v", err)
	}

	if err := db.Debug().Raw(`
		DELETE FROM sessions
		WHERE project_id=?
		AND identifier ILIKE '%?%'
	`, 1, "behavehealth.com").Error; err != nil {
		log.WithContext(ctx).Fatalf("failed to delete behave health sessions: %v", err)
	}
}
