CREATE MATERIALIZED VIEW IF NOT EXISTS log_keys_hourly_mv
ENGINE = SummingMergeTree
PARTITION BY toDate(Hour) ORDER BY (ProjectId, Hour)
POPULATE
AS 
SELECT
  toStartOfHour(Timestamp) AS Hour,
  ProjectId,
  arrayJoin(mapKeys(LogAttributes)) as Key,
  count() as Count
FROM logs
GROUP BY ProjectId, Key, Hour