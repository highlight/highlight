CREATE TABLE IF NOT EXISTS alert_state_changes
(
    Timestamp DateTime64(6),
    ProjectID UInt32,
    AlertID UInt32,
    State LowCardinality(String),
    PreviousState LowCardinality(String),
    Title String,
    GroupByKey String,
)   ENGINE = MergeTree
ORDER BY (
    ProjectID,
    AlertID,
    toUnixTimestamp(Timestamp),
)
