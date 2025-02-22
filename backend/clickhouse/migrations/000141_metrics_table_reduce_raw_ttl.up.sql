ALTER TABLE metrics_sum MODIFY TTL toDateTime(Timestamp) + INTERVAL 1 HOUR;
ALTER TABLE metrics_histogram MODIFY TTL toDateTime(Timestamp) + INTERVAL 1 HOUR;
ALTER TABLE metrics_summary MODIFY TTL toDateTime(Timestamp) + INTERVAL 1 HOUR;
