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
-- @block
SELECT addDays(makeDate(0, 0), time),
    count
from (
        SELECT toRelativeDayNum(Timestamp, 'America/New_York') as time,
            count() as count
        FROM error_objects FINAL
        WHERE ID IN (
                SELECT ID
                FROM error_objects
                WHERE ProjectID = 1
                    AND Timestamp BETWEEN '2023-08-14 14:59:17.253' AND '2023-09-13 14:59:17.253'
                    AND (
                        Timestamp BETWEEN '2023-08-14 14:59:17.253' AND '2023-09-13 14:59:17.253'
                    )
            )
            AND ("Event" ILIKE 'context canceled')
            AND ("Type" ILIKE 'Backend')
    )
    AND ErrorGroupID in (
        SELECT ID
        from error_groups
        WHERE ProjectID = 1
            AND UpdatedAt > '2023-03-13 11:06:21.588462'
    )
    AND ("Status" ILIKE 'OPEN')
)
GROUP BY 1
ORDER BY 1 WITH FILL
FROM toRelativeDayNum('2023-08-14 10:59:00', 'America/New_York') TO toRelativeDayNum('2023-09-13 10:59:00', 'America/New_York') STEP 1
)