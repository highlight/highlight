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
- A [Node.js program](https://github.com/highlight/session-replay-performance-benchmark/tree/main/replay-perf-puppet) that uses Puppeteer to control the web app and collect data.

Our React app takes in URL search parameters, which enable/disable session replay and control the increment of items rendered at a time.

Through Node.js, we were able to access Chrome performance trace logs and monitor the performance data. Specifically, we collected heap usage, CPU usage, and the time taken for each incremental addition.

We ran 3 different tests:
- 250 additions of 100 items each
- 250 additions of 500 items each
- 250 additions of 1000 items each

## Results

### Test 1

In this test, there were 250 additions of 100 items each.

![100-time](/images/blog/session-replay-perf/100time.png)

On average, session replay added 0.018 seconds to the time taken for each addition. This difference will not be noticeable to the user.

![100-heap](/images/blog/session-replay-perf/100heap.png)


### Test 2

In this test, there were 250 additions of 500 items each.

![500-time](/images/blog/session-replay-perf/500time.png)

On average, session replay added 0.086 seconds to the time taken for each addition. 

![500-heap](/images/blog/session-replay-perf/500heap.png)

For the heap usage test, the difference between session replay on and off was ~61.7 MB, on average. 

### Test 3

In this test, there were 1000 additions of 500 items each. The later end of this test is unrealistic in the real world, but we wanted to see how session replay would affect a large number of additions.

## Conclusion

From the above data, we can see the impact of session replay on a general web app. While there is a difference in metrics when enabling session replay, there will not be a large hit to user experience. Also, this experiment simulates an extreme web app, which renders hundreds of thousands of items. In a real-world scenario, the difference in metrics will be even less noticeable.

As you continue to explore the benefits of session replay, we highly recommend checking out [Highlight.io](https://highlight.io), an open-source session replay tool. Highlight.io offers a comprehensive solution to help you gain valuable insights into how your users interact with your application, enabling you to make data-driven enhancements and create a more user-centric environment.
