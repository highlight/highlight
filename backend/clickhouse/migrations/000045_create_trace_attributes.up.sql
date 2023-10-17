CREATE TABLE IF NOT EXISTS trace_attributes (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `TraceTimestamp` DateTime,
    `TraceUUID` UUID,
    `Value` String
) ENGINE = ReplacingMergeTree
ORDER BY (ProjectId, Key, TraceTimestamp, TraceUUID, Value) TTL TraceTimestamp + toIntervalDay(30);