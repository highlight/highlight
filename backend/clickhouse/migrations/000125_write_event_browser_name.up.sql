CREATE MATERIALIZED VIEW IF NOT EXISTS event_browser_name_mv TO event_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectID as ProjectId,
    'browser_name' AS Key,
    toStartOfDay(Timestamp) AS Day,
    BrowserName AS Value,
    count() AS Count
FROM sessions
WHERE (BrowserName != '')
GROUP BY ProjectId,
    Key,
    Day,
    Value;