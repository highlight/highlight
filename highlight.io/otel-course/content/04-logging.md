---
id: undefined
title: "OpenTelemetry Logging"
slug: "logging"
description: "Learn how to implement logging in OpenTelemetry, from basic setup to advanced resource attributes and instrumentation."
keywords: "OpenTelemetry, logging, observability, telemetry, resource attributes"
free: false
---

We mentioned the 4 categories of telemetry that are supported by OpenTelemetry: Logs, Traces, Metrics, and Baggage. Today we're going to dive deeper into logs.

## What Is a Log?

A log is a record of an event that happened in an application. It can be anything from a user request to a database query to an error that occurred, or even just a message to help with debugging.

Chances are you're familiar with logs from your development experience. For many developers, `console.log` is their favorite tool for debugging. It's a simple way to print something out to understand the flow and state of an application.

### Log Record

OpenTelemetry defines a `LogRecord` as a record of an event that happened in an application. They've done the work of nailing down the structure of a log record so that it can be easily consumed by any observability tool. Here's a table of the fields that are part of a log record:

| Field Name           | Description                                      |
|----------------------|--------------------------------------------------|
| Timestamp            | Time when the event occurred.                    |
| ObservedTimestamp    | Time when the event was observed.                |
| TraceId              | Request trace id.                                |
| SpanId               | Request span id.                                 |
| TraceFlags           | W3C trace flag.                                  |
| SeverityText         | The severity text (also known as log level).     |
| SeverityNumber       | Numerical value of the severity.                 |
| Body                 | The body of the log record.                      |
| Resource             | Describes the source of the log.                 |
| InstrumentationScope | Describes the scope that emitted the log.        |
| Attributes           | Additional information about the event.          |
| EventName            | Name that identifies the class/type of event.    |

## Evolution and Background

Logs were initially not part of the OpenTelemetry spec, but they were already everywhere in applications and demand was high to add support for them. There is an ongoing debate about how relevant logs are now that traces and metrics have become more powerful, but the reality is that logs have a place in any observability stack and are still everywhere in applications today.

The beauty of OpenTelemetry is that it's designed to work with the logs you already have today. It doesn't matter what format your logs are in, OTel has receivers and processors that can help ingest logs from any source and convert them into a structure that follows their logging spec.

## Basic Logging Example

Let's take a look at how we can start capturing logs in an application. For this example, I have a simple JavaScript file you can execute in Node.js from the terminal and see an example log in the console. Here's a live example of this code running. The code should have automatically run, so you should see logs in the console.

<iframe
  src="https://stackblitz.com/edit/learn-otel-node-examples?embed=1&file=src%2Flog.ts&hideExplorer=1&hideNavigation=1&view=editor&terminalHeight=50&startScript=log&ctl=1"
  height="550px"
  width="100%"
  loading="lazy"
  title="OpenTelemetry Basic Logging Example"
></iframe>

You'll notice that we can see some of the attributes we passed in when calling `logger.emit`, but what are all these other attributes? The OpenTelemetry SDKs automatically add some attributes to our logs, traces, and metrics. These attributes provide context about the source of the log. For example, we can see the service name, the version of the application, and some attributes that help us identify what SDK and version was used to collect the data.

## Resource Attributes

Now that we've seen a log, let's take a look at the spec and see how what we have in our console matches up. You can see the SDKs doing the work for us of emitting logs in a format the collector is expecting them.

An attribute I'd like to zoom in on is the `service.name` attribute. This is automatically added by the SDK and is supposed to help us identify the service that emitted the log. However, in our case we never set this attribute so it's appearing as `undefined:node`. Let's take a look at how we can set this and other resource attributes.

A resource attribute is a key-value pair that describes the resource that the log belongs to. It's a way to add context about the source of the log. These are set when initializing the SDK, so they are propagated to all the telemetry emitted by the SDK.

There are many common resource attributes that are automatically added by the SDKs, and OpenTelemetry has a list of conventions for many more. You can also set custom resource attributes to help identify the source of the log. Let's start with setting the service name + a few other common attributes, as well as a custom attribute for our AWS service region.

<iframe
  src="https://stackblitz.com/edit/learn-otel-node-examples?embed=1&file=src%2Flog-with-resources.ts&hideExplorer=1&hideNavigation=1&view=editor&terminalHeight=50&startScript=log-with-resources&ctl=1"
  height="550px"
  width="100%"
  loading="lazy"
  title="OpenTelemetry Resource Attributes Example"
></iframe>

Note that the `service.name` attribute is now set, as well as `service.version`, `deployment.environment`, and `aws.region`. These attributes will be present on all logs emitted by this provider.

## Advanced Topics

Another thing you'll notice is the `instrumentationScope` attributes. This is another set of attributes that are set when we initialize the SDK. In this case it's coming from when we create the logger. It's another layer of context that helps idenfity the source of telemetry data. This can be useful if you create multiple loggers in an application and want to segment logs within a service.

We'll talk more about attributes like `traceId` and `spanId` when we get into connecting logs with other telemetry data in another lesson. We'll also get into some more advanced topics like how to get your existing logs into OTel without completely rewriting your logging code.
