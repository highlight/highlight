GRANT SELECT ON metrics TO highlight_readonly_role;
CREATE ROW POLICY IF NOT EXISTS metrics_readonly ON metrics USING ProjectId = getSetting('SQL_highlight_project_id') TO highlight_readonly_role;