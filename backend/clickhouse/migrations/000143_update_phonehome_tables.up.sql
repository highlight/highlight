DROP TABLE IF EXISTS phonehome_mv;

CREATE MATERIALIZED VIEW phonehome_mv TO phonehome AS
select Timestamp, UUID, SpanName, ServiceName, ServiceVersion, TraceAttributes
from traces
where ProjectId = 1
  and HighlightType = 'highlight.phonehome'
  and TraceAttributes['highlight-doppler-config'] like 'docker%';
