INSERT INTO workspaces (id, created_at, updated_at, deleted_at, name, secret, slack_access_token, slack_webhook_url,
                        slack_webhook_channel, slack_webhook_channel_id, slack_channels, linear_access_token,
                        migrated_from_project_id, hubspot_company_id, stripe_customer_id, plan_tier,
                        unlimited_members, billing_period_start, billing_period_end, next_invoice_date,
                        monthly_session_limit, monthly_members_limit, trial_end_date, allow_meter_overage,
                        allowed_auto_join_email_origins, eligible_for_trial_extension, trial_extension_enabled,
                        clearbit_enabled)
VALUES (1, now(), now(), null, 'w1', 'asdf',
        null, null, null, null, null, null, null, null, 'cus_a1b2c3d4', 'Free', false, null, null, null,
        null, null, now() + interval '1 month', false, null, true, false, false);

INSERT INTO projects (id, created_at, updated_at, deleted_at, name,
                      zapier_access_token, billing_email, secret, trial_end_date, monthly_session_limit, workspace_id,
                      free_tier, excluded_users, error_json_paths, backend_setup,
                      rage_click_window_seconds, rage_click_radius_pixels, rage_click_count)
VALUES (1, now(), now(), null, 'p1', null,
        'swag@highlight.run', 'ccftmmv6i1e1m780kh20', null, null, 1, false, null, null,
        true, 5, 8, 5);

INSERT INTO admins (id, created_at, updated_at, deleted_at, name, first_name, last_name, hubspot_contact_id, email,
                    about_you_details_filled, phone, number_of_sessions_viewed, email_verified, photo_url, uid,
                    slack_im_channel_id, referral, user_defined_role, user_defined_persona)
VALUES (1, now(), now(), null, 'Hobby Highlighter', 'Hobby',
        'Highlighter', null, 'demo@example.com', true, '+14081234567', null, true,
        'https://avatars.githubusercontent.com/u/1351531?s=40&v=4', 'Hobby Highlighter', null, '', 'eng',
        'ENGINEERING');

INSERT INTO admins (id, created_at, updated_at, deleted_at, name, first_name, last_name, hubspot_contact_id, email,
                    about_you_details_filled, phone, number_of_sessions_viewed, number_of_error_groups_viewed,
                    number_of_logs_viewed, email_verified, photo_url, uid, slack_im_channel_id, referral,
                    user_defined_role, user_defined_team_size, user_defined_persona, heard_about,
                    phone_home_contact_allowed)
VALUES (2, '2023-12-08 20:59:28.019967 +00:00', '2023-12-08 20:59:28.019967 +00:00', null, 'Hobby Highlighter', 'Hobby',
        'Highlighter', null, 'demo@example.com', true, '+14081234567', null, null, null, true,
        'https://avatars.githubusercontent.com/u/1351531?s=40&v=4', 'Hobby Highlighter', null, '', 'eng', null,
        'ENGINEERING', null, null);
INSERT INTO admins (id, created_at, updated_at, deleted_at, name, first_name, last_name, hubspot_contact_id, email,
                    about_you_details_filled, phone, number_of_sessions_viewed, number_of_error_groups_viewed,
                    number_of_logs_viewed, email_verified, photo_url, uid, slack_im_channel_id, referral,
                    user_defined_role, user_defined_team_size, user_defined_persona, heard_about,
                    phone_home_contact_allowed)
VALUES (3, '2023-12-08 20:59:47.788060 +00:00', '2023-12-08 20:59:47.788060 +00:00', null, 'Hobby Highlighter', null,
        null, null, 'demo@example.com', true, '+14081234567', null, null, null, true, 'https://picsum.photos/200',
        '<nil>', null, null, null, null, null, null, null);
INSERT INTO admins (id, created_at, updated_at, deleted_at, name, first_name, last_name, hubspot_contact_id, email,
                    about_you_details_filled, phone, number_of_sessions_viewed, number_of_error_groups_viewed,
                    number_of_logs_viewed, email_verified, photo_url, uid, slack_im_channel_id, referral,
                    user_defined_role, user_defined_team_size, user_defined_persona, heard_about,
                    phone_home_contact_allowed)
VALUES (4, '2023-12-08 21:06:03.546024 +00:00', '2023-12-08 21:06:03.546024 +00:00', null, 'Hobby Highlighter', null,
        null, null, 'demo@example.com', true, '+14081234567', null, null, null, true, 'https://picsum.photos/200',
        '12345abcdef09876a1b2c3d4e5f', null, null, null, null, null, null, null);

INSERT INTO workspace_admins (admin_id, workspace_id, created_at, updated_at, deleted_at, role)
VALUES (1, 1, NOW(), NOW(), null, 'ADMIN');
INSERT INTO workspace_admins (admin_id, workspace_id, created_at, updated_at, deleted_at, role)
VALUES (2, 1, NOW(), NOW(), null, 'ADMIN');
INSERT INTO workspace_admins (admin_id, workspace_id, created_at, updated_at, deleted_at, role)
VALUES (3, 1, NOW(), NOW(), null, 'ADMIN');
INSERT INTO workspace_admins (admin_id, workspace_id, created_at, updated_at, deleted_at, role)
VALUES (4, 1, NOW(), NOW(), null, 'ADMIN');

INSERT INTO all_workspace_settings (id, created_at, updated_at, deleted_at, workspace_id, ai_application, ai_insights,
                                    error_embeddings_group, error_embeddings_threshold,
                                    replace_assets, store_ip, enable_session_export, enable_network_traces)
VALUES (1, now(), now(), null, 1,
        true, false, false, 0.2, true, true, true, true);

INSERT INTO sessions (created_at, updated_at, deleted_at, secure_id, client_id, identified, fingerprint, identifier,
                      project_id, email, ip, city, state, postal, country, latitude, longitude,
                      os_name, os_version, browser_name, browser_version, language, has_unloaded, processed,
                      has_rage_clicks, has_errors, has_out_of_order_events, resumed_after_processed_time, length,
                      active_length, environment, app_version, service_name, user_object, first_time,
                      payload_updated_at, last_user_interaction_time, beacon_time, viewed, starred, field_group,
                      enable_strict_privacy, privacy_setting, enable_recording_network_contents, client_version,
                      firstload_version, within_billing_quota, is_public, pages_visited,
                      object_storage_enabled, direct_download_enabled, all_objects_compressed, payload_size, verbose_id,
                      excluded, excluded_reason, lock, retry_count, chunked, process_with_redis,
                      normalness)
VALUES (now(), now(), null,
        'abc123', 'T0kuxw2zpGbtE96A1x0Qxg1ivs48', true, 1334974370, '6', 1,
        'vadim@highlight.run', '[::1]:64684', '', '', '', 'United States', 37.751, -97.822, 'Mac OS X', '10.15.7',
        'Chrome', '119.0.0.0', 'en-US,en;q=0.9,ru;q=0.8,ko;q=0.7', true, true, false, true, false,
        '2023-11-23 00:09:20.020096 +00:00', 1654849, 986625, 'boba-localhost', 'asdf', 'frontend', 'null',
        false, '2023-11-23 00:34:12.909101 +00:00', '2023-11-23 00:34:12.766000 +00:00',
        '2023-11-23 00:34:12.909101 +00:00', false, null, null, false, 'none', true, '8.2.3', '8.2.3',
        true, false,
        5, true, true, true, 1716704, '1', false, null, null, 0, true, true, 0);

-- Set up oauth for testing
INSERT INTO o_auth_client_stores (id, created_at, secret, domains, app_name, admin_id)
VALUES ('abc123', now(), 'def456', '{example.com}', 'Test', 1);
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'sessions');
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'session');
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'session_intervals');
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'event_chunks');
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'event_chunk_url');
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'admin');
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'error_groups');
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'logs');
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'traces');
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'metrics');
INSERT INTO o_auth_operations (created_at, client_id, authorized_graph_ql_operation)
VALUES (now(), 'abc123', 'traces_metrics');
