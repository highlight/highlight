ALTER TABLE traces
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