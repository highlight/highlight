CREATE TABLE IF NOT EXISTS session_keys_new (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Type` LowCardinality(String),
    `Count` UInt64
) ENGINE = SummingMergeTree
ORDER BY (ProjectId, Key, Day, Type) TTL Day + toIntervalDay(31);
CREATE MATERIALIZED VIEW IF NOT EXISTS session_keys_mv_new TO session_keys_new (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Type` LowCardinality(String),
    `Count` UInt64
) AS
SELECT ProjectID as ProjectId,
    Name as Key,
    toStartOfDay(SessionCreatedAt) AS Day,
    if(
        isNull(toFloat64OrNull(Value)),
        'String',
        'Numeric'
    ) AS Type,
    count() AS Count
FROM fields
GROUP BY ProjectId,
    Key,
    Day,
    Type;