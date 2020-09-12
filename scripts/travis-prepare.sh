#!/usr/bin/env bash
#   Use this script to test if a given TCP host/port are available

echo 'npm ci:' && echo -en 'travis_fold:start:script.1\\r'
npm ci
echo -en 'travis_fold:end:script.1\\r'

docker-compose up -d graph-node
./wait-for-it.sh 127.0.0.1:8545
./wait-for-it.sh 127.0.0.1:8000
./scripts/wait-for-it.sh 127.0.0.1:8020

echo 'Debug info:' && echo -en 'travis_fold:start:script.3\\r'
docker-compose logs ganache
docker-compose logs graph-node
echo -en 'travis_fold:end:script.3\\r'
echo -en 'travis_fold:end:script.2\\r'
./wait-for-subgraph.sh
