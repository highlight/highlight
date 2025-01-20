---
title: User Analytics
slug: user-analytics
createdAt: 2024-10-21T12:00:00.000Z
updatedAt: 2024-10-21T12:00:00.000Z
---

<EmbeddedVideo 
  src="https://www.youtube.com/embed/BFvEFV5DbHI?si=GXZ1FtLYCBBgJq3R"
  title="Metrics Tutorial: Using Session Events for User Analytics"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## Overview

This tutorial walks you through creating a graph to track unique users who clicked on header links. By following these steps, you'll gain insights into user
interactions with your application, helping you understand user behavior and trends.

## Step-by-step Guide

### 1. Select the Data Source

Start by selecting the source of your metrics. For tracking user engagements, we'll use user events as the data source. This provides detailed information
about how users interact with your application.

### 2. Choose the Graph Type

Next, select the type of graph you want to use to visualize your data. For this example, we'll use a bar graph, which is excellent for comparing values across
different categories.

### 3. Apply Filters

To focus on specific user events, apply filters to your data. In this case, we are looking to filter down to our custom event `header-link-*`, where the *
represents the suffix on the link clicked.

### 4. Apply a Function

Currently, we're retrieving the total number of events. To get the distinct number of users, update the function to CountDistinct using the identifier
attribute, which tracks each user’s unique identifier, such as an email or ID. Read more about reporting identifiers
[in our docs](../../../../getting-started/3_client-sdk/7_replay-configuration/identifying-sessions.md).

### 4. Group the Data

Group the events by a relevant attribute. For this example, we'll group by the event name. This allows us to analyze the filtered down events into the specific
event that occurred. 

### 5. Analyze the Results

The resulting graph will show a count of all the emails (representing users) across all filtered sessions. This visualization allows you to:

- Identify the most clicked event
- Spot trends in user engagement over time
- Understand which parts of your application are most frequently accessed

### 6. Refine Your Metrics

If you’d prefer to track unique sessions instead of unique users, simply modify the `CountDistinct` function to use secure_session_id instead of the user identifier.
To get more insights into searching events, read our [event search docs](../5_event-search.md).

### 7. Interpret and Act on the Data

Use the insights from your graph to understand the broader context of your application's usage:

- Identify which parts of the page are most used
- Spot any decline in engagement and investigate potential causes
- Recognize successful features or content that drive higher engagement
- Plan targeted improvements or campaigns based on user engagement patterns

By regularly monitoring and analyzing these metrics, you can make data-driven decisions to enhance your application's user experience and overall success. Be sure to
review and adjust your metrics periodically as your application and user base evolve.