---
title: An honest, open source, session replay benchmark
createdAt: 2023-10-17T12:00:00Z
readingTime: 13
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

Session Replay allows you to record and replay user sessions to understand how users interact, analyze performance regressions, and generally understand why users are falling off. However, in some cases, it can come at a cost to the performance of your web application. In this post, we'll discuss the overhead of session replay in several scenarios, and how it can affect your web app at large.

If you’re interested in trying out the experiment detailed below, you can find it [here](https://github.com/highlight/session-replay-performance-benchmark).

## The Setup

To test session replay against a realistic web application, we created two applications that go hand in hand: A simple [React application](https://github.com/highlight/session-replay-performance-benchmark/tree/main/replay-perf-app) and a [Node.JS application](https://github.com/highlight/session-replay-performance-benchmark/tree/main/replay-perf-puppet) which interacts with it.

The React application accepts URL parameters which determine the number of elements to render in a list, with an optional parameter to enable session replay.  For the purpose of these experiments, we used [rrweb](https://github.com/rrweb-io/rrweb), an open-source session replay library (adopted by companies such as Highlight, PostHog and Datadog), to simulate the session replay recording.

```
record({
  emit(event) {
    events.push(event);
   },
});
```

The second is a Node.js program that uses [Puppeteer](https://github.com/puppeteer/puppeteer) to control this react application and collect telemetry data. Through Node.js, we were able to access Chrome performance traces and collect the data with Puppeteer. Specifically, we collected heap usage, CPU usage, and the time taken for each incremental addition.

```
  const { timestamp, activeTime, heapUsed, duration} = processMetrics(
    await cdp.send("Performance.getMetrics")
  );
```

The experiment was performed on an EC2 instance running Ubuntu 22.04.03 LTS with a 4-core CPU and 15 GB of RAM, and we ran two trials:

250 HTML DOM inserts ( `divElement.appendChild` ) of N elements each. N was 100 and 500 for the respective trials.

From the experiment, we extracted three metrics: interaction duration, heap memory usage, and CPU usage.


* To measure interaction duration, we tracked time from insert beginning to end via the `window.performance.now()` API.
* To measure heap memory usage, we used puppeteer’s performance API which tracks the heap usage of the underlying chromium process. 
* To measure CPU usage, we compared active computation time vs. total time to have an estimate of JS loop execution. A large amount of time spent in active computation would mean that not much is available towards other important JS execution, which could result in frame drop and render stutter.

By measuring duration, we wanted to measure the Interaction to Next Paint (INP) time, which tests the responsiveness of an application. According to [Google Chrome Developers](https://web.dev/inp/), an INP of under 200 milliseconds demonstrates a reliably responsive page.

The heap and CPU usage metrics completely depends on the user's hardware. An increase in usage is not always a bad thing, but it helps to see how session replay will affect resource consumption.

## Results

### Test 1

In this test, there were 250 additions to a list, with an addition of 100 items each. On average, using session replay **added 0.017 seconds** to the time taken for each addition. Despite this, the INP remains much less than 200 ms, demonstrating that session replay maintains “snappiness” on a regular web application.

As more elements are added, the memory consumption difference with session replay increases. On average, there is a **6.89 MB increase** in memory usage when using session replay. Session replay tools often optimize the memory usage. For example, Highlight buffers a [short interval of events](https://github.com/highlight/highlight/blob/30a62edab25c909f265ac9be202797241b198874/sdk/client/src/index.tsx#L135C4-L135C4) in memory before sending them to a web worker. The web worker [offloads serialization and compression](https://github.com/highlight/highlight/blob/30a62edab25c909f265ac9be202797241b198874/sdk/client/src/index.tsx#L1355-L1370) of the payload to avoid blocking the main javascript thread with the compute-intensive operations.

For the CPU usage, we compared the active times for enabled/disabled session replay against the total time of the enabled session replay run. For a given time, we wanted to see how more the CPU is active for each run. In this test, enabling session replay yielded an average increase of **21% more usage** of the total time.

![time100](/images/blog/session-replay-perf/time100.svg)

![heap100](/images/blog/session-replay-perf/heap100.svg)

![cpu100](/images/blog/session-replay-perf/cpu100.svg)

### Test 2

In this test, there were 250 additions to a list, with an addition of 500 items each. On average, using session replay **added 0.07 seconds** to the time taken for each addition. Utilizing the 200 ms cutoff from before, we can see that enabling session replay maintains responsiveness until the 200th addition. More importantly, we can confirm that enabling session replay increases the duration of a task by a small constant amount. For this test, the addition is only 3.5% of the responsiveness window of 200 ms. 

On average, there is a **60.5 MB increase** in memory usage when using session replay, and for the CPU usage, enabling session replay yielded an average increase of **25.2% more usage** of the total time. Again, these numbers are not necessarily negative and they could have different effects on various hardware.

![time500](/images/blog/session-replay-perf/time500.svg)

![heap500](/images/blog/session-replay-perf/heap500.svg)

![cpu500](/images/blog/session-replay-perf/cpu500.svg)

## Conclusion

From the above data, while there is a difference in metrics when enabling session replay, we’ve noticed that there isn’t a very large hit to user experience, even on an extreme web app which renders hundreds of components at a time.

We have published this experiment [on Github](https://github.com/highlight/session-replay-performance-benchmark) and we encourage you to run it yourself and share benchmarks on your respective devices. 

And related to Session replay, as you continue to explore the benefits of session replay, we highly recommend checking out Highlight.io, an open-source session replay tool. [Highlight.io](https://highlight.io) offers a comprehensive solution to help you gain valuable insights into how your users interact with your application, enabling you to debug issues on your application, make data-driven enhancements and create a more user-centric environment.
