INSERT INTO workspaces (id, created_at, updated_at, deleted_at, name, secret, slack_access_token, slack_webhook_url,
                        slack_webhook_channel, slack_webhook_channel_id, slack_channels, linear_access_token,
                        migrated_from_project_id, hubspot_company_id, stripe_customer_id, stripe_price_id, plan_tier,
                        unlimited_members, billing_period_start, billing_period_end, next_invoice_date,
                        monthly_session_limit, monthly_members_limit, trial_end_date, allow_meter_overage,
                        allowed_auto_join_email_origins, eligible_for_trial_extension, trial_extension_enabled,
                        clearbit_enabled)
VALUES (1, '2022-09-13 01:22:33.433339 +00:00', '2022-09-13 01:22:33.934553 +00:00', null, 'w1', 'asdf',
        null, null, null, null, null, null, null, null, 'cus_a1b2c3d4', null, 'Free', false, null, null, null,
        null, null, '2022-09-27 01:22:33.433245 +00:00', false, null, true, false, false);

INSERT INTO projects (id, created_at, updated_at, deleted_at, name, stripe_customer_id, stripe_price_id,
                      zapier_access_token, billing_email, secret, trial_end_date, monthly_session_limit, workspace_id,
                      free_tier, excluded_users, error_json_paths, backend_domains, backend_setup,
                      rage_click_window_seconds, rage_click_radius_pixels, rage_click_count)
VALUES (1, '2022-09-13 01:22:35.758964 +00:00', '2022-09-14 05:00:53.763444 +00:00', null, 'p1', null, null, null,
        'swag@highlight.run', 'ccftmmv6i1e1m780kh20', null, null, 1, false, null, null,
        '{pri.highlight.run,pub.highlight.run,localhost:8082}', true, 5, 8, 5);

INSERT INTO admins (id, created_at, updated_at, deleted_at, name, first_name, last_name, hubspot_contact_id, email,
                    about_you_details_filled, phone, number_of_sessions_viewed, email_verified, photo_url, uid,
                    slack_im_channel_id, referral, user_defined_role, user_defined_persona)
VALUES (1, '2023-02-04 06:44:32.027338 +00:00', '2023-02-04 07:35:15.066344 +00:00', null, 'Hobby Highlighter', 'Hobby',
        'Highlighter', null, 'demo@example.com', true, '+14081234567', null, true,
        'https://avatars.githubusercontent.com/u/1351531?s=40&v=4', 'Hobby Highlighter', null, '', 'eng',
        'ENGINEERING');

INSERT INTO workspace_admins (admin_id, workspace_id, created_at, updated_at, deleted_at, role)
VALUES (1, 1, NOW(), NOW(), null, 'ADMIN');
