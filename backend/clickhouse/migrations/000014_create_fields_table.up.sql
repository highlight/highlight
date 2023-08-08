CREATE TABLE IF NOT EXISTS fields (
    ProjectID Int32,
    Type LowCardinality(String),
    Name LowCardinality(String),
    SessionID Int64,
    Value String
) ENGINE = ReplacingMergeTree
ORDER BY (ProjectID, Type, Name, SessionID, Value);