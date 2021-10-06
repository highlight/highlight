-- create/update workspaces using existing projects
insert into workspaces
	(id, created_at, updated_at, deleted_at, name, secret, slack_access_token, slack_webhook_url, slack_webhook_channel, slack_webhook_channel_id, slack_channels, migrated_from_project_id)
	select 
		p.id, p.created_at, p.updated_at, p.deleted_at, p.name, p.secret, p.slack_access_token,p.slack_webhook_url,p.slack_webhook_channel, p.slack_webhook_channel_id, p.slack_channels, p.id
	from projects p
on conflict (id)
do update
set created_at = excluded.created_at,
	updated_at = excluded.updated_at,
	deleted_at = excluded.deleted_at,
	name = excluded.name,
	secret = excluded.secret,
	slack_access_token = excluded.slack_access_token,
	slack_webhook_url = excluded.slack_webhook_url,
	slack_webhook_channel = excluded.slack_webhook_channel,
	slack_webhook_channel_id = excluded.slack_webhook_channel_id,
	slack_channels = excluded.slack_channels;
	
-- restart the workspace ids at max(id) + 1
select setval('workspaces_id_seq',  (select max(id) + 1 from workspaces));

-- create workspace_admins for existing project_admins
insert into workspace_admins
select 
	w.id as workspace_id, pa.admin_id from project_admins pa
	inner join workspaces w
	on pa.project_id = w.migrated_from_project_id
on conflict do nothing; -- skip if already exists

-- set the projects' workspace_id to the migrated_from_project_id
update projects p
	set workspace_id = w.id
from workspaces w
where w.migrated_from_project_id = p.id;
