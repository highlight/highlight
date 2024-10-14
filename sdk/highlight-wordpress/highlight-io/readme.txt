=== Highlight.io Session Recording ===
Contributors: highlightio
Tags: session recording, analytics, error monitoring
Requires at least: 5.0
Tested up to: 6.6
Stable tag: 1.0.0
Requires PHP: 7.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Easily integrate Highlight.io's powerful session recording and monitoring capabilities into your WordPress site.

== Description ==

The Highlight.io WordPress Plugin allows you to easily integrate Highlight's powerful session recording and monitoring capabilities into your WordPress site. With this plugin, you can gain valuable insights into user behavior, troubleshoot issues, and improve your website's performance.

Features:

* Easy Setup: Install and configure the plugin in just a few clicks.
* Session Recording: Capture user interactions on your WordPress site.
* Error Monitoring: Automatically detect and log errors with detailed information for troubleshooting.
* Performance Monitoring: Monitor and analyze website performance metrics like page load times and resource usage.
* Network Recording: Optionally record network requests for deeper insights.
* Console Log Recording: Capture and review console logs to help identify and fix issues quickly.

== Installation ==

1. Log in to your WordPress admin panel.
2. Go to "Plugins" > "Add New".
3. In the search box, type "Highlight.io".
4. Look for "Highlight.io Session Recording" in the search results and click "Install Now".
5. After installation, click "Activate" to enable the plugin.
6. Go to the Highlight.io settings page to configure the plugin.

== Configuration ==

Navigate to "Settings" > "Highlight.io" in your WordPress admin panel. The only required configuration option is your Highlight project ID.

Advanced Configuration options include:
* Custom Service Name: Useful for identifying different environments or sites.
* Tracing Origins: Control which domains are traced, helpful for complex setups with multiple subdomains or external services.
* Network Recording: When enabled, captures network requests, which can be valuable for debugging API calls or third-party integrations.

== Frequently Asked Questions ==

= Where can I find my Project ID? =

You can find your Project ID in your Highlight.io project settings at https://app.highlight.io/setup.

= Is this plugin GDPR compliant? =

The plugin itself does not store any data. All data collection and storage is handled by Highlight.io. Please refer to Highlight.io's privacy policy and GDPR compliance information.

= Are there any best practices for using this plugin? =

1. Always test the plugin on a staging environment before deploying to production.
2. Regularly review your tracing origins and network recording settings to ensure you're capturing necessary data while respecting user privacy.
3. Use a descriptive service name to easily identify your WordPress site in the Highlight dashboard.

= What should I do if I encounter issues with the plugin? =

If you encounter issues, please check the following:
1. Ensure your Project ID is entered correctly in the plugin settings.
2. Verify that the plugin is activated and up to date.
3. Check your browser's console for any JavaScript errors that might interfere with the Highlight script.
4. If network recording is enabled, ensure it's not conflicting with other plugins or security measures on your site.

For further assistance, please refer to our support documentation or contact our support team.

== Development ==

If you're interested in contributing to the development of this plugin, follow these steps:

1. Clone [the repository from GitHub](https://github.com/highlight/highlight)
2. Make your changes in the `sdk/highlight-wordpress/highlight-io` directory.
3. Test your changes thoroughly on a local WordPress installation or using the end-to-end example app in `/e2e/wordpress/` directory.
4. Submit a pull request with your changes for review.

=== Preparing the Plugin for Distribution ===

To package the plugin for distribution in the WordPress plugin directory, we use a custom script that puts all files into a single `.zip` archive. Here's how to use it:

1. Navigate to the root directory of the project.
2. Run the following command:

```sh
# if using yarn
yarn build:wordpress

# if using npm
npm run build:wordpress
```

3. The script will create a zip file named `highlight-wordpress.zip` in the `sdk/highlight-wordpress` directory.

== Changelog ==

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 1.0.0 =
Initial release of the Highlight.io WordPress Plugin.

= How can I contribute to the plugin's development? =

We welcome contributions! Please refer to the "Development" section in this readme for information on how to get started. Make sure to follow WordPress coding standards and thoroughly test your changes before submitting a pull request.
