-- DELETE duplicate data in daily_error_counts
-- where there are multiple rows for a single (project_id, date) pair.
-- This query orders by count (desc) and id within (project_id, date) groups
-- and deletes all but the first row in the group to keep the row with max count
CREATE TABLE daily_error_counts_backup
AS
SELECT *
FROM daily_error_counts;

DELETE
FROM daily_error_counts
WHERE id in (
	SELECT c.id
	FROM (
		SELECT a.*,
			RANK () OVER ( 
				PARTITION BY a.project_id, a.date
				ORDER BY a.count desc, a.id
			) rank_number
		FROM daily_error_counts a
		INNER JOIN (
			SELECT project_id, date, MAX(count), COUNT(*)
			  FROM daily_error_counts
			GROUP BY project_id, date
			HAVING COUNT(*) > 1
			) b
		ON a.project_id = b.project_id
		AND a.date = b.date) c
	WHERE c.rank_number <> 1
);
