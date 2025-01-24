create table trace_metrics
(
    ProjectId Int32,
    Key       LowCardinality(String),
    Day       DateTime,
    Count     UInt64,
    Type      LowCardinality(String)
) engine = SummingMergeTree ORDER BY (ProjectId, Key, Day)
      TTL Day + toIntervalDay(31);


CREATE MATERIALIZED VIEW default.trace_metrics_mv TO trace_metrics
AS
SELECT ProjectId,
       (Events.Attributes[1])['metric.name'] AS Key,
       toStartOfDay(Timestamp)               AS Day,
       'Numeric'                             AS Type,
       count()                               AS Count
FROM traces
WHERE (SpanName = 'highlight-metric')
  AND (((Events.Attributes[1])['metric.name']) IS NOT NULL)
  AND (((Events.Attributes[1])['metric.value']) IS NOT NULL)
GROUP BY ProjectId,
         Key,
         Day;
