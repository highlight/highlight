CREATE TABLE phonehome (
    Timestamp DateTime64(9),
    UUID UUID,
    SpanName LowCardinality(String),
    ServiceName LowCardinality(String),
    ServiceVersion String,
    TraceAttributes Map(LowCardinality(String), String)
)
ENGINE = ReplacingMergeTree
ORDER BY (SpanName, Timestamp, UUID);

CREATE MATERIALIZED VIEW phonehome_mv TO phonehome AS
select Timestamp, UUID, SpanName, ServiceName, ServiceVersion, TraceAttributes
from traces
where ProjectId = 1
  and TraceAttributes['highlight.type'] = 'highlight.phonehome'
  and TraceAttributes['highlight-doppler-config'] like 'docker%';

CREATE MATERIALIZED VIEW phonehome_logs_mv TO phonehome AS
select Timestamp, UUID, ServiceName, ServiceVersion, Body as SpanName, LogAttributes as TraceAttributes
from logs
where ProjectId = 1
  and Body in ('highlight-about-you', 'highlight-heartbeat', 'highlight-admin-usage', 'highlight-workspace-usage')
  and LogAttributes['highlight-doppler-config'] = 'docker';
