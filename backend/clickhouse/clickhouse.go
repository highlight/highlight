package clickhouse

import (
	"crypto/tls"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/projectpath"
	log "github.com/sirupsen/logrus"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/golang-migrate/migrate/v4"
	clickhouseMigrate "github.com/golang-migrate/migrate/v4/database/clickhouse"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

type Client struct {
	Conn driver.Conn
}

var (
	ServerAddr      = os.Getenv("CLICKHOUSE_ADDRESS")
	PrimaryDatabase = os.Getenv("CLICKHOUSE_DATABASE") // typically 'default', clickhouse needs an existing database to handle connections
	TestDatabase    = os.Getenv("CLICKHOUSE_TEST_DATABASE")
	Username        = os.Getenv("CLICKHOUSE_USERNAME")
	Password        = os.Getenv("CLICKHOUSE_PASSWORD")
)

func NewClient(dbName string) (*Client, error) {
	options := getClickhouseOptions(dbName)
	log.Print(options)
	conn, err := clickhouse.Open(getClickhouseOptions(dbName))

	return &Client{
		Conn: conn,
	}, err
}

func RunMigrations(dbName string) {
	options := getClickhouseOptions(dbName)
	db := clickhouse.OpenDB(options)
	driver, err := clickhouseMigrate.WithInstance(db, &clickhouseMigrate.Config{
		MigrationsTableEngine: "MergeTree",
	})

	log.Printf("Starting clickhouse migrations for db: %s", dbName)

	if err != nil {
		log.Fatalf("Error creating clickhouse db instance for migrations: %v", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		fmt.Sprintf("file:///%s/clickhouse/migrations", projectpath.Root),
		dbName,
		driver,
	)

	if err != nil {
		log.Fatalf("Error creating clickhouse db instance for migrations: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("Error running clickhouse migrations: %v", err)
	} else {
		log.Printf("Finished clickhouse migrations for db: %s", dbName)
	}
}

func useTLS() bool {
	return strings.HasSuffix(ServerAddr, "9440")
}

func getClickhouseOptions(dbName string) *clickhouse.Options {
	options := &clickhouse.Options{
		Addr: []string{ServerAddr},
		Auth: clickhouse.Auth{
			Database: dbName,
			Username: Username,
			Password: Password,
		},
		DialTimeout: time.Duration(10) * time.Second,
	}

	if useTLS() {
		options.TLS = &tls.Config{}
	}

	return options
}
