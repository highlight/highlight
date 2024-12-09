# Highlight Helm Chart

## Parameters

### Frontend Parameters

| Name                              | Default Value                           |
| --------------------------------- | --------------------------------------- |
| `frontend.image.repository`       | `ghcr.io/highlight/highlight-frontend`  |
| `frontend.image.tag`              | `latest`                                |
| `frontend.image.pullpolicy`       | `IfNotPresent`                          |
| `frontend.config.privateGraphUri` | `https://localhost:8082/private`        |
| `frontend.config.publicGraphUri`  | `https://localhost:8082/public`         |
| `frontend.config.frontendUri`     | `https://localhost:3000`                |

### Kafka Parameters
| Name                                                | Default Value           |
| --------------------------------------------------- | ----------------------- |
| `kafka.image.repository`                            | `confluentinc/cp-kafka` |
| `kafka.image.tag`                                   | `7.3.0`                 |
| `kafka.image.pullpolicy`                            | `IfNotPresent`          |
| `kafka.config.port`                                 | `9092`                  |
| `kafka.config.brokerID`                             | `1`                     |
| `kafka.config.offsetsTopicReplicationFactor`        | `1`                     |
| `kafka.config.transactionStateLogMinISR`            | `1`                     |
| `kafka.config.transactionStateLogReplicationFactor` | `1`                     |
| `kafka.config.consumerMaxPartitionFetchBytes`       | `536870912`             |
| `kafka.config.messageMaxBytes`                      | `536870912`             |
| `kafka.config.producerMaxRequestSize`               | `536870912`             |
| `kafka.config.replicaFetchMaxBytes`                 | `536870912`             |

### Zookeeper Parameters

| Name                               | Default Value                           |
| ---------------------------------- | --------------------------------------- |
| `zookeeper.image.repository`       | `confluentinc/cp-zookeeper`             |
| `zookeeper.image.tag`              | `7.3.0`                                 |
| `zookeeper.image.pullpolicy`       | `IfNotPresent`                          |
| `zookeeper.config.clientPort`      | `2181`                                  |
| `zookeeper.config.tickTime`        | `2000`                                  |