---
title: 8 Tips to Help You Maximize Chrome DevTools
createdAt: 2022-11-03T12:00:00.000Z
readingTime: 4
authorFirstName: Haroon
authorLastName: Choudery
authorTitle: Growth Manager
authorTwitter: 'https://twitter.com/haroonchoudery'
authorLinkedIn: 'https://linkedin.com/in/haroonchoudery'
authorGithub: ''
authorWebsite: ''
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FfKKhW39R0SE2hTIalLzG&w=1920&q=75
tags: 'Frontend, Developer Experience, Engineering'
metaTitle: 8 Tips to Help You Maximize Chrome DevTools
---

The Chrome Developer Tools are a great asset and an indispensable tool for anyone building for the web.

By providing a powerful toolset for developing and [debugging web applications](https://www.highlight.io/blog/the-debugging-process-and-techniques-for-web-applications-part-2-2 "https://www.highlight.io/blog/the-debugging-process-and-techniques-for-web-applications-part-2-2"), Chrome DevTools enables developers to debug and style their frontend apps for responsiveness on Chromium-based browsers such as Brave, Edge, and Chrome.

But it offers more than just seeing the document tree and logging values to the Console. It provides you with an environment to test and iterate on your code, as well as understand and optimize the performance of your web application. Or any other web property, for that matter.

(P.S. here's how to even open the Chrome DevTools)

Whether you're just getting started with the DevTools or are a seasoned veteran, here are eight tips to help you make the most out of Chrome DevTools.

## #1 Explore the Command Menu

The command menu on Chrome DevTools is a shortcut for running commands or code and accessing any visible piece of code in your application. It's also a great way to navigate menus and [perform debugging operations](https://www.highlight.io/blog/the-debugging-process-and-techniques-for-web-applications-part-1-2 "https://www.highlight.io/blog/the-debugging-process-and-techniques-for-web-applications-part-1-2").

To access the command menu, simply click on the three vertical dots at the top right corner of Chrome DevTools. You should then see the "Run Command" option. Alternatively, you can also open the command menu by using Ctrl + Shift + P on Windows or ⌘ + ⇧ + P on Mac.

Once you have the command menu open, simply type in "?" to see a dropdown of all possible actions you can perform. If you want to disable JavaScript or go to a specific line number in your code, you can do so with just a few keystrokes.

So next time you're using DevTools, be sure to take advantage of the command menu. It'll save you tons of time and make your workflow much smoother.

![commandmenu.png](https://media.graphassets.com/2eth1bV5SImHHa78L7px "commandmenu.png")

Source: [Chrome DevTools docs](https://developer.chrome.com/docs/devtools/command-menu/ "https://developer.chrome.com/docs/devtools/command-menu/")

## #2 Copy Attributes & Selectors

One of the most useful features in Chrome DevTools is the ability to copy and paste elements.

For example, if you see an element on a web page that you like, you can right-click it and select "Copy CSS" to copy all of the styling information for that element. Then, you can paste it into your own code and see how it looks.

It's a great way to quickly add styles to your own web app without having to manually write all of the CSS yourself. Similarly, you can also copy and paste JS path information to quickly add event handlers and other scripts to your app.

This feature can be especially useful when working with complex codebases or when trying to match a specific design. So next time you're using Chrome DevTools, give this tip a try and see how it can speed up your workflow.

![attributes-selectors.png](https://media.graphassets.com/L4III95oRmG39VW4pLHt "attributes-selectors.png")

<BlogCallToAction />

## #3 Use Console Shortcuts

Chrome DevTools allows you to run commands or shortcuts in the _Console_. These shortcuts enable you to access or reference any piece of code in your app.

-   $\_ returns the most recent expression you evaluated on the _Console_.

    ![console-shortcuts-1.png](https://media.graphassets.com/HTMlYYn5TIaYrBWQW9Re "console-shortcuts-1.png")


-   $0 references the last element you inspected on the Elements tab, and $1 references the second to the last. $2-$4 follows the same logic.

    ![console-shortcuts-2.png](https://media.graphassets.com/EneFX000Qw6xUaJ5dIko "console-shortcuts-2.png")


-   $() is the shortcut syntax for document.querySelector(), while $$() is the shortcut syntax for document.querySelectorAll().

    ![console-shortcuts-3.png](https://media.graphassets.com/HZ6Msf7PQGuxktOcJgWv "console-shortcuts-3.png")

[Chrome DevTools documentation](https://developer.chrome.com/docs/devtools/console/utilities/ "https://developer.chrome.com/docs/devtools/console/utilities/") has more shortcuts that can help you reference elements and expressions faster.

## #4 Create Code Snippets

Want to play around with code like you would on CodePen? Chrome DevTools' Snippets can be your fast and simple code playground. You can write code, edit multiple lines simultaneously, and save it.

![code-snippets-1.png](https://media.graphassets.com/9G3kAxzQQ820gckSMAPg "code-snippets-1.png")

And the best part is that you can run your snippets on any web page — they don't have to be part of your actual web application.

![code-snippets-2.png](https://media.graphassets.com/00lWNL9sRMqiqebSmyXh "code-snippets-2.png")

To access Snippets in DevTools, go to the Sources tab. If you don't see it right away, click on the double arrow below the tab to expand it. Then, just start creating and running your snippets. Trust us, these Chrome DevTools tips will save you a lot of time in the long run.

![code-snippets-3.png](https://media.graphassets.com/16Ozd11TSRWvM1waUwqT "code-snippets-3.png")

## #5 Test Apps on Different Network Speeds

Not all our users have blazing-fast internet, so it's important to test your web app in different conditions.

In the _Network_ tab of DevTools, you can compare your app's performance on different networks, like fast and slower 3G or custom network speeds. You can also simulate your app's performance when there's no network connection.

To test your app's performance, click on the _Throttling_ dropdown, then start simulating different network connection speeds.

![network-speeds.png](https://media.graphassets.com/EiLd3qkPRjKCho01U3gf "network-speeds.png")

This Chrome DevTools tip will help you ensure that your app performs well for all users, regardless of their connection speed.

## #6 Edit Content in Design Mode

If you're feeling artistic or curious, you can edit any web page you like, whether it's yours or not. Design mode on DevTools works similarly to the _contenteditable_ attribute in HTML. You can set the design mode of any application and edit its content on the page.

To do this, type document.designMode = 'on' in the _Console_ tab and press Enter. Then, click on any part of the page to add, delete image, or edit text as you like.

Keep in mind that your changes will only be temporary and will not be saved when you refresh the page. Nevertheless, this is a fun way to play around with web pages and see what you can create.

![design-mode.png](https://media.graphassets.com/JadO0Ll2R0K7tAsOJCgM "design-mode.png")

## #7 Force Element State

When you're working on styling an element in HTML, it can be helpful to see what the element looks like in different states. For example, you might want to see how an element looks when it's hovered over, or when it's in focus.

You don't have to keep moving your cursor every time you want to debug the hover states of buttons or test changing styling. Chrome DevTools allows you to force any state and put your mouse to better use, like copying or editing the styles.

In the styles part of the _Elements_ tab, you can force a state of an element. For example, the state could be on hover, focus, active, or visited. You only have to click on the component whose state you want to force, then click on _:hov_. You'll see all the states available for you to try out.

![force-element-state.png](https://media.graphassets.com/ZYss1ePKSXWi6XaR4r1W "force-element-state.png")

## #8 Search Code

So you're working away in your app, and you need to find a particular piece of code. Maybe it's a string that you want to change or a function that you want to optimize. Whatever it is, DevTools has a handy feature that lets you search for anything in all loaded scripts.

Just open up the Search bar (you can find it at the bottom of DevTools, or by clicking on the three dots dropdown), and type in what you're looking for. You can also use Ctrl + Shift + F on Windows or ⌘ + ⌥ + F on Mac.

Your query can be case-sensitive or a [regular expression](https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-language-quick-reference "https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-language-quick-reference"), and DevTools will return results for every instance where your query exists. Clicking on any result will then open it in the relevant DevTools panel.

![search-code-1.png](https://media.graphassets.com/BYt8y6DiQ1ChD4V3PJPf "search-code-1.png")![search-code-2.png](https://media.graphassets.com/8gETneWHSJe4p1GFI1jq "search-code-2.png")

Source: [Chrome DevTools docs](https://developer.chrome.com/docs/devtools/search/ "https://developer.chrome.com/docs/devtools/search/")

## Debug with Chrome DevTools

Now that you know some of the best tips and tricks for using Chrome DevTools put them into practice and see how they can help level up your web development process. To learn more about the amazing debugging features it offers, be sure to check out [their documentation](https://developer.chrome.com/docs/devtools/ "https://developer.chrome.com/docs/devtools/").

And if you're looking to take things even further, consider using a monitoring tool like [Highlight](https://www.highlight.io/ "https://www.highlight.io/"). With its ability to detect errors and enable debugging in real-time, Highlight can help you make sure your app is running smoothly — giving you one less thing to worry about.
