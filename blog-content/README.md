## Creating Blog Posts

- Names of files can only have letters and dashes
- Multiple tags are supported and can be comma-separated. The corresponding slug for each tag will be lowercase with dashes replacing the spaces.
- Images should be stored in `/public/images/blog/${articleSlug}/${imageName}`.

Below is example of the data which should be at the top of each .md file

\---
title: Example Post
createdAt: 2023-04-04T12:00:00Z
readingTime: 10
authorFirstName: First
authorLastName: Last
authorTitle: Software Engineer @ Highlight
authorTwitter: 'https://twitter.com/'
authorLinkedIn: 'https://www.linkedin.com/in/'
authorGithub: 'https://github.com/'
authorWebsite: 'https://portfolio.com'
authorPFP: 'https://lh3.googleusercontent.com/a-/AOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY=s96-c'
tags: Highlight Engineering
metaTitle: A title used for metadata.
\---
