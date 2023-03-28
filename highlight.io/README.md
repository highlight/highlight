<img width="2051" alt="Docs Thumbnail" src="https://user-images.githubusercontent.com/20292680/214512508-04cc1ca5-5c26-45c6-839e-7aa9b5280c90.png">

# Highlight's landing page & docs: [highlight.io](https://highlight.io)

Welcome to the repo we use to maintain our main landing page (https://highlight.io) and docs (https://highlight.io/docs). If you're looking to make contributions to Highlight's main repository, head over to https://github.com/highlight/highlight.

## Table of contents:

- [Editing the docs](#contributing-to-our-docs)
- [Running the site locally](#running-the-site-locally)

## Contributing to our Docs

### Ordering Doc Items

If you want to explicitly order items in the left panel (e.g. to make the `overview` section at the top of a subdirectory), rather than naming a file or directory in the format `{{content}}` you can use the syntax `{{number}}_{{content}}`.

- For example, for [`http://localhost:3000/docs/getting-started/fullstack-frameworks/next-js/metrics-overview`](http://localhost:3000/docs/getting-started/fullstack-frameworks/next-js/metrics-overview), the file path of the doc is `docs/general-docs/2_getting-started/fullstack-frameworks/next-js/metrics-overview.md`
- Notice `2_getting-started` because we want it second in the list of subfiles.

### How are slugs defined?

- For files in `general-docs`, the base path is `docs/` and for files in `sdk-docs`, the base path is `docs/sdk`.
- The rest of the slug is defined based on the file name / directory structure of the file. For files/folders in the form `{{number}}_{{content}}`\*, only the content is included in the slug.
  - For example, for [`http://localhost:3000/docs/getting-started/fullstack-frameworks/next-js/metrics-overview`](http://localhost:3000/docs/getting-started/fullstack-frameworks/next-js/metrics-overview), the file path of the doc is `docs/general-docs/2_getting-started/fullstack-frameworks/next-js/metrics-overview.md`

## Running the site locally

### How can I run them locally?

Run `yarn dev` (and optionally `yarn styles` if you’re making styling changes).

### Deployment

When a doc change is merged, you should be able to view the doc that you added/changed after a deploy is successful in Vercel at https://highlight.io.
