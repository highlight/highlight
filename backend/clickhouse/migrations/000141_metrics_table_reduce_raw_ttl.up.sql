ALTER TABLE default.metrics_sum MODIFY TTL toDateTime(Timestamp) + INTERVAL 1 DAY;
ALTER TABLE default.metrics_histogram MODIFY TTL toDateTime(Timestamp) + INTERVAL 1 DAY;
ALTER TABLE default.metrics_summary MODIFY TTL toDateTime(Timestamp) + INTERVAL 1 DAY;
