---
title: The Overhead of Session Replay 
createdAt: 2023-09-20T12:00:00Z
readingTime: 8
authorFirstName: Abhishek
authorLastName: More
authorTitle: Software Engineer
authorTwitter: ''
authorLinkedIn: 'https://www.linkedin.com/in/abhishek-more-linked/'
authorGithub: 'https://github.com/Abhishek-More'
authorWebsite: 'https://abhishekmore.com'
authorPFP: 'https://tamuhack.org/static/th-2022/headshots/webp/abhishek.webp'
tags: Highlight Engineering
metaTitle: The Overhead of Session Replay 
---

Session Replay is a powerful tool for modern web applications. 
It allows you to record and replay user sessions to understand how users interact with your application. 
However, it comes at a cost. In this blog, we'll discuss the overhead of session replay and how it can affect your web app. 

[Check out the experiment we conducted!](https://github.com/highlight/session-replay-performance-benchmark)

## How we benchmarked session replay

To test session replay, we created two applications that go hand in hand:
- A [React application](https://github.com/highlight/session-replay-performance-benchmark/tree/main/replay-perf-app) that incrementally renders thousands of items in a list, mirroring an extreme real-world case.
- A [Node.js program](https://github.com/highlight/session-replay-performance-benchmark/tree/main/replay-perf-app) that uses Puppeteer to control the web app and collect data.

Our React app takes in URL search parameters, which enable/disable session replay and control the increment of items rendered at a time.

Through Node.js, we were able to access Chrome performance trace logs and monitor the performance data. Specifically, we collected heap usage, CPU usage, and the time taken for each incremental addition.

We ran 3 different tests:
1. 250 additions of 100 items each
2. 250 additions of 500 items each
3. 250 additions of 1000 items each

## Results

TODO: Graphs

We'll go over these results in three parts, each corresponding to a test.

### Test 1

Max Heap Usage:
- Recording Off: 31.2 MB
- Recording On: 43.9 MB

Average Heap Usage: 
- Recording Off: 12.6 MB
- Recording On: 20.9 MB


### Test 2

### Test 3






## Conclusion

From the above data, we can see the impact of session replay on a general web app. While there is a difference in stats when enabling session replay, there will not be a large hit to user experience. Also, this experiment simulates an extreme web app, which renders thousands of components at a time.

As you continue to explore the benefits of session replay, we highly recommend checking out Highlight.io, an open-source session replay tool. Highlight.io offers a comprehensive solution to help you gain valuable insights into how your users interact with your application, enabling you to make data-driven enhancements and create a more user-centric environment.
