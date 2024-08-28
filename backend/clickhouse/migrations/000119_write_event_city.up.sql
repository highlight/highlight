CREATE MATERIALIZED VIEW IF NOT EXISTS event_city_mv TO event_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectID as ProjectId,
    'city' AS Key,
    toStartOfDay(CreatedAt) AS Day,
    City AS Value,
    count() AS Count
FROM sessions FINAL
WHERE (City != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;