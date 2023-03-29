---
title: Session Search Deep Linking
slug: session-search-deep-linking
createdAt: 2022-01-26T19:50:50.000Z
updatedAt: 2022-01-26T21:38:34.000Z
---

The queries you build when searching for sessions are reflected in the URL parameters. You can share these URLs with others to deep link to search results, or even create them programatically.

## Syntax

`/sessions?query={and|or}||{property1},{operator1},{valueA},{valueB}`

- Highlight supports `and` and `or` queries

- User properties:

  - `user_{your_property_name}`

- Track properties:

  - `track_{your_property_name}`

- Sessions built-in properties (these are automatically populated by Highlight):

  - `user_identifier `

  - `session_browser_version`

  - `session_browser_name`

  - `session_device_id`

  - `session_environment`

  - `session_os_name`

  - `session_os_version`

  - `session_referrer`

  - `session_reload`

  - `session_visited-url`

  - `custom_app_version`

  - `custom_created_at`

  - `custom_active_length`

  - `custom_viewed`

  - `custom_processed`

  - `custom_first_time`

  - `custom_starred`

- Operators:

  - `is`

  - `is_not`

  - `contains`

  - `not_contains`

  - `exists`

  - `not_exists`

  - `matches` (uses Lucene regex syntax)

  - `not_matches` (uses Lucene regex syntax)

  - `between` (for active_length)

  - `not_between` (for active_length)

  - `between_date` (for created_at)

  - `not_between_date` (for created_at)

## Examples

Viewing sessions for a particular user:

`/sessions?query=and||user_identifier,is,alice@example.com`

Excluding sessions from your organization:

`/sessions?query=and||user_identifier,not_contains,@yourdomain.com`

Viewing sessions for a particular page in your app:

`/sessions?query=and||session_visited-url,contains,/your/path/name`

Multiple properties

`/sessions?query=or||user_identifier,is,Bob||user_email,is_not,alice@example.com`
