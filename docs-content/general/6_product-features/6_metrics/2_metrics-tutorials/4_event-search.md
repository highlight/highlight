---
title: Event Search
slug: event-search
createdAt: 2024-10-21T12:00:00.000Z
updatedAt: 2024-10-21T12:00:00.000Z
---


<!-- <EmbeddedVideo 
  src="https://www.youtube.com/embed/7BhzaEVqsS4"
  title="Metrics Tutorial: Measuring User Page Clicks"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/> -->

## Overview

This tutorial guides you through creating a graph to find the unique users that clicked on the header links. By following these steps,
you'll be able to track user interactions with your application and gain insights into user behavior and trends.

## Step-by-step Guide

### 1. Select the Data Source

Begin by choosing the source of the metrics. For user engagements, we'll use user events as our data source. This will provide us with rich information about how users interact with our application.

### 2. Choose the Graph Type

Next, select the type of graph you want to use to visualize your data. For this example, we'll use a bar graph, which is excellent for comparing values across different categories.

### 3. Apply Filters

To focus on specific user events, apply filters to your data. In this case, we are looking to filter down to our custom event `header-link-*`, where the * represents the suffix on the link clicked.

### 4. Apply a Function

Currently, we are getting the total number of events. Since we want the disctinct number of user, we should update the function to be `CountDistinct` by `identifier`, our attribute that tracks the user's
unqiue identifier, such as email or id. Read more about reporting identifiers [in our docs](../../../../getting-started/3_client-sdk/7_replay-configuration/identifying-sessions.md).

### 4. Group the Data

Group the events by a relevant attribute. For this example, we'll group by the event name. This allows us to analyze the filtered down events into the specific event that occurred. 

### 5. Analyze the Results

The resulting graph will show a count of all the emails (representing users) across all filtered sessions. This visualization allows you to:

- Identify the most clicked event
- Spot trends in user engagement over time
- Understand which parts of your application are most frequently accessed

### 6. Refine Your Metrics

If you want to track unique sessions rather than unqiue users, you can modify the `CountDistinct` function to use `secure_session_id`.

### 7. Interpret and Act on the Data

Use the insights from your graph to understand the bigger picture of your application's usage:

- Identify which parts of the page are most used
- Spot any decline in engagement and investigate potential causes
- Recognize successful features or content that drive higher engagement
- Plan targeted improvements or campaigns based on user engagement patterns

By consistently monitoring and analyzing these user engagement metrics, you'll be able to make data-driven decisions to improve your application's user experience and overall success. Remember to regularly review and adjust your metrics to ensure they continue to provide valuable insights as your application and user base evolve.