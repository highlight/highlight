---
title: 3 Levels of Data Validation in a Full Stack Application With React
createdAt: 2022-09-30T12:00:00.000Z
readingTime: 9
authorFirstName: Paweł
authorLastName: Dąbrowski
authorTitle: Developer
authorTwitter: ''
authorLinkedIn: ''
authorGithub: ''
authorWebsite: 'https://paweldabrowski.com/articles/categories/ruby?source=longliveruby'
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FAlHke0jkQJWxpmcXBBhZ&w=3840&q=75
image: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FFzuqrVP7QHutj0VgCvjz&w=3840&q=75
tags: Engineering
metaTitle: 3 Levels of Data Validation in a Full Stack Application With React
---

Data validation is critical for any application that relies on input from users. Without strong validation, you can end up with malformed data that can break features like filtering and search.

This article provides a broad overview of [full stack](https://www.highlight.io/blog/what-is-full-stack-monitoring-and-how-does-it-work "https://www.highlight.io/blog/what-is-full-stack-monitoring-and-how-does-it-work") data validation in modern web applications. You’ll learn how to validate the data on the frontend level with React framework, on the backend with your choice of backend technology, and at the database level. With this knowledge, you'll be able to build more reliable and user-friendly applications.

## What is Data Validation

Data validation is simply ensuring that the information provided by the end-user is valuable and in the correct format. It's a critical part of any data management strategy, as it helps ensure data quality and integrity.

For example, if you collect e-mail addresses from the users, you won’t benefit from having the e-mail that has the wrong format as the system won’t deliver a message to such an address.

## Why is Data Validation Important?

Data validation is important for several reasons. It:

-   **Ensures data quality and accuracy**: you can be sure that data is in the correct format and contains no invalid values. This helps to avoid data inconsistencies and errors.
-   **Improves data security**: you can prevent malicious users from entering invalid data that can compromise the security of your application.
-   **Reduces development time**: you can avoid spending time debugging data-related issues.

<BlogCallToAction />

## 3 Levels of Data Validation

To ensure that invalid data doesn't make its way into your database, you need to validate data at different levels:

-   **Frontend** — when data is entered into a form, it should be checked for correctness and completeness. You can implement validation using JavaScript code or built-in form validation that is supported by all modern browsers. However, users can bypass such verification, and you need another layer of assurance.
-   **Backend** — before data is saved to the database, it should be validated again. This time, you can verify the data on the server. When the verification process is correctly implemented, bypassing this validation is impossible from the user's perspective. Still, there are some situations where developers can bypass it — therefore, you need an additional layer of assurance.
-   **Database** — data should be verified one more time before it's stored in the database. This is done to ensure that data conforms to the rules defined in the database schema and it's not corrupted or malformed.

Let’s take a closer look at each level of validation.

## Frontend Data Validation Level

The first phase of the data validation process is on the frontend level— that is, data validation on the browser level. This is usually done to improve the user experience; if a mistake is made in the form, the user will receive feedback without having to send a request to the server. Additionally, frontend validation can help to reduce backend load because fewer requests need to be sent to the server overall.

In React, you can validate the data in three ways; by:

-   using built-in form validation
-   writing validation rules by your hand
-   or using some ready libraries to save time

### **Built-in form validation**

Client-side form validation is based on the HTML attributes that tell the browser to verify the data before allowing the form submission. You have the following types of validation at your disposal:

-   **required:** specifies if the value for input is required
-   **minlength** and **maxlength:** maximum and minimum length for strings
-   **min** and **max:** maximum and minimum length for numbers
-   **type:** specifies the type of the data; for example, that value must be an e-mail
-   **pattern:** regular expression that the value must match

To apply validation rules to your input, simply define them as HTML attributes:
```
<input name=”email” type=”email” required minlenght=”4”/>
```
### **Custom Validation Rules**

If you need custom validation rules, you can write JavaScript code that will validate the data. If you want to validate the password, you can write the following simple code to perform validation in your React component:

```
validate = (name, value) => {
  switch (name) {
    case "password":
      if (!value.match(/[a-z]/g)) {
        return "Please enter at least lower character.";
      } else if (!value.match(/[A-Z]/g)) {
        return "Please enter at least upper character.";
      } else if (!value.match(/[0-9]/g)) {
        return "Please enter at least one digit.";
      } else {
        return "";
      }
    default: {
      return "";
    }
  }
};
```

But this approach is time-consuming, so in most cases, it is better to search for some open-source libraries that will handle the verification process for you.

### **Open-Source Library for Validation**

There are a few different open-source libraries that you can use to validate data in React, which can save you some time and effort. Similar to the previous example, this time, we also want to validate the password complexity but with the library.

For instance, you can install [validator package](https://www.npmjs.com/package/validator "https://www.npmjs.com/package/validator"):

```
npm install validator
```
Now, you can use it inside the React component to check the complexity of the password that the user provided:
```
import React, { Component } from "react";
import validator from "validator";

const App = () => {
  const validate = (value) => {
    if (
      validator.isStrongPassword(value, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
      })
    ) {
      /* strong password */
    } else {
      /* show error message */
    }
  };
};
```

The new component is more straightforward and effective which helps you achieve your goal faster.

## Backend Data Validation Level

Depending on the technology you're using, there are a few different ways to validate data in the backend. Generally speaking, you want to receive the request and verify the format of the data before saving it into the database or passing it to any other source. That way, if the data is invalid, you can return the response to the frontend and render feedback for the user.

Suppose you are using a backend framework that is based on the Model-View-Controller architecture (or a similar one) like Rails (Ruby), Django (Python), or Laravel (PHP). In that case, you will validate the data in the model or directly in the controller. With other backend technologies, you may handle it differently depending on the case.

Of course, end-users can try to bypass validation if you forget to secure some endpoints in the application. But overall, validating data in the backend is a good way to ensure that your data is clean and accurate before it's stored or passed along.

## Database Validation Level

The last (but not least) important level of validation is the database. The correctly designed database schema is a layer of the validation itself.

For example, imagine that you would like to save the user's age. If you set the age column type to integer, you will avoid holding non-numeric values.

Another way of verifying the data is to set constraints. They are the key feature of database management systems. You define them when you create the schema, and their job is to ensure that defined rules are applied to the data when it is manipulated.

Some of the most popular constraints are:

-   **default:** if the value is not given, the database will assign the default value
-   **not null:** the value must be present for the given column
-   **unique key:** the value must be unique among all values or among all values with the provided scope
-   **foreign key:** used to prevent actions that would destroy links between tables

The constraints guarantee that the data integrity is never compromised and your [application is healthy](https://www.highlight.io/blog/5-strategies-monitor-health "https://www.highlight.io/blog/5-strategies-monitor-health").

## Data Integrity Across Levels

Data validation is an essential part of any data-driven application with user-based input.

It can be performed on multiple levels, but for the best possible user experience and data integrity, you should implement validation on the frontend, backend, and database.

By ensuring data is valid on all levels, you can be confident that the data your users are inputting is clean, consistent, and won't cause any errors further down the line.
