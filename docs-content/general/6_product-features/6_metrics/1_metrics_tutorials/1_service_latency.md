---
toc: Service Latency
title: How-to: Service Latency
slug: service-latency
---

<EmbeddedVideo 
  src="https://youtu.be/Hb24x1_wDXQ"
  title="Metrics Tutorial: Service Latency on Traces"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Overview

This tutorial guides you through measuring and analyzing service latency to optimize your application's performance. By following this guide, you'll be able to effectively monitor and improve your service response times, leading to a better user experience and more efficient resource utilization.

## Step-by-step Guide

### 1. Access the Metrics Dashboard

Begin your journey by logging into your hig_hlight.io account and navigating to the Metrics section. This is your central hub for creating and managing all performance metrics. Familiarize yourse_lf with the layout and available options to make the most of the tools at your disposal.

### 2. Create a New Service Latency Graph

Once in the Metrics section, locate and click the "Add Graph" button. In the metric type selection, choose "Service Latency". This action lays the foundation for monitoring your service's response times. Take a moment to consider which services are most critical to your application's performance.

### 3. Configure Your Graph

After creating the graph, it's time to tailor it to your specific needs. Select the service or services you want to monitor, prioritizing those that are most critical or suspected of having performance issues. Set an appropriate time range for your analysis, considering both recent issues and long-term trends.

### 4. Analyze the Latency Data

With your graph set up, dive into the data analysis. Look for patterns or anomalies in the latency. Are there specific times when latency spikes? Do certain services consistently underperform? Utilize the available filters to drill down into specific issues, such as environment (production vs. staging) or specific API endpoints.

### 5. Set Up Performance Alerts

To stay proactive, establish alerts for unacceptable latency thresholds. For instance, you might want to be notified if any service's latency exceeds 500ms for more than 5 minutes. Ensure your notification settings are configured to inform the right team members when these thresholds are breached.

### 6. Optimize Application Performance

Armed with insights from your analysis, it's time to optimize your application's performance. Identify and prioritize bottlenecks in your services. This might involve optimizing database queries, implementing caching strategies, or refactoring inefficient code. Make incremental improvements and use your latency graphs to verify the impact of each change.

By consistently following this process - monitoring, analyzing, alerting, and optimizing - you'll be able to maintain and improve your service latency over time. This proactive approach to performance management will result in a more responsive application and increased user satisfaction.