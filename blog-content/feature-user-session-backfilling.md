---
title: 'New Feature: Session Backfilling'
createdAt: 2022-08-16T12:00:00.000Z
readingTime: 6
authorFirstName: Haroon
authorLastName: Choudery
authorTitle: Growth Manager
authorTwitter: 'https://twitter.com/haroonchoudery'
authorLinkedIn: 'https://linkedin.com/in/haroonchoudery'
authorGithub: ''
authorWebsite: ''
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FfKKhW39R0SE2hTIalLzG&w=1920&q=75
image: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2Fu0i9m0AvTeK7fnloh2WS&w=1920&q=75
tags: Engineering
metaTitle: 'New Feature: Session Backfilling'
---

We’re excited to announce the release of **Session Backfilling** in Highlight! Starting today, all sessions from the same browser for anonymous users will be aggregated into a single user. For users who are later identified, anonymous sessions from the same browser will be automatically attributed to them after identification.

## Before “users” become “Users”

Before someone signs up for your app, they might be exploring it. During this stage, you don’t know who that person is (and you might not care much), but once they become a user, understanding their behaviors leading up to signup can be extremely valuable.

Previously, in Highlight, all sessions for users who weren’t logged in were anonymous, but over the past few weeks, we heard from some of you that it would be useful to see a user’s entire onboarding journey.

![text-shot.png](https://media.graphassets.com/33uHSopJQDyTcFI45YwY "text-shot.png")

## Introducing _Session Backfilling_

With _Session Backfilling_, you can now see all sessions from the same browser for a particular user, including sessions where they weren’t logged in. For users that are never identified, we now aggregate all of their sessions into a single anonymous user ID.

![user-session-backfilling.gif](https://media.graphassets.com/iTdNLTQTyiLislw9qTy6 "user-session-backfilling.gif")

The improved tracking of users sessions for non-identified users unlocks the ability for Highlight users to answer useful questions such as:

-   What does the entire user journey look like, from awareness to consideration to activation and beyond?
-   How are users exploring the app while offline?
-   How are pages that don’t require authentication being used by our customers?
-   What have our new users done on the marketing site before creating their account?
-   And more!

## **How**_Session Backfilling_**works**

As of last week, all apps using Highlight will assign an anonymized token to each user and store it in their browser. Once a user is identified, all sessions associated with their specific token will be attributed to that user.

_Learn more about Session Backfilling in our [_docs page_](https://docs.highlight.run/identifying-users#BXEtr "https://docs.highlight.run/identifying-users#BXEtr")_
