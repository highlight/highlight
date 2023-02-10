## Useful queries

### Inject structured log data

```sql
INSERT INTO logs (Timestamp, ProjectId, Body, LogAttributes) VALUES (now(), 1, 'body', {'user_id':'3'});
INSERT INTO logs (Timestamp, ProjectId, Body, LogAttributes) VALUES (now(), 2, 'body', {'user_id':'1'});
INSERT INTO logs (Timestamp, ProjectId, Body, SeverityText, LogAttributes) VALUES (now(), 1, 'body', 'ERROR', {'user_id':'1'});


INSERT INTO logs (Timestamp, ProjectId, Body, LogAttributes) VALUES (now(), 1, 'body', {'workspace_id':'3'});
INSERT INTO logs (Timestamp, ProjectId, Body, LogAttributes) VALUES (now(), 2, 'body', {'workspace_id':'1'});

```

### Get all log keys for a project

```sql
SELECT arrayJoin(LogAttributes.keys) as keys, count() as cnt FROM logs WHERE ProjectId = 1 GROUP BY keys ORDER BY cnt DESC;
```