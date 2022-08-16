#!/bin/sh
doppler run -c prod_aws --command "PGPASSWORD=\$PSQL_PASSWORD pgcli --pgclirc=./pgclirc --auto-vertical-output -h \$PSQL_HOST -U \$PSQL_USER \$PSQL_DB"
