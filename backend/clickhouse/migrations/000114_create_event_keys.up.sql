CREATE TABLE IF NOT EXISTS event_keys (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Count` UInt64,
    `Type` String
) ENGINE = SummingMergeTree
ORDER BY (ProjectId, Key, Day);