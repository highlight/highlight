package util

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"testing"
	"time"
	"unsafe"

	e "github.com/pkg/errors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
)

func RunTestWithDBWipe(t *testing.T, name string, db *gorm.DB, f func(t *testing.T)) {
	defer func(db *gorm.DB) {
		err := ClearTablesInDB(db)
		if err != nil {
			t.Fatal(e.Wrap(err, "error clearing database"))
		}
	}(db)
	t.Run(name, f)
}

const letterBytes = "abcdefghijklmnopqrstuvwxyz"
const (
	letterIdxBits = 6                    // 6 bits to represent a letter index
	letterIdxMask = 1<<letterIdxBits - 1 // All 1-bits, as many as letterIdxBits
	letterIdxMax  = 63 / letterIdxBits   // # of letter indices fitting in 63 bits
)

var src = rand.NewSource(time.Now().UnixNano())

func RandStringBytesMaskImprSrcUnsafe(n int) string {
	b := make([]byte, n)
	// A src.Int63() generates 63 random bits, enough for letterIdxMax characters!
	for i, cache, remain := n-1, src.Int63(), letterIdxMax; i >= 0; {
		if remain == 0 {
			cache, remain = src.Int63(), letterIdxMax
		}
		if idx := int(cache & letterIdxMask); idx < len(letterBytes) {
			b[i] = letterBytes[idx]
			i--
		}
		cache >>= letterIdxBits
		remain--
	}

	return *(*string)(unsafe.Pointer(&b))
}

func ExperimentalRunTestWithDBWipe(t *testing.T, name string, f func(t *testing.T, db *gorm.DB)) {
	dbName := fmt.Sprintf("test_db_%v", RandStringBytesMaskImprSrcUnsafe(10))
	DB, err := CreateAndMigrateTestDB(dbName)
	if err != nil {
		fmt.Println(fmt.Errorf("riparooni: %w", err))
		return
	}
	rawDB, err := DB.DB()
	if err != nil {
		fmt.Println(fmt.Errorf("rip: %w", err))
	}
	defer func(*sql.DB, string) {
		if _, err := rawDB.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %v;", dbName)); err != nil {
			t.Fatal(e.Wrap(err, "error dropping db"))
		}
	}(rawDB, dbName)
	t.Run(name, func(t *testing.T) {
		f(t, DB)
	})
}

func CreateAndMigrateTestDB(dbName string) (*gorm.DB, error) {
	psqlConf := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s sslmode=disable",
		os.Getenv("PSQL_HOST"),
		os.Getenv("PSQL_PORT"),
		os.Getenv("PSQL_USER"),
		os.Getenv("PSQL_PASSWORD"))
	// Open the database object without an actual db_name.
	db, err := gorm.Open(postgres.Open(psqlConf))
	if err != nil {
		return nil, e.Wrap(err, "error opening test db")
	}
	sqlDB, err := db.DB()
	if err != nil {
		return nil, e.Wrap(err, "error retrieving test db")
	}
	defer sqlDB.Close()
	// drop db if exists
	if err := db.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %v;", dbName)).Error; err != nil {
		return nil, e.Wrap(err, "error dropping db")
	}
	// Attempt to create the database.
	if err := db.Exec(fmt.Sprintf("CREATE DATABASE %v;", dbName)).Error; err != nil {
		return nil, e.Wrap(err, "error creating db")
	}
	return model.SetupDB(dbName)
}

func ClearTablesInDB(db *gorm.DB) error {
	for _, m := range model.Models {
		if err := db.Unscoped().Where("1=1").Delete(m).Error; err != nil {
			return e.Wrap(err, "error deleting table in db")
		}
	}
	return nil
}

func MakeIntPointer(v int) *int {
	return &v
}

func MakeStringPointer(v string) *string {
	return &v
}

func MakeStringPointerFromInterface(v interface{}) *string {
	exampleErrorTraceBytes, _ := json.Marshal(&v)
	exampleErrorTraceString := string(exampleErrorTraceBytes)
	return &exampleErrorTraceString
}
