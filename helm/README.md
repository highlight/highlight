# Highlight Helm Chart

## Parameters

### Frontend Parameters

| Name                              | Description                                     | Value                                   |
| --------------------------------- | ----------------------------------------------- | --------------------------------------- |
| `frontend.image.repository`       | Highlight Frontend image registry               | `ghcr.io/highlight/highlight-frontend`  |
| `frontend.image.tag`              | Highlight Frontend image tag                    | `latest`                                |
| `frontend.image.pullpolicy`       | Highlight Frontend pull policy                  | `IfNotPresent`                          |
| `frontend.config.privateGraphUri` | Highlight Frontend Private GraphQL              | `https://localhost:8082/private`        |
| `frontend.config.publicGraphUri`  | Highlight Frontend Public GraphQL               | `https://localhost:8082/public`         |
| `frontend.config.frontendUri`     | Highlight Frontend Uri                          | `https://localhost:3000`                |

### Zookeeper Parameters

| Name                               | Description                            | Value                                   |
| ---------------------------------- | -------------------------------------- | --------------------------------------- |
| `zookeeper.image.repository`       | Zookeeper image registry               | `confluentinc/cp-zookeeper`             |
| `zookeeper.image.tag`              | Zookeeper image tag                    | `7.3.0`                                 |
| `zookeeper.image.pullpolicy`       | Zookeeper pull policy                  | `IfNotPresent`                          |
| `zookeeper.config.clientPort`      | Zookeeper port                         | `2181`                                  |
| `zookeeper.config.tickTime`        | Zookeeper tick time                    | `2000`                                  |