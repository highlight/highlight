#!/bin/bash -e

echo "#!/bin/sh -e

OS=\$(uname -s)
ARCH=\$(uname -m)

if [ \"\${OS}\" = \"Linux\" ] || [ \"\${OS}\" = \"FreeBSD\" ] || [ \"\${OS}\" = \"Darwin\" ]
then" > ./curl.sh

cat ./telemetry.sh | grep -v '#!' >> ./curl.sh
cat ./.env | grep -vE '^#' | sed -e 's/^/export /' >> ./curl.sh
cat ./env.sh | grep -v '#!' >> ./curl.sh

echo "if [ -f \$ADMIN_PASSWORD ]; then
  echo 'Exiting because no ADMIN_PASSWORD_FOUND'
  exit 0
fi" >> ./curl.sh

cat ./start-infra.sh | grep -v '#!' >> ./curl.sh

echo "docker compose -f compose.yml -f compose.hobby.yml pull
docker compose -f compose.yml -f compose.hobby.yml up --detach --remove-orphans
echo 'waiting for highlight hobby deploy to come online'
yarn dlx wait-on -l -s 3 https://localhost:3000/index.html http://localhost:8080/dist/index.js https://localhost:8082/health

echo 'Highlight started on https://localhost:3000'
wait" >> ./curl.sh

echo "fi" >> ./curl.sh

# replace $* (args) with --go-docker --hobby to force those args for all invocations
sed -i -e 's/\$\*/--go-docker --hobby/g' curl.sh
