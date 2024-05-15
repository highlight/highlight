DROP VIEW IF EXISTS errors_joined_vw;
CREATE VIEW IF NOT EXISTS errors_joined_vw AS
SELECT ProjectID as ProjectId,
    *
FROM error_objects eo FINAL
    INNER JOIN (
        SELECT *
        FROM error_groups FINAL
    ) eg ON eg.ID = eo.ErrorGroupID
    AND eg.ProjectID = eo.ProjectID;