---
toc: Web Vitals & Page Speed
title: Creating Web Vitals & Page Speed Metrics
slug: web-vitals-page-speed
---

<EmbeddedVideo 
  src="https://www.youtube.com/embed/GMMdBR_61qw"
  title="Metrics Tutorial: Measuring Page Speed & Web Vitals"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Overview

This tutorial guides you through creating a graph to measure and analyze page speed over time. By following these steps, you'll be able to track your application's performance and gain insights into web vitals and other important metrics. 

For more information, read more about [how Highlight's OpenTelemetry instrumentation captures this data](../../../../getting-started/3_client-sdk/7_replay-configuration/opentelemetry.md) and [how this is can relate to your backend instrumentation](../../../../getting-started/2_frontend-backend-mapping.md).

## Step-by-step Guide

### 1. Install Highlight Instrumentation

Begin by installing the Highlight instrumentation on your client-side application. This will automatically start capturing OpenTelemetry data, providing you with valuable insights into your application's performance.

### 2. Access the Metrics Dashboard

Navigate to the metrics dashboard in the Highlight UI. This is where you'll create and manage your performance metrics.

### 3. Create a New Metric

In the dashboard, create a new metric. Select "Traces" as the metric type, as this will allow us to measure page load times and other performance indicators.

### 4. Choose a Graph Type

Select a graph type to visualize your data. For this example, we'll use a line chart, which is excellent for showing trends over time.

### 5. Set the Measurement Function

Choose the P90 (90th percentile) function and apply it to the duration attribute. This will give you a good representation of your page load times, excluding outliers.

### 6. Apply Filters

Filter for all spans with the name "documentLoad". This will focus your graph on page load traces, giving you a clear picture of your application's loading performance.

### 7. Analyze the Results

The resulting graph will show the 90th percentile of page load times over time. This visualization allows you to:

- Track changes in page load performance
- Identify trends or patterns in load times
- Spot sudden spikes or gradual increases in load duration

### 8. Explore Additional Metrics

While this example focuses on page load times, you can create similar graphs for other important metrics such as:

- Web Vitals (LCP, FID, CLS)
- DNS timings
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)

Refer to the linked documentation for more information on these additional metrics and how to graph them.

By consistently monitoring and analyzing these performance metrics, you'll be able to maintain and improve your application's overall speed and user experience. This data-driven approach will help you identify areas for optimization and measure the impact of your improvements over time.