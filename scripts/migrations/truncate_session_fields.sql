CREATE TABLE long_fields
AS (SELECT *
    FROM fields
    WHERE length(value) > 2000);

update fields
set value = left(value, 2000)
where length(value) > 2000;

CREATE INDEX idx_fields_project_type_name_value ON fields USING btree (project_id, type, name, value);
