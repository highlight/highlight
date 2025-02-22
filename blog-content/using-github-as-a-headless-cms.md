---
title: Using Github as a Headless CMS
createdAt: 2023-06-01T12:00:00.000Z
readingTime: 12
authorFirstName: Abhishek
authorLastName: More
authorTitle: Software Engineer
authorTwitter: ''
authorLinkedIn: 'https://www.linkedin.com/in/abhishek-more-linked/'
authorGithub: 'https://github.com/Abhishek-More'
authorWebsite: 'https://abhishekmore.com'
authorPFP: 'https://tamuhack.org/static/th-2022/headshots/webp/abhishek.webp'
tags: 'Engineering, Developer Experience'
metaTitle: Using Github as a Headless CMS
---

A content-management system (CMS) is software used to create, manage, and host content.
It is crucial to use a CMS for any frequently updating content on your site, as it allows for:

- Easy content creation and editing
- Centralized content management
- Collaboration and workflow management

Recently, Highlight switched over from [Hygraph](https://hygraph.com) to GitHub for managing blog content, and we've been loving it! In this blog, we'll cover how we did it and why it has been working so well for us.

[Check out the PR for this one!](https://github.com/highlight/highlight/pull/5635)

## Why GitHub is the best solution for us

### Speedy Build Times 💨

At the time of writing, we have 48 blog posts. At build time, post content is fetched from the CMS and each post page is statically generated
on the server (See [Static Site Generation](https://nextjs.org/docs/pages/building-your-application/rendering/static-site-generation)).
This means that we need to make 48 separate API calls to Hygraph to retrieve post content. However, due to API rate limits, we had to introduce a delay for each request. While this worked fine initially, our build time started to suffer as the number of posts increased.

With GitHub, all of our posts are written in markdown files and stored in the repository itself. The server is now able to read the file system and instantly fetch post content without having to make a single API call.

![build-time-over-time](/images/blog/using-github-as-headless-cms/blog-build-time.png)

Our build time for blog content is now down to **~2 seconds** and will remain constant as the number of posts increases.

### Improved Developer Experience 💡

For our technical content writers, GitHub couldn't be better! With the limited team members allowed by Hygraph, not everyone was able to review blog posts in Hygraph before they get published. Now, our engineers can make PRs and let everyone see the hosted blog post formatted exactly how its supposed to be.

Additionally, we get access to GitHub features, including Issues, Actions, and Projects. This ensures better organization and also provides a centralized platform for collaboration and feedback.

## How we did it

The original workflow involved:

- Fetching the raw markdown content from Hygraph with a GraphQL API call
- Rendering the content in the proper styling with Hygraph's [Rich Text Renderer](https://hygraph.com/blog/hygraph-react-rich-text-renderer)

The end goal was to access and render markdown located in the same repository.

To start, we used the filesystem module to fetch from the content directory.
This worked well, but we found that the existing Rich Text Renderer only rendered content formatted in the [AST representation](https://www.twilio.com/blog/abstract-syntax-trees). Rather than convert our markdown to AST, we decided to rebuild our rendering workflow with [`next-mdx-remote`](https://github.com/hashicorp/next-mdx-remote).

```
<MDXRemote
  {...source} //Raw markdown source
  components={components} //Record of styled components
/>
```

We included related data, such as title, author information, and tags, at the top of the markdown file itself using [`gray-matter`](https://github.com/jonschlinkert/gray-matter). This data is parsed at build time and the relevant information is rendered accordingly.

```
---
title: Using Github as a Headless CMS
authorFirstName: Abhishek
authorLastName: More
authorTitle: Software Engineer
tags: Highlight Engineering
metaTitle: Using Github as a Headless CMS
---
```

## Conclusion

The switch from Hygraph to GitHub as a CMS has revolutionized Highlight's workflow. We were able to reduce build times and let our entire team collaborate on blog posts. Best of all, this solution pushes our open-source ideals further (it's also free).

We would love to hear about your experiences using GitHub as a CMS. Please join us on [Discord](https://discord.gg/yxaXEAqgwN) or hit us up on [Twitter](https://twitter.com/highlightio) to chat more!
