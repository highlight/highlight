UPDATE dashboards
SET is_default = CASE
		WHEN name = 'Home' THEN true
		WHEN name = 'Web Vitals' THEN true
		WHEN name = 'Frontend Observability' THEN true
		ELSE false
	END
WHERE is_default IS NULL;
