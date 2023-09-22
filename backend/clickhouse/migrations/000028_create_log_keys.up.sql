CREATE TABLE IF NOT EXISTS log_keys (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Count` UInt64
) ENGINE = SummingMergeTree
ORDER BY (ProjectId, Key, Day) TTL Day + toIntervalDay(31);