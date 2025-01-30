
ALTER TABLE default.metrics_sum MODIFY TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays);
ALTER TABLE default.metrics_histogram MODIFY TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays);
ALTER TABLE default.metrics_summary MODIFY TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays);
