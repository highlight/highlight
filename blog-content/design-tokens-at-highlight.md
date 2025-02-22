---
title: Managing our design tokens at Highlight
createdAt: 2023-04-17T12:00:00.000Z
readingTime: 9
authorFirstName: Julian
authorLastName: Schneider
authorTitle: Design Lead
authorTwitter: ''
authorLinkedIn: 'https://www.linkedin.com/in/schneider-ui/'
authorGithub: 'https://github.com/julian-highlight'
authorWebsite: ''
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2Fsx9TpHXnQZGOgFBSooIy&w=3840&q=75
tags: Product Updates
metaTitle: Managing our design tokens at Highlight
---

At Highlight, we understand the importance of creating a visually appealing and consistent color system for our app. We know that our design is crucial for attracting and retaining users. That's why we use design tokens to create a well-defined and easily manageable color system for our app.

![pic1.png](https://media.graphassets.com/P30bNXYlRQWOl0ic1WSf "pic1.png")

Design tokens allow us to abstract our design elements into reusable and shareable pieces of code. By using design tokens, we've created a library of colors that can be shared across our team and used consistently throughout our app.

In this blog post, we'll take a closer look at how we at Highlight use design tokens to create a consistent and effective color system for our app. We'll explore the benefits of using design tokens, streamline our design process, and maintain consistency across our platform while keeping design & code in sync. We'll also provide practical tips for implementing design tokens in your app design based on our own experience.

## The standard way to use colors in design systems

The common way to use color systems in companies is to establish a set of color guidelines that reflect the company's branding and design standards. This typically involves creating a color palette with a specific number of colors that can be used consistently across all company materials, such as websites, marketing materials, product interfaces, and other design assets.

The color guidelines may include specific color values (e.g. RGB, HEX, or HSL), as well as guidance on when and how to use each color in various contexts. For example, a company may define which colors are appropriate for primary branding elements versus secondary design elements, or which colors should be used for different types of buttons, links, or call-to-action elements.

Design tools and software are used to manage and enforce the color system. This can include creating a library of design tokens or style guides that designers and developers can use, or using automation tools to enforce color standards across different projects and platforms.

![dt-pic3.png](https://media.graphassets.com/JIkSP5SxT9qL2p5nfSNa "dt-pic3.png")

## What are Design Tokens and what are their benefits

Design tokens are an essential tool for building scalable and consistent design systems. They are a simple and intuitive way to encapsulate design decisions and store them in a reusable and sharable format.

Here are some reasons why design tokens are great:

\- **Consistency**: Design tokens promote consistency by providing a single source of truth for design decisions. They ensure that design elements such as colors, typography, spacing, and other design attributes are consistent throughout the design system.

\- **Efficiency**: Design tokens save time and effort by allowing designers and developers to easily reuse design decisions across multiple projects and platforms. They eliminate the need for manual updates and reduce the risk of errors.

\- **Collaboration**: Design tokens enable collaboration by providing a common language between designers and developers. They allow both teams to work together more efficiently and reduce the risk of misinterpretation or miscommunication.

\- **Flexibility**: Design tokens provide flexibility by allowing designers to make changes to design decisions without affecting the underlying code. This means that changes can be made quickly and easily, without the need for extensive re-coding.

\- **Scalability**: Design tokens allow design systems to scale by providing a framework for managing design decisions across multiple platforms and projects. This means that design decisions can be easily updated and shared, ensuring that the design system remains consistent and up-to-date over time.

Overall, design tokens are a powerful tool for building scalable and consistent design systems that promote efficiency, collaboration, flexibility, and scalability.

## How Highlight implements Design Tokens

When we set out to create our color set for design tokens at Highlight, we began by creating a foundational color scale. This involved selecting a range of neutrals, primary colors, and other colors that aligned with our brand identity. We used this foundational color scale as the basis for all of our design tokens related to color.

After establishing our foundational color scale, we created a "Light Theme" to provide guidelines for using our lightest colors in different interface elements. This theme is focused on creating our default interface and includes guidelines for using our colors for text, backgrounds, and other elements inside the "Light Theme". We also plan to create a "Dark Theme" to provide guidelines for creating a darker interface in the future.

Using Tokens Studio we are able to create references to colors from our primitives library. This enables us to create color tokens, that stay true to their reference color. In the same time Tokens Studio helps us to sync all tokens with both Figma and our Codebase. Tokens Studio keeps our color system in sync, with no further development effort.

![dt-pic4.png](https://media.graphassets.com/asarNFjFSG371lDMkMww "dt-pic4.png")

###
Using Design Tokens as Code

Having well-maintained design tokens in Figma is super helpful for iterating on our mocks quickly, but we wanted to make sure our engineering team was able to leverage same tokens in the codebase. We looked for a way to keep our tokens in sync between our mocks and code, and landed on using [Tokens Studio](https://tokens.studio/ "https://tokens.studio/") for managing tokens and exporting them from Figma in a way we can import them into our component library.

Tokens Studio gives us the ability to sync our tokens to a few different sources, like a GitHub repo, or JSONBin, as well as downloading them as JSON. Once the engineering team gets the JSON, they can work with it to generate a theme on their end. We use [vanilla-extract](https://vanilla-extract.style/ "https://vanilla-extract.style/"), so we wrote [a script](https://github.com/highlight/highlight/blob/main/packages/ui/scripts/generate-tokens.ts "https://github.com/highlight/highlight/blob/main/packages/ui/scripts/generate-tokens.ts") that does some light transformations on the exported tokens and creates a vanilla-extract theme that we can import directly into our styles and [sprinkles](https://vanilla-extract.style/documentation/packages/sprinkles/#sprinkles "https://vanilla-extract.style/documentation/packages/sprinkles/#sprinkles").

Now we can update our tokens, re-export them and run our script again to have our changes reflected in the app. Since we are using TypeScript, we can also ensure that we don’t accidentally change the shape of our theme object and break references to it in our code.

This synchronization process has helped our design and engineering teams stay in sync in a big way. Being diligent about leveraging tokens and components in Figma and making sure our code accurately reflects the values in Figma has minimized the back and forth between during implementation because we are all speaking the same language.

## Conclusion

We believe that design tokens are a powerful tool for creating scalable and consistent design systems, and helping teams iterate quickly. By abstracting design elements into reusable and sharable values, we can create a library of properties that can be shared across a team and used consistently throughout an app.

We’d love to hear how others are using design tokens to build design systems and component libraries. Please drop us a line on [Discord](https://discord.gg/yxaXEAqgwN "https://discord.gg/yxaXEAqgwN") or [Twitter](https://twitter.com/highlightio "https://twitter.com/highlightio") to share what’s worked for you and your team!
