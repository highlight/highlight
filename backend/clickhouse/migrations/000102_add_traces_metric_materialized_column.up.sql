ALTER TABLE traces ADD COLUMN IF NOT EXISTS MetricName Nullable(String) MATERIALIZED Events.Attributes[1]['metric.name'];
ALTER TABLE traces ADD COLUMN IF NOT EXISTS MetricValue Nullable(Float64) MATERIALIZED toFloat64OrNull(Events.Attributes[1]['metric.value']);

ALTER TABLE traces_sampling ADD COLUMN IF NOT EXISTS MetricName Nullable(String) MATERIALIZED Events.Attributes[1]['metric.name'];
ALTER TABLE traces_sampling ADD COLUMN IF NOT EXISTS MetricValue Nullable(Float64) MATERIALIZED toFloat64OrNull(Events.Attributes[1]['metric.value']);
