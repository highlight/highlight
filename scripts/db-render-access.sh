#!/bin/sh
doppler run -c prd --command "PGPASSWORD=\$PSQL_PASSWORD pgcli -h oregon-postgres.render.com -U \$PSQL_USER \$PSQL_DB"
