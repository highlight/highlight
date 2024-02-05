CREATE TABLE phonehome (
    Timestamp DateTime64(9),
    UUID UUID,
    SpanName LowCardinality(String),
    ServiceName LowCardinality(String),
    ServiceVersion String,
    TraceAttributes Map(LowCardinality(String), String)
)
ENGINE = MergeTree
ORDER BY (SpanName, Timestamp, UUID);

CREATE MATERIALIZED VIEW phonehome_mv TO phonehome AS
select *
from traces
where ProjectId = 1
  and Timestamp > now() - interval 1 hour
  and TraceAttributes['highlight.type'] = 'highlight.phonehome'
  and TraceAttributes['highlight-doppler-config'] like 'docker%';
