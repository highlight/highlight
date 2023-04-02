---
title: Identifying Users
slug: identifying-users
createdAt: 2021-09-13T23:23:20.000Z
updatedAt: 2022-07-19T21:02:40.000Z
---

To tag sessions with user-specific identifiers (name, email, etc.), you can call the [`H.identify()`](../../../sdk/client.md#Hinit)method in your app. This will automatically index your sessions so that they can be filtered by these attributes.

```typescript
H.identify('eliza@corp.com', { id: 'ajdf837dj', phone: '867-5309' })
```

## User Display Names

By default, Highlight will show the `identifier` as the user's display name on the session viewer and session feed. You can override this by setting the `highlightDisplayName` or `email` fields in the [`H.identify()`](../../../sdk/client.md#Hidentify) metadata.

## Customer User Avatars

You can replace the placeholder user avatars Highlight uses with an image that you provide. You can do this by setting the `avatar` field in the [`H.identify()`](../../../sdk/client.md#Hidentify) metadata.

The image URL usually comes from your authentication provider (Firebase, Auth0, Active Directory, etc.). You can forward that URL to Highlight.

```hint
## Saving the image

Highlight does not make a copy of the image. Highlight will render the image directly. This means the image will adhere to any authorization policies.
```

```typescript
H.identify('steven@corp.com', { avatar: 'https://<IMAGE_URL>.png' })
```

## API

See the [H.identify()](../../../sdk/client.md#Hidentify) API documentation for more information on how to use it.

## What happens before a user is identified?

All key session information is tracked regardless of whether a session is identified. Highlight will generate an identifier for a user which you can see in the session player unless you set your own by calling [H.identify()](../../../sdk/client.md#Hidentify).

When a user is identified we will attempt to **assign their information to previous sessions** from the same browser. If this happens you will see an indicator in the UI showing the data was inferred for a session and that the session was never explicitly identified.
