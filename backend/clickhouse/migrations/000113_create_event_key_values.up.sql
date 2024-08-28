CREATE TABLE IF NOT EXISTS event_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) ENGINE = SummingMergeTree
ORDER BY (ProjectId, Key, Day, Value);