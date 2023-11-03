INSERT INTO workspaces (id, created_at, updated_at, deleted_at, name, secret, slack_access_token, slack_webhook_url,
                        slack_webhook_channel, slack_webhook_channel_id, slack_channels, linear_access_token,
                        migrated_from_project_id, hubspot_company_id, stripe_customer_id, plan_tier,
                        unlimited_members, billing_period_start, billing_period_end, next_invoice_date,
                        monthly_session_limit, monthly_members_limit, trial_end_date, allow_meter_overage,
                        allowed_auto_join_email_origins, eligible_for_trial_extension, trial_extension_enabled,
                        clearbit_enabled)
VALUES (1, '2022-09-13 01:22:33.433339 +00:00', '2022-09-13 01:22:33.934553 +00:00', null, 'w1', 'asdf',
        null, null, null, null, null, null, null, null, 'cus_a1b2c3d4', 'Free', false, null, null, null,
        null, null, '2022-09-27 01:22:33.433245 +00:00', false, null, true, false, false);

INSERT INTO projects (id, created_at, updated_at, deleted_at, name,
                      zapier_access_token, billing_email, secret, trial_end_date, monthly_session_limit, workspace_id,
                      free_tier, excluded_users, error_json_paths, backend_setup,
                      rage_click_window_seconds, rage_click_radius_pixels, rage_click_count)
VALUES (1, '2022-09-13 01:22:35.758964 +00:00', '2022-09-14 05:00:53.763444 +00:00', null, 'p1', null,
        'swag@highlight.run', 'ccftmmv6i1e1m780kh20', null, null, 1, false, null, null,
        true, 5, 8, 5);

INSERT INTO admins (id, created_at, updated_at, deleted_at, name, first_name, last_name, hubspot_contact_id, email,
                    about_you_details_filled, phone, number_of_sessions_viewed, email_verified, photo_url, uid,
                    slack_im_channel_id, referral, user_defined_role, user_defined_persona)
VALUES (1, '2023-02-04 06:44:32.027338 +00:00', '2023-02-04 07:35:15.066344 +00:00', null, 'Hobby Highlighter', 'Hobby',
        'Highlighter', null, 'demo@example.com', true, '+14081234567', null, true,
        'https://avatars.githubusercontent.com/u/1351531?s=40&v=4', 'Hobby Highlighter', null, '', 'eng',
        'ENGINEERING');

INSERT INTO workspace_admins (admin_id, workspace_id, created_at, updated_at, deleted_at, role)
VALUES (1, 1, NOW(), NOW(), null, 'ADMIN');

INSERT INTO all_workspace_settings (id, created_at, updated_at, deleted_at, workspace_id, ai_application, ai_insights,
                                    error_embeddings_write, error_embeddings_group, error_embeddings_threshold,
                                    replace_assets, store_ip, enable_session_export, enable_network_traces)
VALUES (1, '2023-09-26 01:01:33.718911 +00:00', '2023-09-26 01:01:33.718911 +00:00', null, 1,
        true, false, false, false, 0.2, true, true, true, true);

-- Set up oauth for testing
INSERT INTO o_auth_client_stores (id, created_at, secret, domains, app_name, admin_id)
VALUES ('abc123', now(), 'def456', '{example.com}', 'Test', 1);
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'sessions_clickhouse');
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'sessions');
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'session');
