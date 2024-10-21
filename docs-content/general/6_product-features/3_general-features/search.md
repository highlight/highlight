---
title: Search
slug: search
createdAt: 2023-01-16T09:00:00.000Z
updatedAt: 2024-05-15T00:00:00.000Z
---

## Basic Syntax

A search query is composed of one or more **expressions**. Each expression can be a comparison between a **key** and a **value**, or a logical combination of other expressions.

```
span_name=gorm.Query
```

You can also enter a seach value without a key to search on a default key. For logs, this would be the `message` and on traces it would be the `span_name`.

```
gorm.Query
```

Any custom attributes you send in sessions, logs, and traces can be filters on as well.

```
user_id=42
```

## Keys and Values

Keys are identifiers, which can include any combination of alphanumeric characters, underscores (`_`),
periods (`.`), dashes (`-`), and asterisks (`*`).

Values can be strings with any character. In order to use spaces or special characters, you must enclose
the string in quotes (`"`, `'`).

### Wildcards

You can use `*` in values to match on part of a pattern.

* `span_name=gorm.*` matches all `span_name` values that start with `gorm.`
* `span_name=*.Query` matches all `span_name` values that end with `.Query`
* `span_name=*orm*` matches all values that contain `orm`

Note that if you want to use a value with a space or special character, you will need to wrap the value
in quotations.

```
tag="*query error*"
visited-url="https://app.highlight.io/*"
```

### Regex Expressions

You can search with regex expressions by using the matches query operator `=\[your regex here]\`.

* `clickTextContent=/\w.+\w/` matches all `clickTextContent` that start and end with any word
* `browser_version=/\d\.\d\.\d/` matches all `browser_versions` in the form `[0-9].[0-9].[0-9]`

Note that if you want to use a regex expression with a space or special character, you will need to
wrap the value in quotations.

```
tag="/\w \w/"
visited-url="/https://app.highlight.io/\d/.+/"
```

## Comparisons

Comparisons are made using **operators**. The following operators are supported:

* `=` - Equal to
* `!=` - Not equal to
* `<` - Less than
* `<=` - Less than or equal to
* `>` - Greater than
* `>=` - Greater than or equal to

### Exist & Not Exist

You can search if a key exists or does not exist with the `exists` operator. For example,
if you wanted all the traces with a connected session, you would do use the following query:

```
secure_session_id exists
```

The `exists` also works with the `not` keyword. An example is when you only want the root level
spans when searching traces, then you would use this query

```
parent_span_id not exists
```

## Logical Combinations

Expressions can be combined using the logical operators `AND`, `OR`, and `NOT`.

* `AND` - Both expressions must be true
* `OR` - At least one of the expressions must be true
* `NOT` - The following expression must be false

Note that there is an implicit `AND` between all filters unless you specify an `OR` directly. For example:

```
service_name=private-graph span_name=gorm.Query
```

This is equivalent to:

```
service_name=private-graph AND span_name=gorm.Query
```

## Grouping Expressions

Expressions can be grouped using parentheses `(` and `)`. For example:

```
(key1=value1 AND key2=value2) OR key3=value3
```

You can also use parentheses to group values in an expression:

```
service_name=(private-graph OR public-graph)
```

## Query Examples

Here are some examples of valid search queries:

* `service_name=private-graph`
* `service_name=public-graph AND span_name!=gorm.Query`
* `service_name=worker OR span_name=gorm.Query`
* `service_name!=private-graph`
* `(service_name=public-graph AND span_name=gorm.Query) OR duration>=100000`

## Search Segments

All of our search pages allow you to save a search and reuse it later. We call these **segments**. Create segments for common sets of filters you want to use across Highlight.

## Special characters

When using special characters in a value, the value should be wrapped in quotations. Special characters include spaces,
operator characters (`!`, `=`, `:`, `<`, `>`), and parentheses.

## More Reading

See the links below for more details on searching in specific parts of the product.

* [Session search](../1_session-replay/session-search.md)
* [Error search](../2_error-monitoring/error-search.md)
* [Log Search](../4_logging/log-search.md)
* [Trace Search](../5_tracing/trace-search.md)
* [Event search](../6_metrics/5_event-search.md)
