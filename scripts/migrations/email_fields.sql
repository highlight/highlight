insert into fields
(created_at, updated_at, type, name, value, project_id)
select NOW(), NOW(), 'user', 'email', value, project_id
from fields a
where a.type = 'user'
and a.name = 'identifier'
and a.value ~ '^[A-Za-z0-9._%\-+]+@[A-Za-z0-9.\-]+[.][A-Za-z]+$'
and not exists (
	select 1
	from fields b
	where b.type = 'user'
	and b.name = 'email'
	and b.value = a.value
);

insert into session_fields
(field_id, session_id)
select email_id as field_id, session_id from session_fields sf
inner join
(
	select a.id as identifier_id, b.id as email_id
	from fields a
	inner join fields b
	on a.value = b.value
	where a.type = 'user'
	and a.name = 'identifier'
	and b.type = 'user'
	and b.name = 'email') c
on sf.field_id = c.identifier_id
on conflict do nothing;
