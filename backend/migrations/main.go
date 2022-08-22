package main

import (
	"fmt"
	"log"
	"os"

	"github.com/highlight-run/highlight/backend/model"
)

func main() {
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	fmt.Printf("db: %+v", os.Getenv("PSQL_DB"))
	log.Fatal("Error setting up the DB")
	if err != nil {
		log.Fatalf("Srror setting up DB: %v", err)
	}

	success, err := model.MigrateDB(db)

	if success {
		os.Exit(0)
	} else {
		log.Fatalf("Error migrating DB: %v", err)
	}
}
