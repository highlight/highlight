package clickhouse

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/env"
	"github.com/samber/lo"
	"go.opentelemetry.io/otel/attribute"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/golang-migrate/migrate/v4"
	clickhouseMigrate "github.com/golang-migrate/migrate/v4/database/clickhouse"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/highlight-run/highlight/backend/projectpath"
	hmetric "github.com/highlight/highlight/sdk/highlight-go/metric"
	log "github.com/sirupsen/logrus"
)

type Client struct {
	conn         driver.Conn
	connReadonly driver.Conn
}

var (
	ServerAddr      = env.Config.ClickhouseAddress
	PrimaryDatabase = env.Config.ClickhouseDatabase // typically 'default', clickhouse needs an existing database to handle connections
	TestDatabase    = env.Config.ClickhouseTestDatabase
	DefaultUser     = env.Config.ClickhouseUsername
	ReadonlyUser    = env.Config.ClickhouseUsernameReadOnly
	Password        = env.Config.ClickhousePassword
)

func GetPostgresConnectionString() string {
	return fmt.Sprintf("postgresql('%s:%s', '%s', 'sessions', '%s', '%s')", env.Config.SQLDockerHost, env.Config.SQLPort, env.Config.SQLDatabase, env.Config.SQLUser, env.Config.SQLPassword)
}

func NewClient(dbName string) (*Client, error) {
	opts := getClickhouseOptions(dbName, DefaultUser)
	opts.MaxIdleConns = 10
	opts.MaxOpenConns = 100
	conn, err := clickhouse.Open(opts)

	optsReadonly := getClickhouseOptions(dbName, ReadonlyUser)
	optsReadonly.MaxIdleConns = 10
	optsReadonly.MaxOpenConns = 100
	connReadonly, errReadonly := clickhouse.Open(optsReadonly)

	go func() {
		for {
			for _, c := range []driver.Conn{conn, connReadonly} {
				stats := c.Stats()
				name := lo.Ternary(c == conn, "conn", "connReadonly")
				log.WithContext(context.Background()).WithField("Open", stats.Open).WithField("Idle", stats.Idle).WithField("MaxOpenConns", stats.MaxOpenConns).WithField("MaxIdleConns", stats.MaxIdleConns).WithField("Name", name).Debug("Clickhouse Connection Stats")
				tags := []attribute.KeyValue{attribute.String("name", name)}
				hmetric.Gauge(context.Background(), "clickhouse.open", float64(stats.Open), tags, 1)
				hmetric.Gauge(context.Background(), "clickhouse.idle", float64(stats.Idle), tags, 1)
			}
			time.Sleep(5 * time.Second)
		}
	}()

	return &Client{
		conn:         conn,
		connReadonly: connReadonly,
	}, errors.Join(err, errReadonly)
}

func RunMigrations(ctx context.Context, dbName string) {
	options := getClickhouseOptions(dbName, DefaultUser)
	db := clickhouse.OpenDB(options)
	driver, err := clickhouseMigrate.WithInstance(db, &clickhouseMigrate.Config{
		MigrationsTableEngine: "MergeTree",
		MultiStatementEnabled: true,
	})

	log.WithContext(ctx).Printf("Starting clickhouse migrations for db: %s", dbName)

	if err != nil {
		log.WithContext(ctx).Fatalf("Error creating clickhouse db instance for migrations: %v", err)
	}

	migrationsPath := filepath.Join(projectpath.GetRoot(), "clickhouse", "migrations")
	m, err := migrate.NewWithDatabaseInstance(
		"file://"+migrationsPath,
		dbName,
		driver,
	)

	if err != nil {
		log.WithContext(ctx).
			WithField("dbName", dbName).
			WithField("migrationsPath", migrationsPath).
			Fatalf("Error creating clickhouse db instance for migrations: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.WithContext(ctx).Fatalf("Error running clickhouse migrations: %v", err)
	} else {
		log.WithContext(ctx).Printf("Finished clickhouse migrations for db: %s", dbName)
	}
}

func (client *Client) HealthCheck(ctx context.Context) error {
	var v uint8
	err := client.conn.QueryRow(
		ctx,
		`SELECT 1`,
	).Scan(&v)
	if err != nil {
		return err
	} else if v != 1 {
		return errors.New("invalid value returned from clickhouse")
	}
	return nil
}

func useTLS() bool {
	return strings.HasSuffix(ServerAddr, "9440")
}

func getClickhouseOptions(dbName string, username string) *clickhouse.Options {
	options := &clickhouse.Options{
		Addr: []string{ServerAddr},
		Auth: clickhouse.Auth{
			Database: dbName,
			Username: username,
			Password: Password,
		},
		DialTimeout: time.Duration(25) * time.Second,
		Compression: &clickhouse.Compression{
			Method: clickhouse.CompressionZSTD,
		},
	}

	if useTLS() {
		options.TLS = &tls.Config{}
	}

	return options
}
