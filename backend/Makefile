start:
		doppler run -- air -c .air.toml
start-no-doppler:
		air -c .air.toml
debug:
		doppler run -- dlv debug --headless --listen=:2345 --api-version=2 --accept-multiclient
debug-no-doppler:
		dlv debug --headless --listen=:2345 --api-version=2 --accept-multiclient
public-gen:
		(cd ./public-graph; go run github.com/99designs/gqlgen)
private-gen:
		(cd ./private-graph; go run github.com/99designs/gqlgen)
private-test:
		(cd ./private-graph/graph; CLICKHOUSE_ADDRESS=localhost:9000 CLICKHOUSE_DATABASE=default CLICKHOUSE_TEST_DATABASE=test CLICKHOUSE_USERNAME=default ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test ./... -v)
public-test:
		(cd ./public-graph/graph; CLICKHOUSE_ADDRESS=localhost:9000 CLICKHOUSE_DATABASE=default CLICKHOUSE_TEST_DATABASE=test CLICKHOUSE_USERNAME=default ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test ./... -v)
model-test:
		(cd ./model; CLICKHOUSE_ADDRESS=localhost:9000 CLICKHOUSE_DATABASE=default CLICKHOUSE_TEST_DATABASE=test CLICKHOUSE_USERNAME=default ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test ./... -v)
payload-test:
		(cd ./payload; CLICKHOUSE_ADDRESS=localhost:9000 CLICKHOUSE_DATABASE=default CLICKHOUSE_TEST_DATABASE=test CLICKHOUSE_USERNAME=default ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test ./... -v)
worker-test:
		(cd ./worker; CLICKHOUSE_ADDRESS=localhost:9000 CLICKHOUSE_DATABASE=default CLICKHOUSE_TEST_DATABASE=test CLICKHOUSE_USERNAME=default ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test ./... -v)
test-and-coverage:
		(CLICKHOUSE_ADDRESS=localhost:9000 CLICKHOUSE_DATABASE=default CLICKHOUSE_TEST_DATABASE=test CLICKHOUSE_USERNAME=default ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test -p 1 -covermode=atomic -coverprofile=coverage.out ./... -v)
test:
		(CLICKHOUSE_ADDRESS=localhost:9000 CLICKHOUSE_DATABASE=default CLICKHOUSE_TEST_DATABASE=test CLICKHOUSE_USERNAME=default ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test -p 1 --race ./... -v)
fuzz:
	for file in $$(grep -r --include='**_test.go' --files-with-matches 'func Fuzz' .); do \
	  funcs=$$(grep -oP 'func \K(Fuzz\w*)' $$file); \
	  for func in $${funcs}; do \
		  echo "Fuzzing $$func in $$file"; \
		  parentDir=$$(dirname $$file); \
		  CLICKHOUSE_ADDRESS='localhost:9000' CLICKHOUSE_DATABASE=default \
		  CLICKHOUSE_TEST_DATABASE=test CLICKHOUSE_USERNAME=default \
		  ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 \
		  PSQL_USER=postgres PSQL_PASSWORD=postgres \
		  go test $$parentDir -run=$$func -fuzz=$$func -fuzztime=5s || exit 1; \
	  done \
	done
report-stripe-usage:
		(go build; doppler run -- ./backend -runtime=worker -worker-handler=report-stripe-usage)
start-metric-monitor-watch:
		(go build; doppler run -- ./backend -runtime=worker -worker-handler=metric-monitors)
start-log-alerts-watch:
		(go build; doppler run -- ./backend -runtime=worker -worker-handler=log-alerts)
backfill-stack-frames:
		(go build; doppler run -- ./backend -runtime=worker -worker-handler=backfill-stack-frames)
refresh-materialized-views:
		(go build; doppler run -- ./backend -runtime=worker -worker-handler=refresh-materialized-views)
public-worker:
		(go build; doppler run -- ./backend -runtime=worker -worker-handler=public-worker)
auto-resolve-stale-errors:
		(go build; doppler run -- ./backend -runtime=worker -worker-handler=auto-resolve-stale-errors)
migrate:
		(doppler run -- go run ./migrations/main.go)
