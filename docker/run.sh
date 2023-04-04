#!/bin/bash -ex

source env.sh
./start-infra.sh

./run-frontend.sh &
./run-backend.sh &
echo 'waiting for highlight app to come online'
yarn dlx wait-on -l -s 3 https://localhost:3000/index.html http://localhost:8080/dist/index.js https://localhost:8082/health

echo 'Highlight started on https://localhost:3000'
wait
