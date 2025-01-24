CREATE TABLE IF NOT EXISTS metric_key_values
(
    `ProjectId` Int32,
    `Key`       LowCardinality(String),
    `Day`       DateTime,
    `Value`     String,
    `Count`     UInt64
) ENGINE = SummingMergeTree
      ORDER BY (ProjectId, Key, Day, Value) TTL Day + toIntervalDay(31);

CREATE MATERIALIZED VIEW IF NOT EXISTS metric_attributes_mv
    TO metric_key_values
AS
SELECT ProjectId,
       Attributes.1            AS Key,
       toStartOfDay(Timestamp) AS Day,
       Attributes.2            AS Value,
       count()                 AS Count
FROM metrics
         ARRAY JOIN Attributes
WHERE Key NOT IN (
                  'metric_name',
                  'service_name',
                  'secure_session_id',
                  'trace_id',
                  'span_id'
    )
  AND Value != ''
GROUP BY ALL;

CREATE MATERIALIZED VIEW IF NOT EXISTS metric_metric_name_mv
    TO metric_key_values
AS
SELECT ProjectId,
       'metric_name'           AS Key,
       toStartOfDay(Timestamp) AS Day,
       MetricName              AS Value,
       count()                 AS Count
FROM metrics
WHERE (MetricName != '')
GROUP BY ALL;

CREATE MATERIALIZED VIEW IF NOT EXISTS metric_service_name_mv
    TO metric_key_values
AS
SELECT ProjectId,
       'service_name'          AS Key,
       toStartOfDay(Timestamp) AS Day,
       ServiceName             AS Value,
       count()                 AS Count
FROM metrics
WHERE (ServiceName != '')
GROUP BY ALL;

CREATE MATERIALIZED VIEW IF NOT EXISTS metric_secure_session_id_mv
    TO metric_key_values
AS
SELECT ProjectId,
       'secure_session_id'       AS Key,
       toStartOfDay(Timestamp)   AS Day,
       Exemplars.SecureSessionID AS Value,
       count()                   AS Count
FROM metrics
         ARRAY JOIN `Exemplars.SecureSessionID`
WHERE (`Exemplars.SecureSessionID` != '')
GROUP BY ALL;

CREATE MATERIALIZED VIEW IF NOT EXISTS metric_trace_id_mv
    TO metric_key_values
AS
SELECT ProjectId,
       'trace_id'              AS Key,
       toStartOfDay(Timestamp) AS Day,
       `Exemplars.TraceID`     AS Value,
       count()                 AS Count
FROM metrics
         ARRAY JOIN `Exemplars.TraceID`
WHERE (`Exemplars.TraceID` != '')
GROUP BY ALL;

CREATE MATERIALIZED VIEW IF NOT EXISTS metric_span_id_mv
    TO metric_key_values
AS
SELECT ProjectId,
       'span_id'               AS Key,
       toStartOfDay(Timestamp) AS Day,
       `Exemplars.SpanID`      AS Value,
       count()                 AS Count
FROM metrics
         ARRAY JOIN `Exemplars.SpanID`
WHERE (`Exemplars.SpanID` != '')
GROUP BY ALL;

CREATE TABLE IF NOT EXISTS metric_keys
(
    `ProjectId` Int32,
    `Key`       LowCardinality(String),
    `Day`       DateTime,
    `Type`      LowCardinality(String),
    `Count`     UInt64
) ENGINE = SummingMergeTree
      ORDER BY (ProjectId, Key, Day, Type) TTL Day + toIntervalDay(31);

CREATE MATERIALIZED VIEW IF NOT EXISTS metric_keys_mv
    TO metric_keys
AS
SELECT ProjectId,
       Key,
       Day,
       if(
               isNull(toFloat64OrNull(Value)),
               'String',
               'Numeric'
       )          AS Type,
       sum(Count) AS Count
FROM metric_key_values
GROUP BY ALL;
