
ALTER TABLE metrics_sum MODIFY TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays);
ALTER TABLE metrics_histogram MODIFY TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays);
ALTER TABLE metrics_summary MODIFY TTL toDateTime(Timestamp) + toIntervalDay(RetentionDays);
