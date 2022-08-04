INSERT INTO error_fields (created_at, updated_at, project_id, name, value)
SELECT DISTINCT now(), now(), eo.project_id, 'environment', s.environment
FROM error_objects eo
INNER JOIN sessions s
ON eo.session_id = s.id
WHERE NOT EXISTS (
    SELECT *
    FROM error_fields ef
    WHERE ef.project_id = eo.project_id
    AND ef.name = 'environment'
    AND ef.value = s.environment
)
