---
title: Dashboard Variables
slug: variables
createdAt: 2024-10-21T00:00:00.000Z
updatedAt: 2024-10-21T00:00:00.000Z
---

Dashboard variables let you parameterize filters, bucketing, and grouping across multiple graphs. You can create and edit dashboard variables from the dashboard or graphing editor pages.

![Variable creation](/images/docs/graphing/variable_creation.png)

Variables support three types of suggestions: 

| Suggestion | Behavior |
| ---------- | -------- |
| Value      | When creating the variable, you select a search key. The variable's input is a multiselect showing the possible values for that key. |
| Key        | The variable's input is a select with all search keys. This is helpful for using a variable in function, grouping, and bucketing rules. |
| None       | The variable's input is free text. |

Variables will appear in the graphing editor components wherever they can be used, including in the filter, function, grouping, and bucketing rules. To reference a variable, use a dollar sign followed by the variable's name, for example `$user`.

![Variable usage](/images/docs/graphing/variable_usage.png)

Variables can be multivalued, e.g. to filter all sessions by a list of users. When using multivalued variables, the resulting filter is a logical OR of all values. For example, `email=$users` is interpolated to `email=(zane@highlight.io OR jay@highlight.io)`.
