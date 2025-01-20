CREATE MATERIALIZED VIEW IF NOT EXISTS trace_count_daily_mv ENGINE = SummingMergeTree
ORDER BY (ProjectId, Day) POPULATE AS
SELECT ProjectId,
    toStartOfDay(Timestamp) AS Day,
    count() as Count
FROM traces
WHERE TraceAttributes ['highlight.type'] not in ('http.request', 'highlight.internal')
GROUP BY ProjectId,
    Day;
