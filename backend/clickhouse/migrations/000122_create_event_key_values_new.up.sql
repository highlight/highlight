CREATE TABLE IF NOT EXISTS event_key_values_new (
    `ProjectId` Int32,
    `Event` LowCardinality(String),
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) ENGINE = SummingMergeTree
ORDER BY (ProjectId, Event, Key, Day, Value);