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
		(cd ./private-graph/graph; ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test ./... -v)
public-test:
		(cd ./public-graph/graph; ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test ./... -v)
model-test:
		(cd ./model; ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test ./... -v)
payload-test:
		(cd ./payload; ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test ./... -v)
worker-test:
		(cd ./worker; ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test ./... -v)
test-and-coverage:
		(ENVIRONMENT=test LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test -p 1 -covermode=atomic -coverprofile=coverage.out ./... -v)
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
delete-completed-sessions:
		(go build; doppler run -- ./backend -runtime=worker -worker-handler=delete-completed-sessions)
public-worker:
		(go build; doppler run -- ./backend -runtime=worker -worker-handler=public-worker)
auto-resolve-stale-errors:
		(go build; doppler run -- ./backend -runtime=worker -worker-handler=auto-resolve-stale-errors)
migrate:
		(doppler run -- go run ./migrations/main.go)
