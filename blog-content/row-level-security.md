---
title: Data isolation with ClickHouse row policies
createdAt: 2025-01-28T00:00:00.000Z
readingTime: 9
authorFirstName: Zane
authorLastName: Mayberry
authorTitle: Software Engineer @ Highlight
authorTwitter: ''
authorWebsite: ''
authorLinkedIn: 'https://www.linkedin.com/in/zane-mayberry-688161165/'
authorGithub: 'https://github.com/mayberryzane'
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FvrMpBimsRzOGGJSWWppg&w=1920&q=75
tags: 'Backend, Engineering'
metaTitle: Data isolation with ClickHouse row policies
---

```hint
This blog post discusses the tradeoffs between physical and logical database isolation, and then dives into how we solved for this at highlight.io with our multitenant Clickhouse cluster. Highlight.io is an [open source](https://github.com/highlight/highlight) monitoring platform. If you’re interested in learning more, get started at [highlight.io](https://highlight.io).
```

## Physical and logical data isolation

In databases, data isolation means separating the data for each of your application’s users to prevent data breaches. In a multitenant application, two methods for accomplishing this are physical isolation and logical isolation. With physical isolation, you maintain separate infrastructure for each of your tenants - this can be a separate database instance, separate tables, or whatever else best fits your application’s needs. With logical isolation, your tenants can share the same infrastructure, but you rely on application code to restrict what is and isn’t visible to each tenant. For example, if you have a table with rows that should be isolated between tenants, you could use logical isolation by appending a where clause:

```sql
WHERE tenant_id = 123
```

There are trade-offs between the two approaches. While physical isolation can introduce extra overhead, logical isolation can be error-prone. First, when you’re adding a new query to your application, you may forget to include the tenant check entirely. Unless you set up a lint rule or a hook in your ORM to enforce that this check is present, you’re relying on your engineers and reviewers to be very diligent. Second, if you’re generating queries dynamically, there may be more complex bugs or SQL injection vulnerabilities that cause this check to be bypassed:

```sql
-- before interpolation
WHERE %s AND tenant_id = 123

-- after interpolation
WHERE 1=1 OR 1=1 AND tenant_id = 123
```

## ClickHouse row policies

At highlight.io, ClickHouse is our main store for logs, traces, metrics, and session / error metadata. ClickHouse has built-in logical isolation using row policies - rules that restrict the set of rows each user can access. If you have a few tenants, it could be feasible to create a new ClickHouse user for each as part of your new tenant onboarding workflow:

```sql
CREATE ROLE tenant_123_role;
GRANT SELECT ON table TO tenant_123_role;
CREATE ROW POLICY table_tenant_123_policy ON table USING tenant_id = 123 TO tenant_123_role;
CREATE USER tenant_123 IDENTIFIED BY '' SETTINGS readonly = 1;
GRANT tenant_123_role TO tenant_123;
SET DEFAULT ROLE tenant_123_role TO tenant_123;
```

When your end user does something in your application to query ClickHouse, you can use the tenant’s relevant ClickHouse user or connection to make that query. In this case, the query can omit the where clause and the result set will only include rows with the matching tenant id. Side note: depending on your table’s primary key or indexes, there will likely be performance benefits to keeping the tenant id in the query.

## Row policy alternatives

What happens when you need to scale to thousands of tenants? For one, it may be difficult to optimize the connection pool for reuse. Connections are scoped to a single user, so a naive implementation would require different tenants to use different connections. It may be possible to share a common user and switch roles between queries. In Postgres, this can be done in a single transaction with `SET SESSION ROLE` and `RESET SESSION ROLE`. However, ClickHouse’s `SET ROLE` command is user-level, so you would have to manage concurrent access to prevent intermediate calls to `SET ROLE`.

Another downside is the total number of roles and policies needed. With one role per tenant and one row policy per table + role combination, this could require creating hundreds of thousands of access control objects. Without benchmarking, it’s not clear if this will cause any performance issues. It also makes the system complicated to manage. How will you audit all of your tenants to ensure they haven’t been improperly granted access to other tenants? How will you modify all of these access controls when it’s time to add or remove tables in the future?

## Implementing row policies at scale

At highlight.io, we recently launched our SQL editor, a tool within our dashboarding features that lets users write custom select queries to analyze and graph their highlight.io resources (logs, traces, sessions, etc.). We wanted the security guarantees of ClickHouse row policies without the overhead of creating access control objects for each tenant. What we ended up with was a hybrid approach where we can use a custom setting to enforce isolation:

```sql
CREATE ROLE readonly_role;
ALTER ROLE readonly_role SETTINGS SQL_tenant_id CHANGEABLE_IN_READONLY;
GRANT SELECT ON table TO readonly_role;
CREATE ROW POLICY table_readonly_policy ON table USING tenant_id = getSetting('SQL_tenant_id') TO readonly_role;
CREATE USER IF NOT EXISTS readonly_user IDENTIFIED BY '' SETTINGS readonly = 1;
GRANT readonly_role TO readonly_user;
SET DEFAULT ROLE readonly_role TO readonly_user;
```

Now, data can be queried as follows:

```sql
SELECT *
FROM logs
WHERE tenant_id = 123
SETTINGS SQL_tenant_id = 123
```

In practice, we are using the `clickhouse-go` golang driver and sending settings via the context object:

```go
chCtx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
	"SQL_tenant_id": clickhouse.CustomSetting{Value: tenantId},
}))

rows, err := client.connReadonly.Query(
	chCtx,
	sql,
	args...,
)
```

Compared to the earlier examples of logical data isolation, one of the big advantages of this approach is that if the `SQL_tenant_id` setting is omitted, the query fails with an error `Unknown setting 'SQL_tenant_id'`. This guards against a developer accidentally omitting the setting in their query. Also, because the `tenant_id` is provided in the context rather than merged into a where clause, it is less error prone and more resistant to SQL injection. For security, we only have to check that the select query we execute doesn’t contain a settings clause, since this would allow an attacker to override the application-set `tenant_id` with their own value. As future work, there may be other methods of increasing the security of this approach - for example, instead of using a guessable id, each tenant could have their own secret key stored on each row, so that attempts to guess a nonexistent secret key will almost always return 0 rows and can be easily detected.

## Conclusion

To conclude, at Highlight, we implemented a hybrid approach using ClickHouse row policies and custom settings to handle data isolation in our multitenant environment. This solution ensures secure tenant-level isolation, reduces the risk of errors and SQL injection attacks, and avoids the complexity of managing thousands of roles and policies. If you have feedback, feel free to reach out to us on our [Discord](https://discord.gg/yxaXEAqgwN).
