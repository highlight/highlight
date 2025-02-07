---
title: "The Debugging Process and Techniques for Web Applications (Part 2/2)"
createdAt: 2022-10-25T12:00:00Z
readingTime: 7
authorFirstName: Oyinkansola
authorLastName: Awosan
authorTitle: Developer
authorTwitter: 'https://twitter.com/tire_nii'
authorGithub: "https://github.com/OyinOlamide"
authorWebsite: ""
authorLinkedIn: 'https://www.linkedin.com/in/oyinawosan/?originalSubdomain=ng'
authorPFP: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FpiTf6QmMRNijIohKhV7D&w=3840&q=75'
image: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FXlUauJHTRuTBrCMZOWBy&w=3840&q=75'
tags: 'Frontend, Observability, Developer Experience'
metaTitle: "The Debugging Process and Techniques for Web Applications (Part 2/2)"
---

In the first part of this series, we covered the standard debugging process for web applications. Here, we'll cover four basic techniques to debug your applications.

## **4 Basic Debugging Techniques**

When it comes to debugging, many people immediately think of tools like debuggers and code consoles. This comes as no surprise since [_debugging consumes about 30-90 % of the total development time_](https://arxiv.org/pdf/2103.12447.pdf "https://arxiv.org/pdf/2103.12447.pdf"). However, sometimes the best debugging techniques are the most basic ones.

### #1 Backtracking

[_Backtracking is a common debugging technique_](https://www.researchgate.net/publication/2427941_Efficient_Debugging_with_Slicing_and_Backtracking "https://www.researchgate.net/publication/2427941_Efficient_Debugging_with_Slicing_and_Backtracking") that involves going back to the drawing board (or, in this case, the file or codebase where the error occurred) and retracing your steps to find the source of the error.

Essentially, you're trying to "undo" the changes you made that led to the error so that you can start from a known good state and work forwards from there. It involves taking a step back to understand what part of your code introduced the bug. This can be tricky because it requires you to "think backward." But if you can backtrack successfully, it will save you a lot of time and frustration in the long run.

This technique works well for smaller applications, as it requires you to go through your codebase to find the culprit. However, backtracking can be time-consuming with larger applications that have multiple files and directories, so it's important to use it wisely. If you backtrack too much, you can end up wasting more time than you would have if you'd just started from scratch.

Not to mention that backtracking is typically done manually. While additional tools, such as debugging software, your console, or a debugger, can help automate backtracking to some extent, the process is still largely reliant on your debugging skills. Therefore, we recommend using backtracking as a last resort.

### **#2** Reproduction

To find and fix a bug, you need to know what action(s) lead to it. Reproduction is an excellent debugging technique because it allows you to methodically go through the steps that led to the bug to ensure that it doesn't persist.

If you can't reproduce a bug, that means you don't know what causes it. This makes debugging much more difficult because you have to start from scratch.

A detailed bug report can ease the process of reproduction because you now have information that led to the occurrence of the bug and you can build on that. If there isn't a detailed report, you have to figure out what went wrong and how it occurred by yourself.

You can decide to do it manually by going through the different parts of your application, or you could use tools created for this purpose.

When trying to reproduce bugs, a tool like [_Highlight_](https://www.highlight.io/ "https://www.highlight.io/") will come in handy. It gives you the ability to replay user sessions and see exactly what actions took place before the bug occurred. This will give you valuable insights into what might be causing the bug and how to proceed with debugging

### **#3** Live Instrumentation

No matter how much testing goes on during development, it's impossible to account for every possible issue that might come up once the application is in production. Different people are using your application on a variety of devices and operating systems, and there's no way to test for every potential permutation.

This is where live instrumentation comes into play.

By monitoring the application in real time and gathering data about how it's being used, you can identify issues that wouldn't have shown up in testing. And because you're monitoring actual usage, you can be confident that the data you're collecting is accurate and representative of the real-world performance of your application.

This can be done manually by inserting code in your application to log the activity and performance of an application or by using tools and software created for it. Tools that help with live instrumentation typically provide services such as detailed logging systems, performance monitoring, production debugging, and alerts, among others. Such tools include Highlight, LogRocket, Sentry, and more. The actual tool used doesn't matter, what is important is that you're able to observe the behavior of your application in a production environment.

### **#4** Bisection

Bisection is an effective method used in finding bugs in a codebase. By comparing the current version of an application that contains a bug with previous versions, it is possible to narrow down the range of commits where the bug was introduced.

Doing this repeatedly can help pinpoint the exact commit that introduced the bug.. You can decide to do the comparison manually by going through commits one after another, or you could use "git bisect".

[_Git bisect_](https://git-scm.com/docs/git-bisect "https://git-scm.com/docs/git-bisect") is a tool that can be used to automate the process of finding out which commit introduced a bug. The way git bisect works is by going through commits within a range to find which one introduced the bug. To get started, run "git bisect start" in your terminal — just make sure to be in the main branch of the project. You will need to choose a commit where the bug does not exist and mark it as good by running the "git bisect good" command, then mark your latest commit as bad by running "git bisect bad".

Doing this gives Git a search range. It puts you on different commits which you will mark as good or bad depending on whether the bug exists in the commit or not. When you find the commit that introduced the bug, you run "git bisect reset" to end the process and then fix the bug.

## Debugging Techniques Made Simple

As time-consuming as debugging can be, it helps you find loopholes in your applications and gives you insights into what you can do better in the future to maintain bug-free applications.

Ultimately, debugging is about finding solutions for unexpected outcomes in an application. Regardless of the technique used, you need to ensure that after fixing the bug, you don't just mark it as done. Instead, you should also take time to understand what caused it in the first place, document it, and then put processes in place to prevent repeat occurrences.
