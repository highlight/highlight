---
title: Session Search Deep Linking
slug: session-search-deep-linking
createdAt: 2022-01-26T19:50:50.000Z
updatedAt: 2024-05-15T00:00:00.000Z
---

The queries you build when searching for sessions are reflected in the URL parameters. You can share these URLs
with others to deep link to search results, or even create them programatically.

## Syntax

`/sessions?query={key}={value}`

- The logical combinations, `and` and `or`, are built into the query, separated by spaces (`%20`):

  - `/sessions?query={key1}={value1}%20AND%20{key2}={value2}`
  - `/sessions?query={key1}={value1}%20OR%20{key2}={value2}`

- Implicitly, `and` is used, so the following two queries are equivalent:
  - `/sessions?query={key1}={value1}%20AND%20{key2}={value2}`
  - `/sessions?query={key1}={value1}%20{key2}={value2}`

- For the list of session properties, see our [Session search docs](../1_session-replay/session-search.md#autoinjected-attributes)

- For more information on operators and general search, see our [Search docs](../../6_product-features/3_general-features/search.md)


## Examples

Viewing sessions for a particular user:

`/sessions?query=identifier=alice@example.com`

Excluding sessions from your organization:

`/sessions?query=identifier!=*@yourdomain.com*`

Viewing sessions for a particular page in your app:

`/sessions?query=visited-url=*/your/path/name*`

Multiple properties

`/sessions?query=identifier=Bob%20email!=alice@example.com`
