---
title: 'The power of the monorepo: Keep your fullstack app in sync!'
createdAt: 2022-08-30T12:00:00.000Z
readingTime: 22
authorFirstName: François
authorLastName: Wouts
authorTitle: Developer Happiness Engineer
authorTwitter: 'https://twitter.com/fwouts'
authorLinkedIn: 'https://linkedin.com/in/fwouts'
authorGithub: 'https://github.com/fwouts'
authorWebsite: 'https://fwouts.com/'
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2F39CS6bVyRBWbnq4ileQJ&w=3840&q=75
tags: Engineering
metaTitle: 'The power of the monorepo: Keep your fullstack app in sync!'
---

It's more and more common nowadays to use JavaScript (or better yet TypeScript) for both your frontend and your backend. Pick any random company and I'd bet you'll see a React or Vue frontend making HTTP calls to a NodeJS backend, often using a REST-like JSON API.

APIs can be quite complex, often leading to implementation errors. How can you make sure the frontend and backend always integrate well with each other? Let's dive into an example codebase and walk through a few iterations to see how we can solve this, what new problems arise along the way, and how we can ultimately solve them with a monorepo.

## **A simple server/client relationship**

Consider a team working on a React frontend and a Node backend that exposes a REST API. They have two corresponding repos on GitHub: `frontend` and `backend`. This team is already well aware of the benefits of type safety, so they use TypeScript with strict settings on both codebases. They'd make [_@mattpocockuk_](https://twitter.com/mattpocockuk "https://twitter.com/mattpocockuk") proud.

When a user signs up, the frontend makes a POST request to `/users` with the data provided in the sign-up form. This includes their email address as well as their first name:
```
// frontend/signup.ts

export async function onUserSignUp(formData: {
  email: string;
  firstName: string;
}) {
  const data = await fetch(`${baseUrl}/users`, {
    method: "POST",
    body: JSON.stringify(formData),
  }).then(response => response.json());
  return data.userId;
}
```

The backend extracts the corresponding fields and stores them in the database's `users` table:

```
// backend/main.ts

app.post("/users", async (req, res) => {
  const email = req.body["email"];
  const firstName = req.body["first_name"];
  const userId = await createUser({
    email,
    firstName
  });
  res.json({
    userId
  });
});
```

The website launches. A few weeks go by. Then a product manager comes along and asks: how come all users have the first name "undefined"?

Read the above code again and you might spot the bug: the frontend used the field `"firstName"` but the backend looked for `"first_name"`. The latter will always be `undefined`.

In isolation, both the frontend and backend are working perfectly. Unfortunately, a simple typo breaks their integration. This is an easy fix, and we could improve the situation with careful input validation on the backend, but how could we have prevented this from happening in the first place?

## **Types to the rescue**

We can leverage TypeScript to eliminate this type of problem. Let's start by defining API request and response types explicitly in our backend:

```
// backend/api.ts

export type CreateUserRequest = {
  email: string;
  firstName: string;
};

export type CreateUserResponse = {
  userId: string;
};
```

We can use these types in our Express endpoint definition to benefit from type safety:

```
// backend/main.ts
import type {
  CreateUserRequest,
  CreateUserResponse
} from './api';
// Note the additional type annotations here. The rest of the code is unchanged.
app.post < {}, CreateUserResponse, CreateUserRequest > ("/users", async (req, res) => {
  const email = req.body["email"];
  // ❌ This is now a TypeScript error!
  // Property 'first_name' does not exist on type 'CreateUserRequest'. Did you mean   'firstName'?
  const firstName = req.body["first_name"];
  const userId = await createUser({
    email,
    firstName
  });
  res.json({
    userId
  });
});
```
Now, we can fix the backend bug and proceed to the next step.

To ensure full-stack type safety, let's copy-paste `api.ts` in our frontend code and use the same types to call the endpoint:

```
// frontend/api.ts

export type CreateUserRequest = {
  email: string;
  firstName: string;
};
export type CreateUserResponse = {
  userId: string;
};
```

We can start using these types in our API calling code:

```
// frontend/signup.ts
import type {
  CreateUserRequest,
  CreateUserResponse
} from './api';
import {
  fetchJson
} from './helpers/fetch-json';
export async function onUserSignUp(formData: {
  email: string;
  firstName ? : string;
}) {
  const data = await fetchJson < CreateUserResponse,
    CreateUserRequest > (`${baseUrl}/users`, {
      method: "POST",
      body: formData,
    });
  return data.userId;
}
```

You'll notice we're not calling `fetch()` anymore, but our own `fetchJson()` helper. It's a lot like `fetch()`, but it lets us provide a request and response type. Here is a sample implementation:

```
// frontend/helpers/fetch-json.ts

export async function fetchJson < Res, Req = void > (
  url: string, {
    method,
    body
  }: FetchOptions < Req >
): Promise < Res > {
  const response = await fetch(url, {
    method,
    body: body === undefined ? null : JSON.stringify(body),
    headers: {
        "Content-Type": "application/json",
    },
  });
  return response.json();
}
type FetchOptions < Req > = |
  {
    method: "PATCH" | "POST" | "PUT";
    body: Req;
  } |
  {
    method: Req extends void ? "DELETE" | "GET" : never;
    body ? : never;
  };
```

Now if we try to pass the wrong field name from our `onUserSignup()` function, we'll get a helpful type error:

```
// frontend/signup.ts
import type {
  CreateUserRequest,
  CreateUserResponse
} from './api';
import {
  fetchJson
} from './helpers/fetch-json';
export async function onUserSignUp(formData: {
  email: string;
  first_name: string; // WRONG!
}) {
  const data = await fetchJson < CreateUserResponse,
    CreateUserRequest > (
      `${baseUrl}/users`, {
        method: "POST",
        // ❌ TypeScript error
        // Property 'firstName' is missing in type '{ email: string; first_name: string; }'
        // but required in type 'CreateUserRequest'.ts(274
        body: formData,
      }
    );
  return data.userId;
}
```
We've successfully added type safety on both ends of the network thanks to the wonders of TypeScript and copy-pasting!

Of course, this approach has one major flaw: it relies on copied code in your frontend and backend repos, which makes it vulnerable to all kinds of human errors.

## **Publishing API types as a private package**

To mitigate human error caused by repeated code in the frontend/backend, what if we published the type definitions from the `backend` repo to a private NPM package such as `@myorg/api`, which the frontend will depend on?

Let's move `backend/api.ts` into its own directory with a new `package.json`:
```
backend /
  api /
  package.json
index.ts
// package.json
{
  "name": "@myorg/api",
  "private": true,
  "version": "1.0.0",
  "types": "index.ts"
}
```

We can now publish it to our private NPM registry. I won't go into the specifics of how to publish private packages here, but you can read up [_NPM's documentation here_](https://docs.npmjs.com/creating-and-publishing-private-packages "https://docs.npmjs.com/creating-and-publishing-private-packages"). Note that there are other options such as [_GitHub Packages_](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry "https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry") and [_CloudSmith_](https://help.cloudsmith.io/docs/npm-registry "https://help.cloudsmith.io/docs/npm-registry").

With this approach, we won't need to manually copy-paste `api.ts` and instead we'll do:
```
// frontend/signup.ts
import type {
  CreateUserRequest,
  CreateUserResponse
} from '@myorg/api';
// ... the rest remains unchanged
```

Whenever the API type definitions change, in order to be able to use them from the `frontend` repo, we won't be copy-pasting `api.ts` anymore. Instead we'll need to:

-
-   update the version number in `@myorg/api`;
-
-   publish the new version to our private NPM registry; and
-
-   update `@myorg/api` to the latest version in the `frontend` repo.

With a little bit of extra work, this can be mostly automated. In particular:

-
-   We can auto-generate a date-based version number based on the latest commit that touched the `api` directory with `git log -1 --date=format:'%Y%m%d%H%M%S' --format=%cd`
-
-   We can publish the private package from CI whenever the version number changes.
-
-   We can use [_Renovate_](https://github.com/renovatebot/renovate "https://github.com/renovatebot/renovate") or [_Dependabot_](https://github.blog/2020-06-01-keep-all-your-packages-up-to-date-with-dependabot/ "https://github.blog/2020-06-01-keep-all-your-packages-up-to-date-with-dependabot/") to automatically open a PR to update `@myorg/api` in the frontend repo.

### **A breaking change**

Fast-forward a few months into the future. It's tech debt week, and a backend engineer is looking for old code to delete. They notice an old deprecated field in one of the response types:

```
export type GetUserInfoResponse = {
    firstName: string;
    name: string; // Deprecated since 2021/02/01
    reviews: Review[];
};
```
Perfect, let's delete the `name` field since it was deprecated more than a year ago! They send a PR, which is promptly approved by their peers, merged and deployed.

Immediately, the frontend starts throwing 500 errors in production. Panic ensues in the frontend team. After a few minutes, they realise the backend broke something. They loop in the backend team and get the deployment rolled back in a hurry. Phew! The website was only down for twenty minutes. Meanwhile, Dependabot generates a PR to update `@myorg/api` to the latest version. CI runs and fails almost immediately: TypeScript compilation error.

It turns out that usage of the deprecated `name` field was never removed from the frontend repo.

## **Using a monorepo**

You could argue that this incident wouldn't have happened if the frontend team had carefully followed up on the deprecation of the `name` field in February 2021. That is true, but mistakes do happen. Maybe the backend engineer who deprecated the field forgot to mention it in the release notes of the `@myorg/api` package. Maybe the frontend engineer who updated the `@myorg/api` package assumed it was already removed from the codebase. Maybe they assigned a ticket to someone else, who didn't follow up on it because they were overloaded with work.

Wouldn't it be better if we made that situation technically impossible in the first place?

The problem with a private NPM library, just like copy-pasting, is that at any given time we have **two** versions of the API types in our codebases:

1.  the current "up to date" version of API types in the `backend` repo
2.  whichever version of API types is used in the `frontend` repo

If we make sure to always update API types as soon as possible, these two versions will generally be quite close. However, they are never guaranteed to be identical. In fact, whenever a change is made to API types in the `backend` repo, the `frontend` version will by nature lag behind. Our incident happened precisely when the API change was merged into the `backend` repo, but not yet merged into the `frontend` repo.

I mentioned earlier that the PR to merge the API change into the `frontend` repo would have failed. We would have wanted to know about this upcoming failure **before** it got merged into the `backend` repo. But that's not possible because the API types package is only generated **after** the change is merged into the `backend` repo!

How can we solve this conundrum?

Well, the simplest way is to have a single repository for both `frontend` and `backend`, i.e. a "monorepo". With a monorepo, we don't need to publish API types to a private NPM package anymore. We don't need to version API types either. Instead, the `frontend` app can directly depend on `api.ts`, which is shared with the `backend` app. It's the same file, with the same history. It's a single source of truth.

```
// frontend/signup.ts
import type {
  CreateUserRequest,
  CreateUserResponse
} from '../backend/api';
import {
  fetchJson
} from './helpers/fetch-json';
```

When we make the change in the `backend/api` directory, CI runs for both frontend and backend apps, and PR checks fail, blocking the merge. This is what we want! We're effectively prevented from making a backend change that would break the frontend.

Once the PR fails, the backend engineer will realise that the frontend in fact does use this field. They will need to either update the frontend code themselves, or ask a frontend engineer to contribute to the PR.

## **Monorepos don’t solve everything!**

It's important to realise that even with a monorepo, production incidents caused by API changes can still occur.

For example, let's say we merge a PR that does two things:

-   it removes usage of `name` in the frontend; and
-   it removes the `name` field in the backend.

If the backend is deployed first, while the "old" frontend is still in production, we'll encounter the exact same production incident. This is why, even with a monorepo, it's generally a good idea to split this type of change into several PRs: first, a PR removing usage in the frontend, then another PR implementing the breaking change in the backend.

I recommend waiting for the first PR (frontend change) to be merged, deployed and stable in production for at least a few hours, ideally a couple of days, before merging and deploying the second PR (backend change). This helps for two reasons:

1.  A user might still have the old version of the frontend app open in their browser, which may crash once the backend change is deployed.
2.  A completely unrelated bug, perhaps a small mistake by another engineer, could require the frontend to be rolled back. If the rolled back frontend was built before the first PR, it will lead to the same production incident.

_Here comes the ad!_

Whether or not you decide to use a monorepo, it's a good idea to make sure you have a good monitoring solution in place to be notified when an incident occurs. In the stress of the moment, you'll want to have all the required context at your disposal. You can use [_Highlight_](https://www.highlight.io/ "https://www.highlight.io/") to easily replay sessions that led to a bug, allowing you to narrow down the cause in an instant. This way, you can roll out a fix in a matter of minutes and be confident you've solved the underlying issue.

<BlogCallToAction />

## **Next steps**

In this post, we've gotten a glimpse of the power of a monorepo for code sharing across projects. This is only one of the many advantages of a monorepo. You can take it to the next level with shared libraries, [_codegen_](https://github.com/fwouts/ts-shift "https://github.com/fwouts/ts-shift"), and so on.

When you use a true monorepo—by that I mean a single repository for all projects in any language across the entire organisation—you may also find that working across projects gets significantly simpler, since you're no longer dealing with siloed Git repos and versioned APIs/libraries. Everyone has the latest version of the same code, and any engineer making a change that breaks another team will know about it when their PR shows failing tests, leaving that team to focus on their own work uninterrupted.

I plan to write more on the topic of monorepos (in particular how to keep your monorepo lean and set up CI efficiently), but in the meantime check out [_monorepo.tools_](https://monorepo.tools/ "https://monorepo.tools/") to learn more about monorepos!
