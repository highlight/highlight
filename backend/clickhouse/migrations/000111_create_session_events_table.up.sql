CREATE TABLE IF NOT EXISTS session_events (
    UUID UUID,
    ProjectID Int32,
    SessionID Int64,
    SessionCreatedAt DateTime64(6),
    Timestamp DateTime64(6),
    Event String,
    Attributes Map(LowCardinality(String), String)    
) ENGINE = MergeTree
ORDER BY (ProjectID, SessionCreatedAt, SessionID)