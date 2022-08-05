INSERT INTO error_fields (
        created_at,
        updated_at,
        organization_id,
        project_id,
        name,
        value
    )
SELECT DISTINCT now(),
    now(),
    eo.organization_id,
    eo.project_id,
    'environment',
    eo.environment
FROM error_objects eo
WHERE NOT EXISTS (
        SELECT *
        FROM error_fields ef
        WHERE ef.project_id = eo.project_id
            AND ef.organization_id = eo.organization_id
            AND ef.name = 'environment'
            AND ef.value = eo.environment
    )