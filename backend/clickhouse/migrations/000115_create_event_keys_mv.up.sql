CREATE MATERIALIZED VIEW IF NOT EXISTS event_keys_mv TO event_keys (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Type` LowCardinality(String),
    `Count` UInt64
) AS
SELECT ProjectId,
    Key,
    Day,
    if(
        isNull(toFloat64OrNull(Value)),
        'String',
        'Numeric'
    ) AS Type,
    sum(Count) AS Count
FROM event_key_values
GROUP BY ProjectId,
    Key,
    Day,
    Type;