CREATE MATERIALIZED VIEW IF NOT EXISTS log_count_daily_mv
ENGINE = SummingMergeTree
PARTITION BY toDate(Day) ORDER BY (ProjectId, Day)
POPULATE
AS 
SELECT
    ProjectId,
    toStartOfDay(Timestamp) AS Day,
    count() as Count
FROM logs
GROUP BY ProjectId, Day;
