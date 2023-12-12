ALTER TABLE log_keys
ADD COLUMN Type LowCardinality(String);
DROP VIEW IF EXISTS log_keys_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS log_keys_mv TO log_keys (
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
FROM log_key_values
GROUP BY ProjectId,
    Key,
    Day,
    isNull(toFloat64OrNull(Value));