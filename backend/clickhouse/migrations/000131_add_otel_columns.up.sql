ALTER TABLE traces
ADD COLUMN IF NOT EXISTS HttpResponseBody String DEFAULT TraceAttributes ['http.response.body'],
    ADD COLUMN IF NOT EXISTS HttpRequestBody String DEFAULT TraceAttributes ['http.request.body'],
    ADD COLUMN IF NOT EXISTS HttpUrl String DEFAULT TraceAttributes ['http.url'],
    ADD COLUMN IF NOT EXISTS HighlightKey String DEFAULT TraceAttributes ['highlight.key'],
    MODIFY COLUMN IF EXISTS HighlightType DEFAULT TraceAttributes ['highlight.type'],
    ADD COLUMN IF NOT EXISTS HttpAttributes Map(LowCardinality(String), String) DEFAULT mapFilter(
        (k, v)->startsWith(k, 'http.')
        and k not in (
            'http.response.body',
            'http.request.body',
            'http.url'
        ),
        TraceAttributes
    ),
    ADD COLUMN IF NOT EXISTS ProcessAttributes Map(LowCardinality(String), String) DEFAULT mapFilter(
        (k, v)->startsWith(k, 'process.'),
        TraceAttributes
    ),
    ADD COLUMN IF NOT EXISTS OsAttributes Map(LowCardinality(String), String) DEFAULT mapFilter((k, v)->startsWith(k, 'os.'), TraceAttributes),
    ADD COLUMN IF NOT EXISTS TelemetryAttributes Map(LowCardinality(String), String) DEFAULT mapFilter(
        (k, v)->startsWith(k, 'telemetry.'),
        TraceAttributes
    ),
    ADD COLUMN IF NOT EXISTS WsAttributes Map(LowCardinality(String), String) DEFAULT mapFilter((k, v)->startsWith(k, 'ws.'), TraceAttributes),
    ADD COLUMN IF NOT EXISTS EventAttributes Map(LowCardinality(String), String) DEFAULT mapFilter(
        (k, v)->startsWith(k, 'event.'),
        TraceAttributes
    ),
    ADD COLUMN IF NOT EXISTS DbAttributes Map(LowCardinality(String), String) DEFAULT mapFilter((k, v)->startsWith(k, 'db.'), TraceAttributes);
ALTER TABLE traces_sampling_new
ADD COLUMN IF NOT EXISTS HttpResponseBody String,
    ADD COLUMN IF NOT EXISTS HttpRequestBody String,
    ADD COLUMN IF NOT EXISTS HttpUrl String,
    ADD COLUMN IF NOT EXISTS HighlightKey String,
    MODIFY COLUMN IF EXISTS HighlightType REMOVE MATERIALIZED,
    ADD COLUMN IF NOT EXISTS HttpAttributes Map(LowCardinality(String), String),
    ADD COLUMN IF NOT EXISTS ProcessAttributes Map(LowCardinality(String), String),
    ADD COLUMN IF NOT EXISTS OsAttributes Map(LowCardinality(String), String),
    ADD COLUMN IF NOT EXISTS TelemetryAttributes Map(LowCardinality(String), String),
    ADD COLUMN IF NOT EXISTS WsAttributes Map(LowCardinality(String), String),
    ADD COLUMN IF NOT EXISTS EventAttributes Map(LowCardinality(String), String),
    ADD COLUMN IF NOT EXISTS DbAttributes Map(LowCardinality(String), String);
ALTER TABLE traces_sampling_new_mv
MODIFY QUERY
SELECT *
FROM traces;