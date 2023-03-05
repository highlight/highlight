# nextjs-app-starter

<p align="center">
  <img src="./screenshot.png">
</p>

This is a [NextJS 12](https://nextjs.org/) starter template based off [`nextjs-ts-tailwind`](https://github.com/filp/nextjs-ts-tailwind) for real-world app development, including:

- Typescript
- [TailwindCSS](https://tailwindcss.com/)
- [Tanstack-Query](https://tanstack.com/query/v4) with hydration support & helpers + [`superjson`](https://github.com/blitz-js/superjson), as well as its devtools enabled in development.
- [`next-better-api`](https://github.com/filp/next-better-api) with API schema validation powered by [Zod](https://github.com/colinhacks/zod)
- Google Font (Roboto) embed under a custom `_document.tsx` file, and matching `tailwind.config.js`
- Custom `prettier` and `eslint` configuration
  - `prettier-plugin-tailwindcss` for automatic Tailwind class sorting
  - Import order rules
  - Enforce use of `type` modifier in imports when appropriate
  - Avoid `console.log` statements
  - Avoid dangling Promises
  - Prefer arrow functions with implicit returns when appropriate
  - ...and a bunch of other rules
- Path aliases configured under `tsconfig.json` (`@components/`, `@lib/`, `@api/`)

## Using this starter

### With `create-next-app`:

```shell
$ npx create-next-app -e https://github.com/filp/nextjs-app-starter
```

### With `degit`:

```shell
$ npx degit https://github.com/filp/nextjs-app-starter <your-app-name>
```

---

## Stuff

See license information under [`LICENSE.md`](/LICENSE.md).

Contributions are super welcome - in the form of bug reports, suggestions, or better yet, pull requests!
