---
title: Microsoft Teams self-hosted
slug: teams
createdAt: 2022-02-22T00:00:00.000Z
updatedAt: 2022-02-22T00:00:00.000Z
---

## Overview

If you want to use the Microsoft Teams integration in your self-hosted highlight.io instance, you can create a custom Teams app and use its client id and secret as your `MICROSOFT_TEAMS_BOT_ID` and `MICROSOFT_TEAMS_BOT_PASSWORD` environment variables.

## Azure App Registration setup

1. Create an Azure App Registration [here](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade). Once your app is created, use the "Application (client) ID" as your `MICROSOFT_TEAMS_BOT_ID` environment variable.

2. In the "Authentication" section, add a Web platform. Set the Redirect URI as `<REACT_APP_FRONTEND_URI>/callback/microsoft_teams`, e.g. https://app.highlight.io/callback/microsoft_teams for highlight.io.

3. In the "Certificates & secrets" section, add a new client secret. Use its value as your `MICROSOFT_TEAMS_BOT_PASSWORD` environment variable.

4. In the "API permissions" section, add the following Microsoft Graph Application permissions to your app:
	1. Channel.ReadBasic.All
	2. Team.ReadBasic.All
	3. TeamsAppInstallation.ReadForTeam.All

## Bot Framework setup

1. Go to Bot Framework to create a [new bot](https://dev.botframework.com/bots/new). 

2. Set the messaging endpoint as `<REACT_APP_PRIVATE_GRAPH_URI>/microsoft-teams/bot`, e.g. https://pri.highlight.io/microsoft-teams/bot for highlight.io.

3. Enter your Microsoft App ID from step 1.

## Microsoft Teams app setup

1. Download and unzip the example Teams app bundle [here](https://highlight-client-bundle.s3.us-east-2.amazonaws.com/assets/teams/highlight_example_app.zip). In `manifest.json`, replace all occurrences of `YOUR_APP_ID` with the Microsoft App ID from step 1. Create a new zip file from the 3 files.

2. In the Microsoft Teams app, under "Apps > Manage your apps", upload a custom app using the zip file from the previous step. Install this for each team you would like to recieve alerts in.

## highlight.io integration setup

1. In your self-hosted highlight.io instance, navigate to the Integrations page, e.g. https://app.highlight.io/integrations. Connect to Microsoft Teams and sign in using your Microsoft credentials.

2. At this point, the integration should be successfully installed. When configuring a new or existing alert, you can add one or more Microsoft Teams channels to notify.