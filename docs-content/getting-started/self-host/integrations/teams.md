---
title: Microsoft Teams integration - self-hosted setup
slug: teams
createdAt: 2022-02-22T00:00:00.000Z
updatedAt: 2022-02-22T00:00:00.000Z
---

## Steps

1. Create an App Registration [here](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade). Once your app is created, use the "Application (client) ID" as your `MICROSOFT_TEAMS_BOT_ID` environment variable.

1. In the "Authentication" section, add a Web platform. Set the Redirect URI as `<REACT_APP_FRONTEND_URI>/callback/microsoft_teams`, e.g. https://app.highlight.io/callback/microsoft_teams for highlight.io.

1. In the "Certificates & secrets" section, add a new client secret. Use its value as your `MICROSOFT_TEAMS_BOT_PASSWORD` environment variable.

1. In the "API permissions" section, add the following Microsoft Graph Application permissions to your app:
	1. Channel.ReadBasic.All
	1. Team.ReadBasic.All
	1. TeamsAppInstallation.ReadForTeam.All

1. Go to Bot Framework to create a [new bot](https://dev.botframework.com/bots/new). 

1. Set the messaging endpoint as `<REACT_APP_PRIVATE_GRAPH_URI>/microsoft-teams/bot`, e.g. https://pri.highlight.io/microsoft-teams/bot for highlight.io.

1. Enter your Microsoft App ID from step 1.

1. Download and unzip the example Teams app bundle [here](https://highlight-client-bundle.s3.us-east-2.amazonaws.com/assets/teams/highlight_example_app.zip). In `manifest.json`, replace all occurrences of `YOUR_APP_ID` with the Microsoft App ID from step 1. Create a new zip file from the 3 files.

1. In the Microsoft Teams app, under "Apps > Manage your apps", upload a custom app using the zip file from the previous step. Install this for each team you would like to recieve alerts in.

1. In your self-hosted Highlight instance, navigate to the Integrations page, e.g. https://app.highlight.io/integrations. Connect to Microsoft Teams and sign in using your Microsoft credentials.

1. At this point, the integration should be successfully installed. When configuring a new or existing alert, you can add one or more Microsoft Teams channels to notify.