start:
		doppler run -- air -c .air.toml
public-gen:
		(cd ./public-graph; go run github.com/99designs/gqlgen)
private-gen:
		(cd ./private-graph; go run github.com/99designs/gqlgen)
test-private:
		(cd ./private-graph/graph; LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test ./... -v)
test-public:
		(cd ./public-graph/graph; LOG_LEVEL=debug PSQL_HOST=localhost PSQL_PORT=5432 PSQL_USER=postgres PSQL_PASSWORD=postgres go test ./... -v)
