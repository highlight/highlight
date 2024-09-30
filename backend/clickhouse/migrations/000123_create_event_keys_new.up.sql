CREATE TABLE IF NOT EXISTS event_keys_new (
    `ProjectId` Int32,
    `Event` LowCardinality(String),
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Count` UInt64,
    `Type` String
) ENGINE = SummingMergeTree
ORDER BY (ProjectId, Event, Key, Day);