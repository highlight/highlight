CREATE TABLE IF NOT EXISTS logs_new AS logs ENGINE = ReplacingMergeTree PARTITION BY toDate(Timestamp)
ORDER BY (ProjectId, Timestamp, UUID) TTL Timestamp + toIntervalDay(30) SETTINGS ttl_only_drop_parts = 1,
    index_granularity = 8192,
    min_age_to_force_merge_seconds = 3600;
EXCHANGE TABLES logs
AND logs_new;