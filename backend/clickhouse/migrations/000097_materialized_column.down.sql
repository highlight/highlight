ALTER TABLE traces RESET SETTING min_rows_for_wide_part,
    min_bytes_for_wide_part;
ALTER TABLE traces_by_id RESET SETTING min_rows_for_wide_part,
    min_bytes_for_wide_part;
ALTER TABLE traces_sampling RESET SETTING min_rows_for_wide_part,
    min_bytes_for_wide_part;
ALTER TABLE traces DROP COLUMN IF EXISTS HighlightType;