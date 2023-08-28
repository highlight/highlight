CREATE TABLE IF NOT EXISTS error_groups (
    ProjectID Int32,
    Browser String,
    Environment String,
    OSName String,
    CreatedAt DateTime64(6),
    ErrorGroupID Int64
) ENGINE = ReplacingMergeTree
ORDER BY (
        ProjectID,
        Type,
        Name,
        CreatedAt,
        ErrorGroupID
    );