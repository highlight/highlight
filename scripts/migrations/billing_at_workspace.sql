-- set the workspace's stripe_customer_id and stripe_price_id using the paying project within that workspace
-- if there are 2 or more paying projects (not the case in production), stripe_customer_id and stripe_price_id will not be set
update workspaces
set stripe_customer_id = p.stripe_customer_id, stripe_price_id = p.stripe_price_id
from workspaces w
inner join (
	-- get the stripe_customer_id and stripe_price_id for any workspace with 1 paying project
    select workspace_id, max(stripe_customer_id) as stripe_customer_id, max(stripe_price_id) as stripe_price_id
    from projects
    where (
		stripe_price_id <> 'price_1IqMXJGz4ry65q42UjWSaVnd'      -- free tier, test
		and stripe_price_id <> 'price_1IqMSJGz4ry65q42YYdWot8J') -- free tier, production
    group by workspace_id
	having count(*) = 1
	
	union all 
	
	-- get the stripe_customer_id for workspaces with 0 paying projects
    -- this is arbitrarily the max of the customer_ids for each project within the workspace
	select workspace_id, max(stripe_customer_id) as stripe_customer_id, null as stripe_price_id
    from projects a
    where not exists (
		select *
    	from projects
		where (
			stripe_price_id <> 'price_1IqMXJGz4ry65q42UjWSaVnd'      -- free tier, test
			and stripe_price_id <> 'price_1IqMSJGz4ry65q42YYdWot8J') -- free tier, production
		and workspace_id = a.workspace_id
	)
    group by workspace_id
) p
on w.id = p.workspace_id
where w.id = workspaces.id;

-- set monthly session limit as the sum of the projects within the workspace
-- set trial end date as the max of the projects within the workspace
update workspaces
set monthly_session_limit = p.monthly_session_limit, trial_end_date = p.trial_end_date
from workspaces w
inner join (
    select workspace_id, sum(monthly_session_limit) as monthly_session_limit, max(trial_end_date) as trial_end_date
    from projects
	group by workspace_id
) p
on w.id = p.workspace_id
where w.id = workspaces.id;
