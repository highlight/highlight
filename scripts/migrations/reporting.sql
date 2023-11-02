CREATE SCHEMA IF NOT EXISTS reporting;

CREATE OR REPLACE VIEW reporting.weekly_errors_and_sessions_usage AS
  WITH dates AS (SELECT (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '14 days')::DATE AS two_weeks_ago_start,
                      (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '8 days')::DATE  AS two_weeks_ago_end,
                      (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days')::DATE  AS last_week_start,
                      (DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 day')::DATE   AS last_week_end),
     sources AS (SELECT 'errors' AS product,
                        project_id,
                        count,
                        date
                 FROM daily_error_counts_view
                 UNION ALL
                 SELECT 'sessions' AS product,
                        project_id,
                        count,
                        date
                 FROM daily_session_counts_view)
SELECT project_id,
       CASE
           WHEN date BETWEEN two_weeks_ago_start AND two_weeks_ago_end THEN two_weeks_ago_start
           WHEN date BETWEEN last_week_start AND last_week_end THEN last_week_start
       END          AS usage_date_start,
       CASE
           WHEN date BETWEEN two_weeks_ago_start AND two_weeks_ago_end THEN two_weeks_ago_end
           WHEN date BETWEEN last_week_start AND last_week_end THEN last_week_end
       END          AS usage_date_end,
       CURRENT_DATE AS date_retrieved,
       product,
       SUM(count)   AS count
FROM dates
         CROSS JOIN sources
WHERE date BETWEEN two_weeks_ago_start AND last_week_end
GROUP BY project_id, usage_date_start, usage_date_end, date_retrieved, product;
