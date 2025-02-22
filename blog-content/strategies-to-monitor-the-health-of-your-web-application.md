---
title: 5 Best Practices for Maintaining a Clean ReactJS App
createdAt: 2022-09-29T12:00:00.000Z
readingTime: 7
authorFirstName: Mohammad
authorLastName: Faisal
authorTitle: Developer
authorTwitter: ''
authorLinkedIn: ''
authorGithub: ''
authorWebsite: 'https://www.mohammadfaisal.dev/about-me'
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FKoT3rVsGTf6WNuNefkhk&w=3840&q=75
tags: Engineering
metaTitle: 5 Best Practices for Maintaining a Clean ReactJS App
---

ReactJS is one of the most popular front-end JavaScript frameworks today. In fact, it was the [second most popular framework in 2020](https://www.thinslices.com/insights/infographic-react.js-statistics "https://www.thinslices.com/insights/infographic-react.js-statistics").

It has gained much traction because it makes web development simpler and faster. However, with great power comes great responsibility.

Let's say you've built an awesome application. You're confident that it's bug-free and will scale well. But then, users start complaining about slow load times, white screens, and even straight-up crashes. What went wrong?

Your application has some serious stability issues. And, chances are, you didn't follow some best practices for ReactJS applications.

In this blog post, we'll go over five of them. By following these best practices, you can avoid common issues and build a stable ReactJS application that’s [healthy in the long run](https://www.highlight.io/blog/5-strategies-monitor-health "https://www.highlight.io/blog/5-strategies-monitor-health").

But first, let’s go over what makes healthy software.

## What Makes a Clean ReactJS App

A clean ReactJS app is well organized and easy to follow. Mainly it should:

-   Fail less

    -   If it fails, it provides clear feedback to our users

-   Be easy to find the root cause of the problem.

-   Be simple to get it back up and running

## #1 Sanitize Your Data

One of the major reasons an application crashes on runtime is bad data. In ReactJS, data is passed down from parent to child components through props. If the data is not sanitized properly, it can lead to unexpected bugs and crashes. To avoid this, always sanitize your data before passing it down as props.

Let’s take a look at an example. Maybe you are expecting a remote API to return a piece of data that looks like this:
```
userData = {
  basicInfo: {
    name: string;
    age: number;
  }
}
```
And you have a component that shows these two pieces of data in the following manner:

```
export const SomeComponent = ( {userData} ) => {
return (
    <div>
      <div> {userData.basicInfo.name ?? ""}
    </div>
  )
}
```

The backend developer likely wanted to change the structure of the data to make it flatter, and change it to:
```
userData = {
  name: string;
  age: number;
}
```
But that will cause your application to fail on runtime because it doesn’t know that the structure was changed.

`Error: Can't read name of undefined`

One easy way to avoid a crash like this is by creating the following code:

`<div> {user?.basicInfo?.name} </div>`

The biggest downside of this approach is that you have to input “?” signs into every piece of code, which results in an unclean react code.

### How to Write Clean React Code?

Start by taking advantage of Typescript and define your User model like the following:

```
interface User {
  name: string;
  age: number;
}

function initUser(options?: Partial<User>): User {
  const defaults = {
    name: '',
    age: 0;
  };
return {
    ...defaults,
    ...options,
  };
}

const p1: User = initPerson();
console.log(p1); // -> {name: '', age: 0}

const p2: User = initPerson({ name: 'Tom'});
console.log(p2); // ->  {name: 'Tom', age: 0}
```

The `initUser` method can be used to create an instance of `User`, and the options parameter makes it easy to pass parameters if we want.

If we don’t pass anything, we will get back the object with default values.

So before you push the data into the component, you will pass it via the `initUser` method and stay chilled.

Or you can use a hook to avoid having to worry whether the API data is clean.
```
const useCleanUserData = (userData: User) => {
    return initUser(userData);
}

// inside component
const cleanUserData = useCleanUserData(userData);
```

## #2 Test As Much As Possible

Testing is important for any application. But it's especially important for ReactJS applications. That's because a ReactJS application is composed of small, reusable components.

If one of these components breaks, the entire application can break. So, you must test the most critical paths for your users to make sure it works as expected.

There two best approaches to test your application is:

-   Unit testing with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/ "https://testing-library.com/docs/react-testing-library/intro/")
-   End-to-end testing with [Cypress](https://www.cypress.io/ "https://www.cypress.io/")

We recommend the React Testing Library since it tests the application the same way users would use your application.

```
import { render, screen } from "@testing-library/react";

const userData = {
    basicInfo: {
      name: "John Doe",
      age: 30,
    },
};

describe("Test SomeComponent", () => {
  it("should display the name correctly", () => {
    const { getByText } = render(<SomeComponent userData={userData} />);
    expect(getByText("John Doe")).toBeInTheDocument();
  });

  it("should display empty name if name is undefined", () => {
    const { queryByText } = render(<SomeComponent userData={null} />);
    expect(queryByText("John Doe")).toBeNull();
  });
});
```
But keep in mind that you should approach testing ReactJS applications a bit differently than other applications:

### Focus on Covering The Critical Paths

No matter how thoroughly you test your code, there is always the potential for bugs to slip through the cracks. However, when it comes to testing React applications, there is no need to worry about achieving 100% test coverage. Instead, focus on testing the most important functionality of the application. This will help ensure that the application is stable and bug-free.

### Write More Integration Tests

The Test Pyramid concept prescribes that the majority of tests at the bottom of the pyramid should be low-level unit tests, with progressively fewer higher-level integration tests as you move up the pyramid. However, when testing a ReactJS application, it is important to write more integration tests than unit tests.

![Untitled.jpg](https://media.graphassets.com/3L18if3BQreWVaG2s42R "Untitled.jpg")



![image.jpeg](https://media.graphassets.com/aZT9hclWSayhV4iF8b34 "image.jpeg")

This is because ReactJS heavily relies on component composition, and unit testing each component in isolation does not give you a true picture of how the application will behave as a whole. By [writing more integration tests](https://kentcdodds.com/blog/write-tests "https://kentcdodds.com/blog/write-tests"), you can gain a better understanding of how the different components in your application interact with each other and identify potential issues that can only be uncovered when testing the application as a whole.

## #3 Use Error Boundaries

In any ReactJS application, edge cases will fail. Your users don't have any idea what's going on and they see a white blank screen in case of these uncaught errors. Error boundaries are a way to resolve that.

In ReactJS, an error boundary is a React component that catches JavaScript errors anywhere in its child component tree, logs the errors, and displays a fallback UI instead of the component tree that crashed. [Error boundaries](https://reactjs.org/docs/error-boundaries.html "https://reactjs.org/docs/error-boundaries.html") catch errors during rendering, in lifecycle methods, and in constructors of the whole tree below them.

You have to create a special component named ErrorBoundary like the following:

```
class ErrorBoundary extends React.Component {

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```
And wrap your root component with it. Wrapping your root component with ErrorBoundary will ensure that all child components are protected. This is especially important for applications with complex UI hierarchies.

```
<ErrorBoundary>
  <App />
</ErrorBoundary>
```
When something goes wrong, the ErrorBoundary component will be invoked and can display a custom message or screen to let the user know that there was an error. This way, users will be notified immediately if something goes wrong and can take appropriate action.

But if you don’t want to do this yourself, then you can use Highlight to simplify the setup: [Highlight Error Boundary](https://docs.highlight.run/reactjs-integration "https://docs.highlight.run/reactjs-integration").

`yarn add highlight.run`

With it, you can specify exactly how you want your application to behave if an error occurs, as follows:

```
import { ErrorBoundary } from '@highlight-run/react';

const App = () => (
    <ErrorBoundary
        showDialog
        customDialog={
            <div>
                <h2>Whoops! Looks like a crash happened.</h2>
                <p>Don't worry, our team is tracking this down!</p>

                <form>
                    <label>
                        Feedback
                        <input type="text" />
                    </label>

                    <button type="submit">Send Feedback</button>
                </form>
            </div>
        }
    >
        <YourAwesomeApplication />
    </ErrorBoundary>
);
```

This can be very useful in cases where you need to log the errors or send them to the server.

<BlogCallToAction />

## #4 Use a Logging Tool

Anyone who has ever built a ReactJS application will know the feeling of panic when you go to check on your production site only to find that it is down. In those moments, you will want to know why your application went down and what you can do to prevent it from happening again in the future. Designing an effective logging strategy is critical to your application's success.

Using console.log in development can give you enough to do the job, but in production, that’s no use as the build process strips out all of the console.log statements out of your final package to make the bundle size smaller.

To avoid that, you can take advantage of a powerful react logger library called [loglevel-plugin-remote](https://github.com/kutuluk/loglevel-plugin-remote "https://github.com/kutuluk/loglevel-plugin-remote"), a plugin of the original [loglevel](https://www.npmjs.com/package/loglevel "https://www.npmjs.com/package/loglevel") library, which can be used in development and production environments.

This React logger library allows you to log messages remotely, which means that you can still access your logs even if your production site goes down. In addition, react-logger-plugin-remote also allows you to customize your logging level, so that you can control how much information is being logged and make sure that only important messages are being sent.

`yarn add loglevel loglevel-plugin-remote`

You can configure a backend for receiving your logs, and this package will handle the rest. The default values of this package are given below.
```
const defaults = {
  url: '/logger',  -> a URL of the server logging API
  method: 'POST',  -> HTTP method of the server logging API
  headers: {},     ->
  token: '',
  onUnauthorized: failedToken => {},
  timeout: 0,
  interval: 1000,
  level: 'trace',
  backoff: {
    multiplier: 2,
    jitter: 0.1,
    limit: 30000,
  },
  capacity: 500,    -> size of the queue in which messages are accumulated between sending.
  stacktrace: {
    levels: ['trace', 'warn', 'error'],
    depth: 3,  -> number of stack traces
    excess: 0,
  },
  timestamp: () => new Date().toISOString(),
  format: remote.plain,
};const defaults = {
  url: '/logger',  -> a URL of the server logging API
  method: 'POST',  -> HTTP method of the server logging API
  headers: {},     ->
  token: '',
  onUnauthorized: failedToken => {},
  timeout: 0,
  interval: 1000,
  level: 'trace',
  backoff: {
    multiplier: 2,
    jitter: 0.1,
    limit: 30000,
  },
  capacity: 500,    -> size of the queue in which messages are accumulated between sending.
  stacktrace: {
    levels: ['trace', 'warn', 'error'],
    depth: 3,  -> number of stack traces
    excess: 0,
  },
  timestamp: () => new Date().toISOString(),
  format: remote.plain,
};
```

You can use this like the following.

```
import log from 'loglevel';
import remote from 'loglevel-plugin-remote'

log.enableAll();
remote.apply(log);

//Then inside the component/hook
log.info('some message);
log.error('some error message');
```

And the rest will be taken care of by the plugin. It will accumulate the logs in a queue whose size is configurable and send that to the remote server you specified at a certain interval.

## #5 Have an Effective Deployment Strategy

When it comes to deployment, there are a few things you need to consider in order to ensure a smooth process.

First, you'll need to choose an effective CI/CD tool — this will be essential in ensuring that your application is deployed reproducibly and with minimal errors. There are both free and paid options available; some popular choices include GitHub Actions and Vercel.

You also need to make sure that you can roll back to the previous version of your application at a moment's notice; this is essential in case anything goes wrong during the deployment process.

By following these simple tips, you can deploy your ReactJS application with ease and confidence.
