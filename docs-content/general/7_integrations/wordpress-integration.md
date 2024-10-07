---
title: WordPress Plugin
slug: wordpress-plugin
createdAt: 2024-10-01T12:00:00.000Z
updatedAt: 2024-10-01T12:00:00.000Z
---

# Highlight.io WordPress Plugin - Session Replay, Logging, and Error Monitoring for WordPress

The Highlight WordPress Plugin allows you to easily integrate Highlight's powerful session recording and monitoring capabilities into your WordPress site. With this plugin, you can gain valuable insights into user behavior, troubleshoot issues, and improve your website's performance.

## Features

- **Easy Setup**: Install and configure the plugin in just a few clicks.
- **Session Recording**: Capture user interactions on your WordPress site.
- **Error Monitoring**: Automatically detect and log errors with all the information you need to troubleshoot.
- **Network Recording**: Record network requests for deeper insights.
- **Console Log Recording**: Capture and review console logs to help identify and fix issues quickly.

## Installation

1. Log in to your WordPress admin panel.
2. Go to "Plugins" > "Add New".
3. In the search box, type "Highlight.io".
4. Look for "Highlight.io Session Recording" in the search results and click "Install Now".
5. After installation, click "Activate" to enable the plugin.
6. Go to the Highlight.io settings page to configure the plugin.

## Configuration

Navigate to "Settings" > "Highlight.io" in your WordPress admin panel. The only required configuration option is your Highlight project ID. You can find this in [your project's settings](https://app.highlight.io/setup).

### Advanced Configuration

The plugin offers several advanced configuration options:

- **Custom Service Name**: Useful for identifying different environments or sites.
- **Tracing Origins**: Control which domains are traced, helpful for complex setups with multiple subdomains or external services.
- **Network Recording**: When enabled, captures network requests, which can be valuable for debugging API calls or third-party integrations.

Learn more about these configuration settings by reviewing the [`H.init` documentation](../../sdk/client.md#Hinit).

## Usage

Once configured, the plugin will automatically add the Highlight script to your WordPress site's frontend. This script will initiate Highlight with your specified settings, allowing you to capture session data and monitor your site's performance.

## Best Practices

1. Always test the plugin on a staging environment before deploying to production.
2. Regularly review your tracing origins and network recording settings to ensure you're capturing necessary data while respecting user privacy.
3. Use a descriptive service name to easily identify your WordPress site in the Highlight dashboard.

## Troubleshooting

If you encounter issues with the plugin, please check the following:

1. Ensure your Project ID is entered correctly in the plugin settings.
2. Verify that the plugin is activated and up to date.
3. Check your browser's console for any JavaScript errors that might interfere with the Highlight script.
4. If network recording is enabled, ensure it's not conflicting with other plugins or security measures on your site.

For further assistance, please refer to our [support documentation](https://highlight.io/docs) or contact our support team.

## Changelog

- **1.0.0** (2023-05-15): Initial release of the Highlight WordPress Plugin.

Stay tuned for future updates and additional features!
