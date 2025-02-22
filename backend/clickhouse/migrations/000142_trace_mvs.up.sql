CREATE MATERIALIZED VIEW IF NOT EXISTS trace_http_attributes_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    arrayJoin(HttpAttributes).1 AS Key,
    toStartOfDay(Timestamp) AS Day,
    arrayJoin(HttpAttributes).2 AS Value,
    count() AS Count
FROM traces
WHERE Value != ''
GROUP BY ProjectId,
    Key,
    Day,
    Value;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_process_attributes_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    arrayJoin(ProcessAttributes).1 AS Key,
    toStartOfDay(Timestamp) AS Day,
    arrayJoin(ProcessAttributes).2 AS Value,
    count() AS Count
FROM traces
WHERE Value != ''
GROUP BY ProjectId,
    Key,
    Day,
    Value;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_os_attributes_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    arrayJoin(OsAttributes).1 AS Key,
    toStartOfDay(Timestamp) AS Day,
    arrayJoin(OsAttributes).2 AS Value,
    count() AS Count
FROM traces
WHERE Value != ''
GROUP BY ProjectId,
    Key,
    Day,
    Value;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_telemetry_attributes_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    arrayJoin(TelemetryAttributes).1 AS Key,
    toStartOfDay(Timestamp) AS Day,
    arrayJoin(TelemetryAttributes).2 AS Value,
    count() AS Count
FROM traces
WHERE Value != ''
GROUP BY ProjectId,
    Key,
    Day,
    Value;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_ws_attributes_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    arrayJoin(WsAttributes).1 AS Key,
    toStartOfDay(Timestamp) AS Day,
    arrayJoin(WsAttributes).2 AS Value,
    count() AS Count
FROM traces
WHERE Value != ''
GROUP BY ProjectId,
    Key,
    Day,
    Value;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_event_attributes_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    arrayJoin(EventAttributes).1 AS Key,
    toStartOfDay(Timestamp) AS Day,
    arrayJoin(EventAttributes).2 AS Value,
    count() AS Count
FROM traces
WHERE Value != ''
GROUP BY ProjectId,
    Key,
    Day,
    Value;
CREATE MATERIALIZED VIEW IF NOT EXISTS trace_db_attributes_mv TO trace_key_values (
    `ProjectId` Int32,
    `Key` LowCardinality(String),
    `Day` DateTime,
    `Value` String,
    `Count` UInt64
) AS
SELECT ProjectId,
    arrayJoin(DbAttributes).1 AS Key,
    toStartOfDay(Timestamp) AS Day,
    arrayJoin(DbAttributes).2 AS Value,
    count() AS Count
FROM traces
WHERE Value != ''
GROUP BY ProjectId,
    Key,
    Day,
    Value;