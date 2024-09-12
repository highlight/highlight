CREATE TABLE IF NOT EXISTS session_keys_new (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Type` LowCardinality(String),
    `Count` UInt64
) ENGINE = SummingMergeTree
ORDER BY (ProjectId, Key, Day, Type) TTL Day + toIntervalDay(31);
CREATE MATERIALIZED VIEW IF NOT EXISTS session_keys_new_mv TO session_keys_new (
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

INSERT INTO session_keys_new
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

DROP TABLE session_keys;
DROP VIEW session_keys_mv;

RENAME TABLE session_keys_new TO session_keys;
RENAME TABLE session_keys_new_mv TO session_keys_mv;