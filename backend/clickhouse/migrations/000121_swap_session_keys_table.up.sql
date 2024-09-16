INSERT INTO session_keys_new
SELECT ProjectID as ProjectId,
    Name as Key,
    toStartOfDay(SessionCreatedAt) AS Day,
    if(
        isNull(toFloat64OrNull(Value)),
        'String',
        'Numeric'
    ) AS Type,
    count() AS Count
FROM fields
WHERE Day < '2024-09-17'
GROUP BY ProjectId,
    Key,
    Day,
    Type;

DROP TABLE session_keys;
DROP VIEW session_keys_mv;

RENAME TABLE session_keys_new TO session_keys;
RENAME TABLE session_keys_new_mv TO session_keys_mv;