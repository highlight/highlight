---
title: "What are rage clicks and how to detect them"
createdAt: 2022-10-18T12:00:00Z
readingTime: 10
authorFirstName: Denedo Oghenetega
authorLastName: Joseph
authorTitle: Software Engineer
authorTwitter: 'https://twitter.com/tega_dev'
authorLinkedIn: ''
authorGithub: ''
authorWebsite: ''
authorPFP: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FFwP9r08MSGpeC10aOu9k&w=3840&q=75'
image: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FurHEOO0ZTJavuh4KJDGA&w=3840&q=75'
tags: 'Frontend, Observability, Product Updates'
metaTitle: "What are rage clicks and how to detect them"
---

Picture this: You're onboarding a product and just filled in a lengthy form with your personal information. But when it's time to click on the submit button, it doesn't work.

What do you do?

You guessed it – you click on the submit button again... and again... and again.

This is what we call a rage click.

Rage clicks are those frantic, repeated clicks on a button or link that doesn't seem to be working. They usually happen when users are trying to complete a task but something is preventing them.

They lead to users' distrust of your product and, consequently, customer churn because that piece of content or link doesn't perform as expected. But for developers, they can help identify opportunities for improvement. The best way to uncover user friction and retain your customers is to catch issues like these early on and resolve them quickly.

## What Are Rage Clicks, and What Do They Tell You?

[Rage clicks](https://docs.highlight.run/rage-clicks "https://docs.highlight.run/rage-clicks") are the recurring clicks on a web element that doesn't yield any result. They usually occur when a user is trying to complete a task but is repeatedly thwarted by poor design or buggy code. The frustration builds until they're simply clicking on anything and everything in the hopes that something will finally work. Of course, this rarely leads to anything productive, and only serves to further frustrate the user.

<iframe width="480" height="480" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="https://giphy.com/embed/Hr2rEQlFrDpCFu9Qt0" src="https://giphy.com/embed/Hr2rEQlFrDpCFu9Qt0"></iframe>

As a developer, paying attention to which parts of your application are prone to rage clicks is vital. Rage clicks can be a valuable indicator of where users are getting stuck and where your product needs some improvement. By understanding where and why users are rage clicking, you can help improve the overall usability of your product.

Rage clicks also help you understand your customers' behavior because you can deduce where your customer is coming from and where they go after rage clicking. In addition, they show which areas of your product users struggle with the most, which are often parts they don't understand.

While rage clicks don't alert you of every problem, your product and engineering teams can correct and [resolve many bugs](https://www.highlight.io/blog/the-debugging-process-and-techniques-for-web-applications-part-1-2 "https://www.highlight.io/blog/the-debugging-process-and-techniques-for-web-applications-part-1-2") caused by rage click behavior. So the next time you see a customer rage clicking, take a step back to understand why it's happening. It could be a valuable opportunity to improve your product.

## How to Identify Rage Clicks

Rage clicks often result from unresponsive buttons and dead links, content that looks clickable but isn't, network request errors, or slow page loads. While not all clicks on your website are rage clicks, it's crucial to identify which ones are and to start fixing them.

### Session Replay

Session replay is a tool that allows you to track user interactions on your website or app. This means that you can see exactly what a user did on your site, step by step. This is incredibly useful for figuring out what causes errors or rage clicks. With session replay, you can see exactly what version of your app the user was on when they encountered the problem, and you can see which clicks led to the error.

With [Highlight](https://www.highlight.io/ "https://www.highlight.io/"), you can see every click, scroll, keystroke, and tap across your app, allowing you to pinpoint rage clicks and other UX issues. Additionally, [Highlight's session versioning](https://docs.highlight.run/versioning-sessions "https://docs.highlight.run/versioning-sessions") lets you see what version of your app the user was on when they encountered the issue. This way, you can quickly fix the problem and prevent it from happening again.

[Sorry, your browser doesn't support embedded videos.](https://media.graphassets.com/eMqdQm0bSW2YNfDFlCJK)

### Alerts from Product Analytics or Monitoring Tools

When you're trying to figure out what's causing a problem with your product, the last thing you want to do is waste time sifting through data yourself. That's where product analytics tools come in handy. By automatically detecting and alerting you to anomalies like rage clicks, they help you zero in on the source of the problem quickly and efficiently.

Automate the process by relying on alerts from tools like [Mixpanel](https://mixpanel.com/ "https://mixpanel.com/"), [Amplitude](https://www.amplitude.com/ "https://www.amplitude.com/"), or Highlight. Make data-driven decisions on autopilot with Highlight by getting alerts whenever a user clicks five or more times within a radius of eight pixels for two seconds or longer.

With the right tool in place, you'll be able to debug issues more quickly and efficiently, freeing up time to work on other aspects of your product.

### Heatmaps

Heatmaps are color-coded and map-like visualizations of what areas users interact with the most and the least. Some of them look at where the cursor is, while others only consider clicks. But generally, heatmap tools, like [Hotjar](https://www.hotjar.com/ "https://www.hotjar.com/") and [Mouseflow](https://mouseflow.com/ "https://mouseflow.com/"), provide insights into users' movements and clicking patterns by designating certain regions as "hot."

The more users click on a specific area, the "hotter" that area will be. So, a sudden spike in an area that users interact with repeatedly can also help you identify rage clicks.

### Repeated Errors

Modern businesses often use monitoring tools to monitor their frontend apps and manage any errors that come up. When these tools detect the same errors repeatedly within a short period, they can signify rage clicks.

<BlogCallToAction />

One of the best ways to do this is to use a monitoring tool like Highlight. Highlight gives you visibility into your frontend apps so that you can easily see which errors are being caused by rage clicks. With this information, you can make changes to improve the user experience and prevent future rage clicks from happening.

### Customer Feedback

Another way to identify rage clicks is through customer feedback. Customers often raise issues whenever they reach a roadblock in your app. And if you're getting multiple complaints

However, we don't recommend waiting for customer feedback before identifying any issues. Use predictive analytics tools, such as [Alteryx](https://www.alteryx.com/ "https://www.alteryx.com/") or [SAP Analytics Cloud](https://www.sap.com/products/technology-platform/cloud-analytics.html "https://www.sap.com/products/technology-platform/cloud-analytics.html"), to forecast which web elements are prone to rage clicks.

## How to Reduce Rage Clicks in Your App

As any software developer knows, no matter how much testing you do, there's always the potential for bugs and errors in your code. And when those bugs and errors crop up, they can often lead to angry users who click around impatiently in an effort to fix the problem.

While it's impossible to completely eliminate all bugs and errors from your app, there are things you can do to reduce their occurrence. You can:

-   Conduct regular user testing and take note of areas where users tend to get frustrated.
-   Improve your error-handling code so that users are given a more seamless experience in the event of a bug or error. For instance, when your page is unresponsive, you can show a message instead and navigate users to another page for assistance. With [Highlight's error handling](https://docs.highlight.run/reactjs-integration "https://docs.highlight.run/reactjs-integration") for the React.js integration, you can quickly and easily recover from app crashes or bad states, thereby improving your user experience.
-   Use messaging to inform users of what's going on if something takes longer than usual to load. For example, you can use a "loading" spinner.
-   Enhance your user interface design so that the web content fulfills its purpose without confusing the customer. For instance, you could avoid setting the color of regular text to blue in your code if it's not a link.
-   Pay attention to your app's overall speed and performance. The faster it is, the less likely users are to experience frustration.

When rage clicks occur, you can assign tasks according to their priority. For example, an unresponsive checkout button would be of higher importance than a broken link. So you essentially have to work top-down and tackle the crucial ones first.

## Uncover Rage Clicks Faster with Highlight

Rage clicks may seem like a minor issue, but they can actually be indicative of bigger problems in your app. The faster you identify them, the more users you retain. You can help create a better user experience for everyone by taking steps to reduce them.

Highlight helps you [monitor the health of your application](https://www.highlight.io/blog/5-strategies-monitor-health "https://www.highlight.io/blog/5-strategies-monitor-health") and look for bugs in your code that could lead to customer dissatisfaction. Then you can examine and analyze user activity on your website and, subsequently, make improvements to your product.

By using Highlight, you're doing something proactive to improve the overall quality of your application — not just eliminating rage clicks but also making sure that potential customers have a good first impression (and continue using) your product.
