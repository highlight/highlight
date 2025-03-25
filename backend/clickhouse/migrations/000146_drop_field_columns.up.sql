DROP VIEW IF EXISTS sessions_joined_vw;
CREATE VIEW IF NOT EXISTS sessions_joined_vw AS
select ProjectID as ProjectId,
        CreatedAt as Timestamp,
        *
from sessions FINAL SETTINGS splitby_max_substrings_includes_remaining_string = 1;
CREATE TABLE IF NOT EXISTS fields_by_session (
        ProjectID Int32,
        SessionID Int64,
        Type LowCardinality(String),
        Name LowCardinality(String),
        Value String
) ENGINE = ReplacingMergeTree
ORDER BY (
                ProjectID,
                SessionID,
                Type,
                Name,
                Value
        );
CREATE MATERIALIZED VIEW IF NOT EXISTS fields_by_session_mv TO fields_by_session (
        ProjectID Int32,
        SessionID Int64,
        Type LowCardinality(String),
        Name LowCardinality(String),
        Value String
) AS
SELECT ProjectID,
        SessionID,
        Type,
        Name,
        Value
FROM fields