ALTER TABLE trace_keys
ADD COLUMN Type LowCardinality(String);
DROP VIEW IF EXISTS trace_keys_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_keys_mv TO trace_keys (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Count` UInt64,
    `Type` String
) AS
SELECT ProjectId,
    Key,
    Day,
    sum(Count) AS Count,
    if(
        isNull(toFloat64OrNull(Value)),
        'String',
        'Numeric'
    ) AS Type
FROM trace_key_values
GROUP BY ProjectId,
    Key,
    Day,
    isNull(toFloat64OrNull(Value));