CREATE TABLE IF NOT EXISTS log_attributes (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `LogTimestamp` DateTime,
    `LogUUID` UUID,
    `Value` String
) ENGINE = ReplacingMergeTree
ORDER BY (ProjectId, Key, LogTimestamp, LogUUID, Value) TTL LogTimestamp + toIntervalDay(30);