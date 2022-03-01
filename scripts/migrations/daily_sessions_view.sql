CREATE MATERIALIZED VIEW daily_session_counts_view
AS
SELECT project_id, DATE_TRUNC('day', created_at, 'UTC') as date, COUNT(*) as count
FROM sessions
WHERE excluded <> true
AND (active_length >= 1000 OR (active_length is null and length >= 1000))
AND processed = true
GROUP BY 1, 2;

CREATE UNIQUE INDEX idx_daily_session_counts_view_project_id_date ON daily_session_counts_view (project_id, date);
