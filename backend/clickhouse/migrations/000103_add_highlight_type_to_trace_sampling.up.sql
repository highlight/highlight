ALTER TABLE traces
MODIFY SETTING min_rows_for_wide_part = 0,
    min_bytes_for_wide_part = 0;
ALTER TABLE traces_by_id
MODIFY SETTING min_rows_for_wide_part = 0,
    min_bytes_for_wide_part = 0;
ALTER TABLE traces_sampling
MODIFY SETTING min_rows_for_wide_part = 0,
    min_bytes_for_wide_part = 0;
ALTER TABLE traces_sampling
ADD COLUMN IF NOT EXISTS HighlightType String MATERIALIZED TraceAttributes ['highlight.type'];
