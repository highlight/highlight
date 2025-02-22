---
title: Supercharge Your Development Workflow with Code Generators
createdAt: 2023-10-16T14:00:00.000Z
readingTime: 4
authorFirstName: Chris
authorLastName: Schmitz
authorTitle: Software Engineer @ Highlight
authorTwitter: 'https://twitter.com/ccschmitz'
authorLinkedIn: 'https://www.linkedin.com/in/ccschmitz'
authorGithub: 'https://github.com/ccschmitz'
authorPFP: >-
  https://lh3.googleusercontent.com/a/AAcHTtfrxn85G2VSnWbmri-9snJCI7Roa1tJ0UOR6k2F=s96-c
authorWebsite: ''
tags: Engineering
metaTitle: Supercharge Your Development Workflow with Code Generators
---

Chances are you started your project with code generation. You probably ran a CLI tool to generate your project scaffolding, but how did you create the rest of the files? If you created them by hand and didn’t leverage generators to continue evolving your app I think you have an opportunity to *supercharge* your workflow.

There are several benefits to using code generation, some more obvious than others:

- **Time-saver**: Codegen tools help eliminate the need for repetitive boilerplate code, freeing up your team's time to focus on building unique features.
- **Standardization**: By using PRs to make changes to templates, codegen tools allow you to codify standards and best practices, ensuring everyone is on the same page.
- **Consistency**: Codegen promotes uniformity across the codebase, which makes it easier to understand, maintain, and collaborate on your project.
- **Efficient onboarding**: With codegen tools, new engineers can quickly adapt to your team's coding standards and practices, as they won't have to re-learn all the small decisions made in building things like React components or data loading hooks.
- **Historical record**: Codegen serves as a valuable record of your team's decisions to evolve coding standards and best practices over time, allowing you to trace the development process and make informed decisions in the future.

## Unleashing the Power of Codegen In Your Codebase

Code generation has applications across your entire codebase. Here's a look at the variety of things you can generate with the right tools:

### Backend Boilerplate

We are using [gqlgen](https://gqlgen.com/) to generate boilerplate code for our API. It analyzes our GraphQL schema and takes care of type safety, schema generation, and more, allowing us to focus on the business logic. Tools like gqlgen help streamline your backend development process, ensuring that your server code is consistent and robust.

### Data-Fetching Hooks

[@graphql-codegen](https://the-guild.dev/graphql/codegen) is another fantastic tool that generates hooks for fetching data from your API. It works seamlessly with GraphQL, automatically generating typed query and mutation hooks that you can use in your components. All you need to do is write the GraphQL query and let @graphql-codegen build the types and hooks. Since it also analyzes our GraphQL schema, we can ensure that our client and server don’t get out of sync. This has been another huge time-saver streamlining our workflow and minimizing errors.

### React Components, Support Files, and More

Codegen can also be used to generate React components and all the supporting files you need, like tests, styles, and documentation. Tools like [Hygen](https://www.hygen.io/) and [Plop](https://plopjs.com/) can help you automate from the command line, or check out extensions like [React Component Generator](https://marketplace.visualstudio.com/items?itemName=AndrewMcGoveran.react-component-generator) for something integrated with your IDE. If you’re using monorepo tooling like [Nx](https://nx.dev) you can also leverage [their APIs for codegen](https://nx.dev/plugin-features/use-code-generators).

Having generators for common things you need to create obviously saves you from writing boilerplate, but an equally important win is that it reduces the context switching that happens when you go from implementing real app logic to creating the boilerplate necessary for a new component/hook/stylesheet/whatever.

### The Sky's the Limit

The truth is, code generation can be applied to almost anything in your codebase. The only real limitation is your imagination. With the right tools and templates, you can automate the creation of code for various aspects of your project, from frontend components and backend services to configuration files and documentation.

## What About AI?

AI provides its own superpowers to improve your dev team's efficiency, but the suggestions you get from AI tools like [GitHub Copilot](https://github.com/features/copilot) aren't guaranteed to match your team's best practices. They can (and should!) be used to find opportunities to improve your code and save programmers from tedious work, but they don't provide the speed and consistency of the aforementioned tools.

Expect more from the Highlight team on how we leverage our AI pair programming partners to make our team more efficient in the future!

## Summary

Code generators can supercharge your development workflow by saving time, standardizing and promoting consistency, facilitating efficient onboarding, and serving as a historical record. They can be used to generate backend boilerplate, data-fetching hooks, React components, support files, and more. The possibilities are endless, and incorporating code generation into your workflow can streamline your development process, enhance code quality, and make your team much more efficient.

We’d love to hear stories of how others are leveraging codegen to improve their team’s workflows. Please hit us up on [X](https://twitter.com/highlightio) or [Discord](https://discord.com/invite/yxaXEAqgwN) to share your use case. Finally, if you’re interested in seeing more examples of how Highlight is leveraging codegen, [check out our codebase](https://github.com/highlight), it’s open source!
