---
title: Frequently Asked Questions.
slug: frequently-asked-questions
quickstart: true
---

# Highlight.io Integration and Troubleshooting Guide

This documentation provides solutions and guidance for common issues encountered while integrating and using Highlight.io within various frameworks and setups.

## Viewing JSON Bodies in Traces

**Question:** How can I view JSON bodies in the traces view of Highlight.io?

**Answer:** To view JSON bodies in the traces, ensure that your initialization call includes `recordHeadersAndBody: true`. If the bodies are still not visible in the traces view, you may need to manually inspect the network requests within the developer tools of your browser. Highlight.io is considering enhancing the visibility of this data directly in the traces view for a more streamlined experience.

## Excluded Hostnames Not Working

**Question:** Why are my settings for `excludedHostnames` not working in my Next.js project?

**Answer:** Ensure that the hostnames listed in `excludedHostnames` match your local environment settings exactly, including any ports. Typos or discrepancies can prevent the settings from working correctly. Additionally, check for any middleware that might interfere with the `HighlightInit` settings. For more detailed instructions, refer to the [Highlight.io Documentation](https://www.highlight.io/docs/getting-started/fullstack-frameworks/next-js/page-router#skip-localhost-tracking).

## Custom Function for Redacting Sensitive Data

**Question:** How can I implement a custom function to redact sensitive data from arrays of objects in the request/response body?

**Answer:** Highlight.io has updated its SDK to handle arrays of objects more effectively when redacting sensitive data. Ensure you are using version `8.5.0` or later, which includes improvements for iterating through arrays in the body and converting bodies to JSON before passing them to your custom `requestResponseSanitizer` function. This update should resolve issues with redacting data from arrays of objects.

## Setting Up Tracing with SvelteKit

**Question:** How can I set up tracing with SvelteKit as I am not seeing any traces despite having logs and errors?

**Answer:** Ensure that your `H.init` configuration is correctly set up in both `hooks.client.ts` and `hooks.server.ts`. Use `H.runWithHeaders` in your server-side handle function to ensure that headers are correctly passed and handled. If issues persist, please provide the Highlight traces page URL and check the version of the `@highlight-run/node` SDK you are using. For detailed guidance, refer to the [Highlight.io SvelteKit Documentation](https://www.highlight.io/docs/getting-started/client-sdk/svelte-kit).

## Session Recording Issues

**Question:** Why am I not seeing console logs in my Highlight session recordings?

**Answer:** If you are not seeing console logs, ensure that `disableConsoleRecording` is set to `false` in your `init` options. Highlight.io processes logs asynchronously, which might result in a delay in displaying them in the console logs tab. Check back after some time to see if the logs have appeared.

## Handling CORS with Strict Policies

**Question:** How can I handle CORS issues when using Highlight.io with strict cross-origin policies?

**Answer:** Highlight.io has updated its asset delivery to accommodate strict CORS policies by setting the `Cross-Origin-Resource-Policy: cross-origin` header. If you continue to experience CORS issues, ensure that your application's CORS settings allow requests from Highlight.io domains. If specific headers like `Cross-Origin-Embedder-Policy` are required for your application, Highlight.io can adjust its headers to comply with these requirements.

For further assistance with any of these issues or other inquiries, please refer to the [Highlight.io Support](https://www.highlight.io/support) or consult the detailed documentation available on the [Highlight.io Docs](https://www.highlight.io/docs) page.

## Handling Private Windows and Session Tracking

**Question:** Why does session tracking not work when the site is loaded in a Private window?

**Answer:** Incognito/Private windows are recorded. By default, Highlight filters session results to only show 'completed' ones,
where the tab has been closed, rather than 'live' ones, where data is still flowing. As a result, you might not see the
session that is still live. As soon as the tab is closed, the session should show up.
