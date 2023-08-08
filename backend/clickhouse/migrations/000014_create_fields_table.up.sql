CREATE TABLE IF NOT EXISTS fields (
    ProjectID Int32,
    Type LowCardinality(String),
    Name LowCardinality(String),
    Value String,
    SessionID Int64
) ENGINE = MergeTree
ORDER BY (ProjectID, Type, Name, SessionID);
-- @block
select *
from fields
order by SessionID desc
limit 10;
-- @block
select *
from sessions
order by CreatedAt desc
limit 2;