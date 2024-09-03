---
toc: Service Latency
title: Creating Service Latency Metrics
slug: service-latency
---

<EmbeddedVideo 
  src="https://www.youtube.com/embed/Hb24x1_wDXQ"
  title="Metrics Tutorial: Service Latency on Traces"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Overview

This tutorial guides you through creating a graph to measure and analyze service latency across all your services. By following this guide, you'll be able to effectively monitor and compare the performance of different services, helping you identify areas for optimization.

## Step-by-step Guide

### 1. Select the Data Source

Begin by choosing the source of data for your graph. In highlight.io, you can select from logs, traces, sessions, or errors. For measuring service latency, we'll use traces as our data source.

### 2. Choose the Graph Type

Next, configure how you want the graph to look. For this latency visualization, we'll use line graphs, which are excellent for showing trends over time.

### 3. Set the Measurement Function

By default, the graph will show a count of traces. However, for latency measurement, we want to calculate the average duration of each trace. Select the "Average" function and choose "duration" as the metric to average.

### 4. Group by Service Name

To compare latency across different services, we'll group the data by service name. Check the "Group by" option and select "service_name" from the dropdown menu.

### 5. Analyze the Results

The resulting graph will show the average latency of all traces, grouped by service name. This visualization allows you to:

- Compare the performance of different services side by side
- Identify services with consistently high latency
- Spot sudden spikes or gradual increases in latency for specific services
- Prioritize which services need optimization based on their latency trends

### 6. Take Action

Based on the insights from your latency graph:

- Investigate services with unexpectedly high latency
- Look for patterns, such as services that slow down during peak hours
- Set up alerts for when latency exceeds acceptable thresholds
- Plan and implement optimizations for the services that would benefit most from improved performance

By consistently monitoring and analyzing this service latency graph, you'll be able to maintain and improve your application's overall performance, leading to a better user experience and more efficient resource utilization.