CREATE TABLE IF NOT EXISTS alert_state_changes
(
    Timestamp DateTime64(6),
    ProjectID UInt32,
    AlertID UInt32,
    State LowCardinality(String),
    PreviousState LowCardinality(String),
    Title String,
    GroupByKey String,
    INDEX idx_alert_id          AlertId TYPE bloom_filter(0.001) GRANULARITY 1,
)   ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (
    ProjectId,
    toUnixTimestamp(Timestamp),
    AlertId
)
