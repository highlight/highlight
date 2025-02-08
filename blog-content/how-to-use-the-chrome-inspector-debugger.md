---
title: "How To Use The Chrome Inspector & Debugger"
createdAt: 2022-11-01T12:00:00Z
readingTime: 11
authorFirstName: Oyinkansola
authorLastName: Awosan
authorTitle: Developer
authorTwitter: 'https://twitter.com/tire_nii'
authorGithub: "https://github.com/OyinOlamide"
authorWebsite: ""
authorLinkedIn: 'https://www.linkedin.com/in/oyinawosan/?originalSubdomain=ng'
authorPFP: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FpiTf6QmMRNijIohKhV7D&w=3840&q=75'
image: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2F6c7wrEm9R2G60dPV0zfN&w=3840&q=75'
tags: 'Frontend, Developer Experience'
metaTitle: "How To Use The Chrome Inspector & Debugger"
---

[Chrome Developer Tools](https://developer.chrome.com/docs/devtools/ "https://developer.chrome.com/docs/devtools/"), more popularly known as Chrome DevTools, is a toolkit for web developers built into the Google Chrome browser.

Web development can be arduous depending on what is being built, the tools used, and the expertise of the developer involved. As a result, any help a web developer can get is welcome.

The Chrome DevTools provides a set of tools that enable developers to edit their web pages in real-time, diagnose problems quickly, debug their code, and measure and optimize the performance of their web pages.

Though it is primarily designed for developers, it can also be used by casual users to get insights into how a webpage works.

Whether you're a seasoned web developer or just getting started, Chrome DevTools is a valuable tool that can help you build better websites.

## Why Use Chrome DevTools

With the toolkit being embedded in the browser, Chrome DevTools provides developers with powerful and efficient tools which can be used to inspect and edit code without switching tabs.

The Chrome DevTools provides developers with simulations that enable them to see the performance of their website across different devices and browsers. This is extremely useful for fixing potential problems and optimizing the website for all users. The device mode tests across various devices, and the browser mode tests across various browsers.

It also allows developers to measure page performance, analyze network activity, and track down memory leaks. In short, Chrome DevTools is an indispensable tool for any web developer.

While it may seem daunting at first, the Chrome DevTools documentation is actually quite helpful. And once you get the hang of it, you'll wonder how you ever developed without it.

## How to Open Chrome DevTools

To open the Chrome DevTools by press `Option + ⌘ + J` (Mac) or `CTRL + SHIFT + J`,(Windows, Linux).

Once the DevTools are open, you should see a panel that looks like this:

![devtools.png](https://media.graphassets.com/XfRYBf2TQnqtFwZd0MHM "devtools.png")

Alternatively, can also left-click on the web page, and select the inspect option in the menu that comes up.

![inspect.png](https://media.graphassets.com/qk9TLnyQ8YIXP0jIEVBg "inspect.png")

Usually, the DevTools space opens up in the Elements tab by default. However, there are a total of 10 tabs, each with its own purpose:

-   Element
-   Console
-   Sources
-   Network
-   Performance
-   Memory
-   Application
-   Security
-   Lighthouse
-   Recorder
-   Performance insights

![inspect-element.png](https://media.graphassets.com/XlUauJHTRuTBrCMZOWBy "inspect-element.png")

For the purpose of this article, we will be focusing on 5 of these:

-   Elements
-   Console
-   Sources
-   Network
-   Application

## The Chrome DevTools Tabs

### Elements

The Elements panel is where you'll do most of your work in the DevTools. This is where you can inspect and edit the HTML and inline CSS of the web page to inspect or edit. You can make changes to your code either temporarily or permanently and see the changes implemented immediately.

![elements.png](https://media.graphassets.com/PrRbc8QJTle4DbQlvaqV "elements.png")

In the Elements tab, you can adjust buttons, spacing, images, and other HTML elements on the page, or even change the properties of an element.

The Elements tab allows you to edit the style and content of your page without affecting the source code, as any changes you make to your page will not be permanent once you refresh the page. This helps you to run tests and make decisions about making changes to the page as you are seeing it in real time.

In the Styles pane, you can add declarations and check if a class is applied to a particular element and the order in which all styles are applied.

The Computed pane can be a helpful way to check if your CSS classes are being overridden. If you're expecting a certain class to be applied to your code, but it's not appearing, the Computed pane can show you which class is actually being applied.

![computed.png](https://media.graphassets.com/p7tg87pgRMC1XlDjsiKE "computed.png")

This can be especially helpful in troubleshooting sizing problems, as you can see exactly which property is causing the issue.

You can even add new elements to your web page under the Elements pane. To do this, click the "Add Element" button at the pane's top. Here you can put in the HTML for the new element and click ‘OK" to see it added.

### Console

The console tab is a powerful tool that every JavaScript programmer should be aware of. It basically supplies information about the interactive elements on your web page while allowing you to interact with the web page by writing JavaScript.

The console tab allows you to interact with your web page in real time, run, debug, and even test code snippets.

To debug with the console tab, you need to input a debugger into your code, refresh the page and create an event. Once you have done this, you will be redirected to the debugger console.

The console tab is [particularly useful for debugging](https://www.highlight.io/blog/the-debugging-process-and-techniques-for-web-applications-part-1-2 "https://www.highlight.io/blog/the-debugging-process-and-techniques-for-web-applications-part-1-2"), as it allows you to spot bugs or issues much faster than if you were testing in your actual JS file.

If the code is now working according to what is expected with no issues, you can go ahead to copy it and put it into your actual JS file to make your changes permanent.

![console.png](https://media.graphassets.com/SUH9T9TTYmxaONYsOyKw "console.png")

Get started with the console tab by writing JavaScript into the console, then click "Enter." The Console will review the code you put in and return the result.

Overall, the Sources tab is a great way to get a closer look at the inner workings of your web page and make changes as needed. So if you're ever stuck on a coding problem or just want to experiment with some new ideas, be sure to give it a try.

### Sources

The Sources tab allows you to view and edit both the CSS and JavaScript code of your page.

To use it, simply select a file, and the contents will open up in the Editor pane. From there, you can make changes to your code and see them implemented in real time. The pages button at the top will show you what file you are currently inspecting.

One handy feature of the Sources tab is the 'Filesystem' button at the top, which lets you connect your file directly from your code editor to Chrome DevTools. This can be useful when you are confident about the changes you want to make, as it means that any change made in DevTools will automatically be saved in the source file.

However, it is essential to note that by default, any changes made in DevTools will not be reflected in your source code unless you connect your code editor to DevTools as well.

So if you want to make sure that your changes are saved, be sure to use this feature. Otherwise, your changes will be lost when you refresh the page.

![sources.png](https://media.graphassets.com/lW97wIsT0OnCmW99EYwr "sources.png")

The sources tab also allows you to see the values of variables and set breakpoints.

To set a breakpoint, simply select the line number you want to set a breakpoint on, put in the breakpoint conditions, and you're good to go! This can be incredibly helpful when trying to pinpoint the cause of an error.

### Network

The Network tab is a powerful tool that can help you identify and diagnose loading issues on your web page.

By selecting a resource, you can see detailed information about that resource, including the type of resource, when it was loaded, and how long it took to load.

![network-1.png](https://media.graphassets.com/t6XGmrWFS5ywZM206QYB "network-1.png")

This information can help identify resources that are taking longer than expected to load, which can indicate an issue with the server or the network.

Additionally, the Network tab can help you troubleshoot requests returning an error status code. If a status other than 200 is returned, that means there is an issue somewhere. And by troubleshooting these request errors, you can help ensure that your web page is loading smoothly and efficiently.

The Network tab shows the loads for the URL being viewed. This means you can get detailed information about what is causing the slowdown.

![network-2.png](https://media.graphassets.com/5Z4WFtwRga404gS73x8w "network-2.png")

You can also use the Network tab to throttle network speed. This can be helpful when you're trying to test how a website will perform on slower connection speeds. To throttle network speed, simply click the "Network throttling" button at the top of the panel and select the desired connection speed. And then simply click OK to apply the changes.

### Application

The Application tab is a really handy tool that allows you to see what resources are being used by your web application, clear any web app data that you don't need, and [ensure it's healthy](https://www.highlight.io/blog/5-strategies-monitor-health "https://www.highlight.io/blog/5-strategies-monitor-health").

To use the Application tab, simply select a resource under the Resources pane. This will bring up the storage details of that resource.

If you need to clear any web app data, you can do so by selecting the 'Clear storage' option from the menu. This includes cache, cookies, local storage, and anything else that makes up the data of your web application.

![application.png](https://media.graphassets.com/GEbcWvUYRMigqohXdrYg "application.png")

<BlogCallToAction />

## Chrome Devtools — Your New Best Friend

Knowledge of how to use Chrome Devtools is definitely a must-have for web developers as the toolkit is not only versatile but it is also easy to use.

If you are a web developer (or aspire to be one), then it is time for you to up your game and learn how to use Chrome Devtools. This powerful tool can help you speed up your development process, [make it easier to debug](https://www.highlight.io/blog/the-debugging-process-and-techniques-for-web-applications-part-2-2 "https://www.highlight.io/blog/the-debugging-process-and-techniques-for-web-applications-part-2-2") any issues, and boost your productivity.

And if you're not a web developer but want to know more about what's going on under the hood of your web applications, Chrome Devtools can also help you out.

If you're not using it yet, make sure to add it to your arsenal of tools — you won't regret it!
