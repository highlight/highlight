---
title: "The Debugging Process and Techniques for Web Applications (Part 1/2)"
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
tags: 'Frontend, Developer Experience'
metaTitle: "The Debugging Process and Techniques for Web Applications (Part 1/2)"
---

In software development, bugs are unavoidable. Sometimes, they appear as we work and at other times, they pop up unexpectedly. While they can be annoying to deal with, we know that bugs certainly do not appear without reason.

The process of dealing with bugs in our code is referred to as **debugging**. Let's dig into what debugging is and the general debugging process.

## **Debugging and Its Importance**

Debugging is the process of identifying and removing errors from software. It is a process of finding, analyzing, and eliminating bugs or defects in a computer program that can potentially cause it to behave unexpectedly or even crash.

Not only is debugging used for prevention but it is also used to fix or resolve errors that have already caused a program or application to crash or act abnormally.

The most obvious reason why debugging is important is that it lets applications function as expected. However, there are some other, more latent reasons, why debugging is an important exercise including:

-
-   helping us learn new things about our code, or reinforce old knowledge.
-
-   showing us new ways that our application can act depending on what is done or how it is used.
-
-   making it easier to problem-solve.

<BlogCallToAction />

## **The Debugging Process**

Debugging can range widely in complexity depending on the kind of bugs being dealt with. However, the debugging process is generally the same across different types of bugs.

Below, we walk through the general debugging process:

### **Step 1. Classify the bug**

For this process, you need to know what type of bug you are dealing with. Bugs may act similarly, but they vary in type and are classified differently depending on the issues they cause. Let's discuss some of them:

**Syntax bugs:** These types of bugs are caused when the code written does not follow the syntax rules of the programming language. It could be by calling a variable before it is declared, missing parentheses, grammatical errors in the code, not using semicolons in some languages, and so on. Such errors can prevent the code from compiling properly. They are usually the easiest types of bugs to find because they are caught in the compilation process and are displayed in the error message returned. Syntax errors can also be caught earlier in code editors that enable syntax highlighting.

A syntax bug or error can be caused by a code block like this:
```
const testFunction = () => {
  console.log('testing...';
}
```
The closing parentheses are missing, so it will return the following error.
```
Uncaught SyntaxError: missing ) after argument list
```
**Logical bugs:** These are bugs caused by how the logic in the code was written. They can be difficult to find because they are often not "wrong" in the actual sense of programming, but the results they lend to are unintended. With logical errors, your program will run successfully, but you may not get the desired or expected output. A simple example of this is multiplying the prices of different items in a shopping cart instead of adding them.

Below is a code block that could lead to a logical error:

```
const numArray = [2,4,5,6,7,5,3,2];
const arraySum = numArray.reduce((a,b) => a * b);
console.log(arraySum);

//50400 instead of 34 as expected
```
In the example above, I'm trying to get a sum of the numbers in the array, but I used the multiplication operator which means I'll get the wrong value even though no error was thrown.

**Functional bugs:** These are bugs that affect how a specific part of an application is expected to work. An example of this bug is when a button to remove items from a shopping cart does not remove the intended item.

### **Step 2. Identify the bug**

This process usually starts by asking the question "where in the codebase did this bug occur?" and then going ahead to find answers to your question.

Did it occur on the frontend or backend codebase? If it's in the frontend code, what part of the codebase is it in? You need to find what page, component, or function is causing the bug. The same thing goes for the backend codebase.

One thing developers know about bugs is that they can be quite tricky. An error may occur in line 110, but line 110 may not be actually causing the bug. The bug may have occurred because the function in line 110 is using a variable in line 23 that was not properly declared. This means that finding and fixing the issue on line 23 will be the solution to the problem on line 110.

When trying to identify a bug, ensure that you are thorough. This will help reduce the time spent on debugging. Identifying the location of the bug brings you a step closer to fixing the bug.

### **Step 3. Understand the bug**

After identifying a bug, you need to understand why it's causing an error. This understanding makes it easier to fix.

Trying to fix a bug you don't understand can lead to the introduction of new bugs. Understanding a bug helps you find the real source of the problem, rather than tackling the wrong parts of your codebase and causing new issues.

In the delete button instance mentioned in the functional bugs example, the issue may be from the delete function not being called, or not being created at all. If in fact, the function call already exists but isn't called, understanding why the bug occurred (the function not being called) helps with fixing it (call the function).

### **Step 4. Fix the bug**

By the time we classify, identify, and understand the bug, fixing it should be straightforward. Either you can pull from your prior knowledge of how to tackle a particular bug, or you can research how others have tackled it. In the latter case, understanding a bug deeply will help you ask the right questions during the research process.

_Now that we've discussed processes involved in debugging, let's look into some techniques that can be applied when debugging in [_Part 2_](https://www.highlight.io/blog/the-debugging-process-and-techniques-for-web-applications-part-2-2 "https://www.highlight.io/blog/the-debugging-process-and-techniques-for-web-applications-part-2-2")_
