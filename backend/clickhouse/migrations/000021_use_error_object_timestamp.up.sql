CREATE TABLE IF NOT EXISTS error_objects (
    ProjectID Int32,
    Timestamp DateTime64(6),
    ID Int64,
    ErrorGroupID Int64,
    Browser String,
    Environment String,
    OSName String,
    VisitedURL String,
    ServiceName String,
    ServiceVersion String,
    ClientID String
) ENGINE = ReplacingMergeTree
ORDER BY (
        ProjectID,
        Timestamp,
        ID
    );