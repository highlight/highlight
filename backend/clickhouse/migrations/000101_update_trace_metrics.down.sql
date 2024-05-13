ALTER TABLE trace_keys DROP COLUMN Type;

DROP VIEW IF EXISTS trace_metrics_mv;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_metrics_mv
            TO trace_metrics (
                              `ProjectId` Int32,
                              `Key` LowCardinality(String),
                              `Day` DateTime,
                              `Count` UInt64
        )
AS
SELECT ProjectId,
       Events.Attributes[1]['metric.name'] AS Key,
       toStartOfDay(Timestamp)             AS Day,
       count()                             AS Count
FROM traces
WHERE SpanName = 'highlight-metric'
  AND Events.Attributes[1]['metric.name'] is not null
  AND Events.Attributes[1]['metric.value'] is not null
GROUP BY ProjectId,
         Key,
         Day;
