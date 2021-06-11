package graph

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/go-test/deep"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

var DB *gorm.DB

func createAndMigrateTestDB(dbName string) (*gorm.DB, error) {
	log.Println("host", os.Getenv("PSQL_HOST"))
	psqlConf := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s sslmode=disable",
		os.Getenv("PSQL_HOST"),
		os.Getenv("PSQL_PORT"),
		os.Getenv("PSQL_USER"),
		os.Getenv("PSQL_PASSWORD"))
	// Open the database object without an actual db_name.
	db, err := gorm.Open(postgres.Open(psqlConf))
	if err != nil {
		return nil, errors.Wrap(err, "error opening test db")
	}
	sqlDB, err := db.DB()
	if err != nil {
		return nil, errors.Wrap(err, "error retrieving test db")
	}
	defer sqlDB.Close()
	// Attempt to create the database.
	err = db.Exec(fmt.Sprintf("CREATE DATABASE %v;", dbName)).Error
	if err != nil {
		log.Error("rip creating db")
	}
	return model.SetupDB(dbName)
}

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	var err error
	DB, err = createAndMigrateTestDB("highlight_testing_db")
	if err != nil {
		log.Errorf("error creating testdb: %v", err)
	}
	code := m.Run()
	os.Exit(code)
}

func TestHideViewedSessions(t *testing.T) {
	// insert data
	sessionsToInsert := []model.Session{
		{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.T},
		{ActiveLength: 1000, OrganizationID: 1, Viewed: &model.F},
	}
	if err := DB.Create(&sessionsToInsert).Error; err != nil {
		t.Fatalf("error inserting sessions: %v", err)
	}
	fieldsToInsert := []model.Field{
		{
			Type:           "session",
			OrganizationID: 1,
			Sessions:       sessionsToInsert,
		},
	}
	if err := DB.Create(&fieldsToInsert).Error; err != nil {
		t.Fatalf("error inserting sessions: %v", err)
	}

	defer func(DB *gorm.DB, t *testing.T) {
		if err := DB.Exec("DELETE FROM sessions;").Error; err != nil {
			t.Fatalf("error deleting from sessions: %v", err)
		}
		if err := DB.Exec("DELETE FROM fields;").Error; err != nil {
			t.Fatalf("error deleting from fields: %v", err)
		}
		if err := DB.Exec("DELETE FROM session_fields;").Error; err != nil {
			t.Fatalf("error deleting from session_fields: %v", err)
		}
	}(DB, t)

	// test
	r := &queryResolver{Resolver: &Resolver{DB: DB}}
	params := &modelInputs.SearchParamsInput{HideViewed: &model.T}
	sessions, err := r.Sessions(context.Background(), 1, 5, modelInputs.SessionLifecycleAll, false, params)
	if err != nil {
		t.Fatalf("error querying sessions: %v", err)
	}
	expected := &model.SessionResults{
		Sessions: []model.Session{
			{Viewed: &model.F, WithinBillingQuota: &model.T},
		},
		TotalCount: 2,
	}
	log.Infof("received sessions: %+v", sessions)
	if diff := deep.Equal(sessions, expected); diff != nil {
		t.Fatalf("received sessions and expected sessions not equal: %v", diff)
	}
}

func TestSessionsOther(t *testing.T) {
	log.Println("hillo")
}
