package main

import (
	"context"
	"encoding/json"
	"flag"
	"github.com/highlight-run/highlight/backend/env"
	"strings"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	log "github.com/sirupsen/logrus"
)

var (
	confirm = flag.Bool("confirm", false, "confirm migration or run in dry run mode")
)

func init() {
	flag.Parse()
	if confirm == nil {
		confirm = ptr.Bool(false)
	}
}

func main() {
	highlight.SetProjectID("1jdkoe52")
	highlight.Start(
		highlight.WithServiceName("task--update-error-alerts"),
		highlight.WithServiceVersion(env.Config.Version),
		highlight.WithEnvironment(env.EnvironmentName()),
	)
	defer highlight.Stop()
	hlog.Init()

	ctx := context.TODO()
	dryRun := !*confirm

	if dryRun {
		log.WithContext(ctx).Info("Running in dry run mode")
	} else {
		log.WithContext(ctx).Info("Running in migration mode")
	}

	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up DB: %v", err)
	}

	alerts := []*model.ErrorAlert{}
	if err := db.WithContext(ctx).Model(model.ErrorAlert{}).Where("excluded_environments IS NOT NULL AND excluded_environments != '[]'").Find(&alerts).Error; err != nil {
		log.WithContext(ctx).Fatalf("error querying error alerts: %v", err)
	}

	log.WithContext(ctx).Infof("updating %d error alerts", len(alerts))

	updatedCount := 0
	skipCount := 0
	errorCount := 0

	for _, alert := range alerts {
		query, err := translateEnvironments(alert.ExcludedEnvironments)
		if err != nil {
			log.WithContext(ctx).Errorf("error translating environments for alert %d: %v", alert.ID, err)
			errorCount++
			continue
		}
		if query == nil {
			log.WithContext(ctx).Infof("skipping alert %d, no query", alert.ID)
			skipCount++
			continue
		}
		alert.Query = *query

		// create new saved segment
		if dryRun {
			log.WithContext(ctx).Infof("would update alert %d: %s", alert.ID, alert.Query)
		} else {
			if err := db.WithContext(ctx).Model(&model.ErrorAlert{
				Model: model.Model{
					ID: alert.ID,
				},
			}).Updates(alert).Error; err != nil {
				log.WithContext(ctx).Errorf("error updating alert %d, %v", alert.ID, err)
				errorCount++
				continue
			}
		}

		updatedCount++
	}

	if dryRun {
		log.WithContext(ctx).Infof("Dry run complete: %d TO BE migrated, %d skipped, %d errored", updatedCount, skipCount, errorCount)
	} else {
		log.WithContext(ctx).Infof("Update complete: %d migrated, %d skipped, %d errored", updatedCount, skipCount, errorCount)
	}
}

func translateEnvironments(envString *string) (*string, error) {
	if envString == nil {
		return nil, nil
	}

	var envs []string
	err := json.Unmarshal([]byte(*envString), &envs)
	if err != nil {
		return nil, err
	}

	if len(envs) == 0 {
		return nil, nil
	}

	queryString := "environment!="
	if len(envs) > 1 {
		queryValues := strings.Join(envs, " OR ")
		queryString += "(" + queryValues + ")"
	} else {
		queryString += envs[0]
	}

	return &queryString, nil
}
