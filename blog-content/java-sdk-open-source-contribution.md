---
title: Supporting Outside Contributions at Highlight
createdAt: 2023-05-09T12:00:00Z
readingTime: 4
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: CTO @ Highlight 
authorTwitter: 'https://twitter.com/vkorolik'
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorWebsite: 'https://vadweb.us'
authorPFP: 'https://lh3.googleusercontent.com/a-/AOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY=s96-c'
tags: Highlight Engineering
metaTitle: Supporting Outside Open Source Contributions at Highlight.
---

A few weeks ago, a passionate developer [Nils Gereke](https://github.com/NgLoader) wrote [a new fully-featured Java SDK](https://github.com/highlight/highlight/pull/4812) for highlight. He built the CI necessary to automatically push [packages to Maven](https://mvnrepository.com/artifact/io.highlight/highlight-sdk/latest). And yes, he even wrote documentation, a getting-started guide, and unit tests! In fact, since we open-sourced ~3 months ago, we've had [10 open-source developers](https://github.com/highlight/highlight/graphs/contributors) independently ship features and bug-fixes.

Most open-source GitHub repositories want external contributors. But does open-sourcing your code-base guarantee developers will help you write code? We sure didn’t think so, but we took some meaningful steps to make it easy for interested folks to contribute:

- **We document everything publicly.** GitHub issues became the source of truth for everything we work on internally. We started using labels like `good-first-issue` to identify good starter tickets and made it a habit to write thorough ticket descriptions. External contributors need more context to get started.
   We even create product proposals ([we call these “RFC”s](https://github.com/highlight/highlight/tree/main/internal-docs/rfcs)) publicly to get engagement from the community, and we open public [GitHub discussions](https://github.com/highlight/highlight/discussions) to get feedback from our customers.

- **We obsess over the developer experience.** We've optimized our docker stack for the developer workflow, making sure the setup was smooth and key productivity-boosters like code hot-reloading and breakpoint debugging worked out of the box. Moreover, we’ve made self-hosting highlight a breeze by supporting different runtime environments with a [pre-build cross-platform docker image](https://www.highlight.io/docs/getting-started/self-host/self-hosted-hobby-guide). Plus open source contributors have a [dedicated channel](https://discord.com/channels/1026884757667188757/1067576228674011136) to ask about their setup and voice opinions regarding the DX.

- **We build a [supportive community](https://highlight.io/community).** Our discord has been a great way to engage with contributors and users of the product alike. It has given open-source developers a way to message our engineers with questions and quickly resolve blockers. It has also unlocked a new stream of feedback and suggestions from our customers allowing us to further improve the product.

In the end, our open-source community is part of our team. By focusing on external contributors as much as we do on our internal engineering team, we see ourselves building a powerful and diverse team that can autonomously improve highlight for all.
