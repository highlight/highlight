CREATE TABLE IF NOT EXISTS error_objects (
    ProjectID Int32,
    CreatedAt DateTime64(6),
    ErrorGroupID Int64,
    ID Int64,
    Browser String,
    Environment String,
    OSName String,
    ServiceName String,
    ServiceVersion String,
    ClientID String
) ENGINE = ReplacingMergeTree
ORDER BY (
        ProjectID,
        CreatedAt,
        ErrorGroupID,
        ID
    );