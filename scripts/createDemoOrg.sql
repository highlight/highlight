INSERT INTO organizations (id, name) VALUES (0, 'demo');

INSERT INTO error_alerts (organization_id, excluded_environments, count_threshold) VALUES (0, '["development"]', 1);
INSERT INTO session_alerts (organization_id, excluded_environments, count_threshold, type) VALUES (0, '["development"]', 1, 'NEW_USER_ALERT');
INSERT INTO session_alerts (organization_id, excluded_environments, count_threshold, type) VALUES (0, '["development"]', 1, 'USER_PROPERTIES_ALERT');
INSERT INTO session_alerts (organization_id, excluded_environments, count_threshold, type) VALUES (0, '["development"]', 1, 'TRACK_PROPERTIES_ALERT');

INSERT INTO organization_admins (admin_id, organization_id) VALUES (68, 0);
INSERT INTO organization_admins (admin_id, organization_id) VALUES (172, 0);
INSERT INTO organization_admins (admin_id, organization_id) VALUES (267, 0);
INSERT INTO organization_admins (admin_id, organization_id) VALUES (98, 0);
INSERT INTO organization_admins (admin_id, organization_id) VALUES (407, 0);
INSERT INTO organization_admins (admin_id, organization_id) VALUES (408, 0);

/* INSERT the following */
SELECT * FROM events_objects WHERE session_id IN (1562888, 1562788, 1562901, 1562920, 1562930, 1562943); /* insert into s3 */
SELECT * FROM sessions WHERE id IN (1562888, 1562788, 1562901, 1562920, 1562930, 1562943);
SELECT * FROM error_groups WHERE id IN (1895, 1896, 1897, 1898, 1900);
SELECT * FROM error_objects WHERE id IN (49744, 49761, 49746, 49769, 49738, 49768, 49742, 49767, 49732, 49765);

SELECT * FROM fields WHERE id IN (SELECT field_id FROM session_fields WHERE session_id IN (1562888, 1562788, 1562901, 1562920, 1562930, 1562943));
SELECT * FROM session_fields WHERE session_id IN (1562888, 1562788, 1562901, 1562920, 1562930, 1562943);
