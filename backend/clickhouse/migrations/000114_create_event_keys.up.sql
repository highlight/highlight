CREATE TABLE IF NOT EXISTS event_keys (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Count` UInt64
) ENGINE = SummingMergeTree
ORDER BY (ProjectId, Key, Day) TTL Day + toIntervalDay(91);