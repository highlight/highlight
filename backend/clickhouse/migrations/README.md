# Clickhouse migrations

We use the [migrate](https://github.com/golang-migrate/migrate) tool to manage migrations.

## Generate new migration

```bash
brew install golang-migrate
migrate create -ext sql -dir backend/clickhouse/migrations -seq create_logs_table
```

## Run migrations manually

### Up

`migrate -database "clickhouse://localhost:9000?username=default&password=&database=default&x-multi-statement=true" -path backend/clickhouse/migrations up`

### Down

`migrate -database "clickhouse://localhost:9000?username=default&password=&database=default&x-multi-statement=true" -path backend/clickhouse/migrations down`

## Notes

Migrations are stored in a `schema_migrations` table using a `MergeTree` engine because the [default](https://github.com/golang-migrate/migrate/tree/master/database/clickhouse#notes), `TinyLog`, does not work on Clickhouse Cloud.
