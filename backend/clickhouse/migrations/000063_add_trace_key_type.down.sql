ALTER TABLE trace_keys DROP COLUMN Type;
DROP VIEW IF EXISTS trace_keys_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_keys_mv TO trace_keys (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Count` UInt64
) AS
SELECT ProjectId,
    Key,
    Day,
    sum(Count) AS Count
FROM trace_key_values
GROUP BY ProjectId,
    Key,
    Day;