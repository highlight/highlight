WITH eg_id_to_env as (
    SELECT id AS error_group_id,
        jsonb_object_keys(environments::jsonb) AS env
    FROM error_groups
    WHERE environments IS NOT NULL
),
env_fields AS (
    SELECT id AS error_field_id,
        value AS env
    FROM error_fields
    WHERE name = 'environment'
),
ef_to_eg AS (
    SELECT DISTINCT error_field_id,
        error_group_id
    FROM env_fields
        JOIN eg_id_to_env ON env_fields.env = eg_id_to_env.env
)
INSERT INTO error_group_fields (error_field_id, error_group_id)
SELECT error_field_id,
    error_group_id
FROM ef_to_eg
WHERE NOT EXISTS (
        SELECT *
        FROM error_group_fields egf
        WHERE egf.error_field_id = ef_to_eg.error_field_id
            AND egf.error_group_id = ef_to_eg.error_group_id
    )