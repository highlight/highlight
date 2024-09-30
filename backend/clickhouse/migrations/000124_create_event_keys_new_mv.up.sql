CREATE MATERIALIZED VIEW IF NOT EXISTS event_keys_new_mv TO event_keys_new (
    `ProjectId` Int32,
    `Event` LowCardinality(String),
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Type` LowCardinality(String),
    `Count` UInt64
) AS
SELECT ProjectId,
    Event,
    Key,
    Day,
    if(
        isNull(toFloat64OrNull(Value)),
        'String',
        'Numeric'
    ) AS Type,
    sum(Count) AS Count
FROM event_key_values_new
GROUP BY ProjectId,
    Event,
    Key,
    Day,
    Type;