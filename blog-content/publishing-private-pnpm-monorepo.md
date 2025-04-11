---
title: Publishing an NPM Package with Private pnpm Monorepo Dependencies
createdAt: 2023-01-27T12:00:00.000Z
readingTime: 13
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: Software Engineer @ Highlight
authorTwitter: 'https://twitter.com/vkorolik'
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorWebsite: 'https://vadweb.us'
authorPFP: >-
  https://lh3.googleusercontent.com/a-/AOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY=s96-c
tags: Engineering
metaTitle: Publishing an NPM Package with Private pnpm Monorepo Dependencies
---

Trying to publish an npm package but have a complicated monorepo setup? Publishing a library that depends on other packages you've built but don't want published to npm? We'll be covering how we do this at highlight.io to setup our [npmjs package](https://www.npmjs.com/package/highlight.run "https://www.npmjs.com/package/highlight.run"). But first...

### What is a monorepo?

A [monorepo](https://en.wikipedia.org/wiki/Monorepo "https://en.wikipedia.org/wiki/Monorepo") is a code repository that stores multiple distinct projects side by side, typically organized via the directory structure. Projects of a common language may reside in a

Here's what [our application's](https://github.com/highlight/highlight/ "https://github.com/highlight/highlight/") structure looks like abridged:

```
highlight/
├─ backend/
│  ├─ main.go
├─ packages/
│  ├─ ui/
│  │  ├─ package.json
│  │  ├─ src/
│  │  │  ├─ index.ts
├─ sdk/
│  ├─ highlight-run/
│  │  ├─ package.json
│  │  ├─ src/
│  │  │  ├─ index.ts
│  ├─ highlight-next/
│  │  ├─ package.json
│  │  ├─ src/
│  │  │  ├─ index.ts
│  ├─ highlight-py/
│  │  ├─ pyproject.toml
│  │  ├─ highlight_io/
│  │  │  ├─ ...
├─ frontend/
│  ├─ package.json
│  ├─ src/
│  │  ├─ index.tsx
├─ package.json
├─ yarn.lock
├─ ...
```

Our repository stores our golang backend, sdks (nodejs, nextjs, python, and more), and typescript frontend all side-by-side. Why? Packages in a monorepo can use one another directly, without having to push/pull from an external store like npm. Another way to put it: we can test our `highlight-run` package from our `frontend` directly, without the need for [yalc](https://github.com/wclr/yalc "https://github.com/wclr/yalc") or any other steps to sync the dependency.

### So how does the referencing work?

In our [repository](https://github.com/highlight/highlight "https://github.com/highlight/highlight"), we use [yarn v3 workspaces](https://yarnpkg.com/features/workspaces/ "https://yarnpkg.com/features/workspaces/") to bring together our javascript / typescript packages. Setting the `workspaces` key in the top level `package.json` is all we need to do, and yarn handles pulling in dependencies of packages into the overall `yarn.lock` file. Conveniently, running `yarn` from anywhere in our monorepo works, as `yarn` finds the top level `package.json` and resolves dependencies accordingly.

```
...
  "workspaces": [
    "packages/*",
    "frontend",
    "sdk/highlight-next",
    "sdk/highlight-run",
                ...
  ],
...
```

Let's take a look at how `frontend` might use the `highlight.run` library. If `highlight.run` is built as a library that will be published to NPM, the library should be referenced as a package import. The import looks exactly the same as if you were to use the library from npm, but yarn will automatically use the local version instead. In our [frontend index.tsx](https://github.com/highlight/highlight/blob/main/frontend/src/index.tsx "https://github.com/highlight/highlight/blob/main/frontend/src/index.tsx"), we reference the local package as follows:

```
import { H } from 'highlight.run'

H.init('...')
```

Yarn knows that `highlight.run` exists under `sdk/...` because that directory is part of the `workspaces` key and has the corresponding name in its [package.json](https://github.com/highlight/highlight/blob/main/sdk/highlight-run/package.json "https://github.com/highlight/highlight/blob/main/sdk/highlight-run/package.json"). That's all

### Publishing an NPM package with workspace dependencies

That setup sounded simple, right? Just write JS/TS, reference other local packages as you would if they were imported from npm, and you can publish your library. There's a bit of a catch here though: our `highlght.run` library uses our internal `client` typescript package that isn't public. While we want to publish `highlight.run` to npm, we **don't** want to publish the `client` library. Though `highlight.run` references typescript type definitions from `client`, we also don't want to bundle most of the code into `highlight.run` as that would increase the bundle size (instead we have `highlight.run` inject `client` as a deffered `<script>` tag at browser runtime; see more as to why in our [performance docs](https://www.highlight.io/docs/general/product-features/session-replay/performance-impact "https://www.highlight.io/docs/general/product-features/session-replay/performance-impact")).

Just like with the `frontend` usage of `highlight.run`, we started with having `highlight.run` import from `client` by referencing the `package.json` name of `@highlight-run/client`. This successfully worked in development as the reference could be resolved, but when we built `highlight.run` for production, the bundle contained references to `@highlight-run/client` which could not be resolved in our customers' environments since it was not a published package.

Next, we tried to use relative imports to make sure that the bundle didn't have any references to the private package. We replaced imports of `@highlight-run/client` with relative paths like `../../client/src/foo.ts` . This worked great both in development for publishing the bundle to npm, until we noticed that our `highlight.run` npmjs package had a large bundle size as it was bundling the entire codebase of `@highlight-run/clien`

### The Solution

After a bit of trial and error, we arrived at a solution: use relative path imports and rely on code splitting and `type` imports.

Here's a snippet of the imports from our [highlight.run entrypoint](https://github.com/highlight/highlight/blob/main/sdk/highlight-run/src/index.tsx "https://github.com/highlight/highlight/blob/main/sdk/highlight-run/src/index.tsx").

```
...
import { GenerateSecureID } from '../../client/src/utils/secure-id'
import type { Highlight, HighlightClassOptions } from '../../client/src/index'
...
```

When we need to import source code, like a function or a constant, we import it using a path import, making sure that the file that is imported from has as little other code as possible by breaking up our code into many files. This allows our bundler, rollup, to minimize the amount of code it needs to pull in when resolving the import.

When we import a typescripe type, using an `import type` statement allows rollup to ensure it is only importing the type definitions from the file, without importing the actual source code implementations. As a result, the output is efficiently constrained just to what is actually necessary, yielding a smaller bundle size as a result.

### A simplified [example](https://github.com/highlight/example-monorepo-pnpm "https://github.com/highlight/example-monorepo-pnpm") of private dependencies

Check out our pnpm example of the monorepo setup [here](https://github.com/highlight/example-monorepo-pnpm "https://github.com/highlight/example-monorepo-pnpm") (with `tsup` bundling using `rollup` under the hood)! A other few gotchas that we discovered along the way that we show how to configure in the [example repo](https://github.com/highlight/example-monorepo-pnpm "https://github.com/highlight/example-monorepo-pnpm"):

##### [tsconfig.json](https://github.com/highlight/example-monorepo-pnpm/blob/main/packages/first/tsconfig.json "https://github.com/highlight/example-monorepo-pnpm/blob/main/packages/first/tsconfig.json") changes required

You'll need to update your `tsconfig.json` to include a [references](https://www.typescriptlang.org/docs/handbook/project-references.html "https://www.typescriptlang.org/docs/handbook/project-references.html") key to resolve the types of workspace packages. Private packages imported via references also need to have `"composite": true` set.

##### Use pnpm-workspace.yaml with pnpm

If you are migrating to pnpm from a yarn workspaces setup, you'll need to move your workspace definitions from your `package.json` to a new file named `pnpm-workspace.yaml` in the top level of your repository.

##### Individial package build steps

When setting up your code bundling, your packages may need build steps to output the production bundle that will be published to npm. In our example, we start simple with a manual `tsup src --target esnext --dts` script in the packages' `package.json` files, but for a larger project, you'll likely be interested in setting up something like [turborepo](https://github.com/vercel/turbo "https://github.com/vercel/turbo") or [Nx](https://nx.dev/ "https://nx.dev/"). These build systems provide automation for the bundling steps that make it easier to manage the order in which your packages must be built. We'll have a blog about digging into javascript build systems in the future! If you're interested, let us know!
