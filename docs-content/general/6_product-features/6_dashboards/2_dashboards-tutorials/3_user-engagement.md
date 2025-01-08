---
toc: User Engagement
title: Creating User Engagement Metrics
slug: user-engagement
---

<EmbeddedVideo 
  src="https://www.youtube.com/embed/7BhzaEVqsS4"
  title="Metrics Tutorial: Measuring User Page Clicks"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Overview

This tutorial guides you through creating a graph to measure and analyze user engagement metrics. By following these steps, you'll be able to track user interactions with your application and gain insights into user behavior and trends.

## Step-by-step Guide

### 1. Select the Data Source

Begin by choosing the source of the metrics. For user engagement, we'll use user sessions as our data source. This will provide us with rich information about how users interact with our application.

### 2. Choose the Graph Type

Next, select the type of graph you want to use to visualize your data. For this example, we'll use a bar graph, which is excellent for comparing values across different categories.

### 3. Apply Filters

To focus on specific user interactions, apply filters to your data. In this case, we'll filter for sessions where the URL contains the word "session". This helps us concentrate on particular pages or features of interest.

### 4. Group the Data

Group the sessions by a relevant attribute. For this example, we'll group by the email (or identifier) that a user reports on that session. This allows us to analyze engagement on a per-user basis. Read more about reporting identifiers [in our docs](../../../../getting-started/3_client-sdk/7_replay-configuration/identifying-sessions.md).

### 5. Analyze the Results

The resulting graph will show a count of all the emails (representing users) across all filtered sessions. This visualization allows you to:

- Identify your most active users
- Spot trends in user engagement over time
- Understand which parts of your application are most frequently accessed

### 6. Refine Your Metrics

If you want to track unique users rather than total interactions, you can modify the graph to use a "count distinct" function instead of a simple count. This can be particularly useful for metrics like Daily Active Users (DAU).

### 7. Interpret and Act on the Data

Use the insights from your graph to understand the bigger picture of your application's usage:

- Identify your most engaged users and what characterizes their behavior
- Spot any decline in engagement and investigate potential causes
- Recognize successful features or content that drive higher engagement
- Plan targeted improvements or campaigns based on user engagement patterns

By consistently monitoring and analyzing these user engagement metrics, you'll be able to make data-driven decisions to improve your application's user experience and overall success. Remember to regularly review and adjust your metrics to ensure they continue to provide valuable insights as your application and user base evolve.