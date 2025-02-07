---
title: The 5 Best Logging Libraries for Golang
createdAt: 2023-01-09T12:00:00.000Z
readingTime: 8
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: CTO @ Highlight
authorTwitter: 'https://twitter.com/vkorolik'
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorWebsite: 'https://vadweb.us'
authorPFP: >-
  https://lh3.googleusercontent.com/a-/AOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY=s96-c
tags: Engineering
metaTitle: The 5 Best Logging Libraries for Go
---

When you deploy an application in production, you must monitor it to ensure that is working as intended, and observe any issues that arise. One of the tools you can use is Logging, which records activities on the application and forwards them to persisting storages, such as files, sockets, or a [monitoring tool](https://www.highlight.io/blog/what-is-frontend-monitoring). If the application has an issue, you can go through the logs to analyze the state of the application before the problem emerged. Good logs tell you the severity of the log messages, the date the log entries were created, and are usually in a format that is human and machine-readable.

Knowing the right tools to use for logging can help you create good logs without putting much effort. [Go](https://go.dev/) ships with a logging library, and has access to over [50 logging](https://github.com/avelino/awesome-go#logging) libraries.

In this article, we'll explore the five best logging libraries for Go:

- [Zap](https://github.com/uber-go/zap)
- [Zerolog](https://github.com/rs/zerolog)
- [Slog](https://pkg.go.dev/golang.org/x/exp/slog)
- [apex/log](https://github.com/apex/log)
- [Logrus](https://github.com/sirupsen/logrus)

## Why Use Logging Libraries for Go?

If you have used ` fmt.Println()` to log messages, and you wonder why a logging library is necessary, this section is for you.

Let's say you have logged a message with ` fmt.Println()` as follows:

```go
 fmt.Println("this is a message")
```

```
// Output
this is a message
```

The message here has no severity levels to tell you the significance of the message. It has no timestamps to let you know when the log entry was made, and nor is the message in a format like JSON that a machine can parse or filter.

Compare the output ` fmt.Println()` with the output from a structured logging library for Go:

```
// Output
{"level":"info","timestamp":"2023-03-31T17:49:06.456145676+02:00","message":"This is an info message"
```

The following are some of the fascinating details about the message:

- The message is structured using the JSON format, which is machine-readable.
- It contains a level showing the severity of the message. Examples of levels include `DEBUG`, `INFO`, `WARN`, and `ERROR`.
- It includes a timestamp that tells you when the log entry was made.

Most logging libraries can create the preceding structured message out of the box.

They also make it easier to specify destinations to send logs, such as files, sockets, emails, monitoring tools, etc.

Now that you know why a logging library is important for your project, let's explore the best logging libraries in Go.

## 5 Best Go Logging Libraries

### #1 Zap

The first on our list is [Zap](https://pkg.go.dev/go.uber.org/zap), which is a popular structured, leveled logging library for Go. Uber developed it as a high-performance alternative to the `log` library built-in Go, as well as third-party libraries like [Logrus](https://github.com/sirupsen/logrus). It claims to be 4-10x faster than the competing libraries and ranks high on most benchmarks in terms of speed. At the time of writing, it has 18.4K stars on GitHub.

The following are some of the key features available in the library:

- It is fast
- Can forward logs to multiple destinations, such as files, standard output, syslog, or network streams.
- Allows you to customize the log messages format or add custom fields to messages.
- Extensible with the use of third-party libraries.

### How to Use Zap

With the latest version Go on your system, install the Zap package as follows:

```bash
go get -u go.uber.org/zap
```

Next, create a `zap_demo.go` with the following code that logs messages in a structured format:

```go
package main

import (
    "log"

    "go.uber.org/zap"
)

func main() {
    logger, err := zap.NewProduction()
    if err != nil {
        log.Fatal(err)
    }

    sugar := logger.Sugar()
    defer logger.Sync()

    sugar.Debug("this is a debug message")
    sugar.Info("this is an info message")
    sugar.Warn("this is a warn message")
    sugar.Error("this is an error message")
    sugar.Fatal("this is a fatal message")
}
```

To quickly get started with Zap, you call the `NewProduction()` preset, which already has some configurations. Depending on your performance needs, you can choose between two loggers:`Logger` when performance is critical and `SugaredLogger` when performance is nice, but not too critical. In the example, you call `Sugar()` to use the `SugaredLogger`.
Following that, you flush the buffer, then call the methods that correspond to the levels that the library supports.

The following is a brief overview of the supported levels:

- `DEBUG`: Information useful to developers during debugging.
- `INFO`: Confirms that the application is working the way it is supposed to.
- `WARN`: Indicates a problem that can disturb the application in the future.
- `ERROR`: An issue causing malfunctioning of one or more features.
- `FATAL`: a serious issue that prevents the program from working.

Zap also supports other levels `DPANIC`, and `PANIC`, which are out of the scope of this post.

When you run the file, you will receive the following output:

```
// Output
{"level":"info","ts":1680291423.5023077,"caller":"zap_demo/zap_demo.go:19","msg":"this is an info message"}
{"level":"warn","ts":1680291423.502472,"caller":"zap_demo/zap_demo.go:20","msg":"this is a warn message"}
{"level":"error","ts":1680291423.5025172,"caller":"zap_demo/zap_demo.go:21","msg":"this is an error message","stacktrace":"zap_demo/zap_demo.go:21\nruntime.main\n\t/usr/local/go/src/runtime/proc.go:250"}
{"level":"fatal","ts":1680291423.502553,"caller":"zap_demo/zap_demo.go:22","msg":"this is a fatal message","stacktrace":"zap_demo/zap_demo.go:22\nruntime.main\n\t/usr/local/go/src/runtime/proc.go:250"}
exit status 1
```

In the output, you see structured log messages containing the severity `level`, timestamp `ts`, the actual message `msg`, and the `stacktrace` property for the messages with `ERROR`, and `FATAL` severity.

The standard output isn't the only destination to send logs. You can forward the logs to a file as well. For that, you will need to configure the `NewProduction` preset. Take look at the latest example:

```go
package main

import (
    "log"

    "go.uber.org/zap"
)

func main() {
    config := zap.NewProductionConfig()
    config.OutputPaths = []string{"app.log"}
    logger, err := config.Build()

    if err != nil {
        log.Fatal(err)
    }

    sugar := logger.Sugar()

    sugar.Warn("this is a warning message")

}
```

`NewProductionConfig()` creates a configuration for the logger. Next, you use the `OutputPaths` to specify the destination to send the logs, which is the `app.log` file. You then invoke `config.Build()` to build the logger. Then after that, you check if there is an error, and exit the application if need be. Similar to the last example, you use the `Sugar()` logger, and log a warning message.

Upon running the file, you will find a file `app.log` in the directory containing a log message that looks similar to the following:

```
// Output
{"level":"warn","ts":1680298496.6165621,"caller":"zap_demo/zap_demo.go:20","msg":"this is a warning message"}
```

Zap also allows you to customize a message and add extra fields. The `Sugaredlevel` logger provides extra methods that end with `w`, such as `InfoW`, `WarnW`, etc., which accepts fields as demonstrated below:

```go
package main

import (
    "log"
    "os"      // <-

    "go.uber.org/zap"
)
func main() {
    config := zap.NewProductionConfig()
    config.OutputPaths = []string{"app.log"}
    logger, err := config.Build()

    if err != nil {
        log.Fatal(err)
    }

    sugar := logger.Sugar()

    sugar.Warnw("this is a warn message",
        "process_id", os.Getpid(),  // <-
    )

}
```

The `Warnw()` method now takes an extra field `process_id` set to the process ID of the Go program.

To test the new changes, remove the `app.log` in your directory and then run the file. It will create the `app.log` file again with the following:

```
// Output
{"level":"warn","ts":1680299173.2954037,"caller":"zap/zap_demo.go:21","msg":"this is a warn message","process_id":63413}
```

You will now see the `process_id` field in the output.

If the `NewProduction()` preset doesn't suit your need, you can configure your own logger with JSON or YAML, and then pass it to the Zap logger:

```go
package main

import (
    "encoding/json"
    "log"

    "go.uber.org/zap"
)

func main() {
    rawJSON := []byte(`{
        "level": "warn",
        "encoding": "json",
         "outputPaths": ["stdout"],
         "encoderConfig": {
            "levelKey": "level",
            "messageKey": "message",
            "levelEncoder": "lowercase"
        }
        }`)
    var cfg zap.Config
    if err := json.Unmarshal(rawJSON, &cfg); err != nil {
        log.Fatal(err)
    }
    logger, err := cfg.Build()
    if err != nil {
        log.Fatal(err)
    }

    sugar := logger.Sugar()

    sugar.Warn("this is a warning message")

}
```

In the `main()` function, you create a raw JSON, which contains fields that specify the minimum severity level, encoding, and destination to send logs. In the `encoderConfig` option, you include and customize the fields that should show up in the log message.

To decode the JSON array elements into Go array elements, you invoke `json.Unmarshal()`, which takes the raw JSON you created. Following this, you build the logger and log a warning message in the console.

Running the file produces the following output:

```
# Output
{"level":"warn","message":"this is a warning message"}
```

We have barely scratched the surface of what Zap is capable of doing, visit [the documentation](https://pkg.go.dev/go.uber.org/zap) to explore more Zap features.

### #2 Zerolog

[Zerolog](https://github.com/rs/zerolog) is another high-performance structured logging library for Go. It was inspired by Zap, and aims to provide an optimized logger with a simple API for a great developer experience. At the time of writing, it has close to 8K Github Stars.

Zerolog has the following features to consider:

- high performance
- can [integrate](https://github.com/rs/zerolog#integration-with-nethttp) with `net/http`
- [Binary encoding](https://github.com/rs/zerolog#binary-encoding) with JSON or CBOR encoding formats
- log sampling
- hooks
- Pretty printing

### How to Use Zerolog

Install the package with the following command:

```
go get -u github.com/rs/zerolog/log
```

Then create a `zerolog_demo.go` file and add the following code:

```go
package main

import (
    "github.com/rs/zerolog"
    "github.com/rs/zerolog/log"
)

func main() {
    zerolog.TimeFieldFormat = zerolog.TimeFormatUnix

    log.Trace().Msg("this is a debug message")
    log.Debug().Msg("this is a debug message")
    log.Info().Msg("this is an info message")
    log.Warn().Msg("this is a warning message")
    log.Error().Msg("this is an error message")
    log.Fatal().Msg("this is a fatal message")
    log.Panic().Msg("This is a panic message")
}
```

Zerolog has a pre-configured logger that supports the following levels: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`, and `PANIC`.

Running the file will log all the messages in the console:

```
{"level":"trace","time":1680340368,"message":"this is a debug message"}
{"level":"debug","time":1680340368,"message":"this is a debug message"}
{"level":"info","time":1680340368,"message":"this is an info message"}
{"level":"warn","time":1680340368,"message":"this is a warning message"}
{"level":"error","time":1680340368,"message":"this is an error message"}
{"level":"fatal","time":1680340368,"message":"this is a fatal message"}
exit status 1
```

As you can see in the output, every message is structured in JSON and has a level, time, as well actual message.

Zap defaults to the minimum level `TRACE`, which you can change anytime with the following `SetGlobalLevel()` method:

```go
package main

import (
    "github.com/rs/zerolog"
    "github.com/rs/zerolog/log"
)

func main() {
    zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
    zerolog.SetGlobalLevel(zerolog.WarnLevel)  // <-

    log.Trace().Msg("this is a debug message")
    log.Debug().Msg("this is a debug message")
    log.Info().Msg("this is an info message")
    log.Warn().Msg("this is a warn message")
    log.Error().Msg("this is an error message")
    log.Fatal().Msg("this is a fatal message")
    log.Panic().Msg("This is a panic message")
}
```

The `SetGlobaLevel()` method of Zerolog library changes the minimum level. In the output, you will see that only messages with a severity level of `WARN` or higher are logged:

```
// Output
{"level":"warn","time":1680340867,"message":"this is a warn message"}
{"level":"error","time":1680340867,"message":"this is an error message"}
{"level":"fatal","time":1680340867,"message":"this is a fatal message"}
exit status 1
```

You can also configure Zerolog to send log messages to files as demonstrated in this new example:

```go
package main

import (
    "os"

    "github.com/rs/zerolog"
    "github.com/rs/zerolog/log"
)

func main() {
    zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
    runLogFile, _ := os.OpenFile(
        "app.log",
        os.O_APPEND|os.O_CREATE|os.O_WRONLY,
        0664,
    )
    multi := zerolog.MultiLevelWriter(runLogFile)
     r
    log.Logger = zerolog.New(multi).With().Timestamp().Logger()

    log.Error().Msg("this is an error message")
}

```

In the preceding code, you open the file `app.log` and pass the file instance to the Zerolog logger so that it should forward the log messages to the file.

When you run the file, it creates an `app.log` file with the following contents:

```
// Output
{"level":"error","time":1680341549,"message":"this is an error message"}
```

Now that you have an idea of what Zerolog, is capable of doing, the [documentation](https://github.com/rs/zerolog) covers a lot more other cool features.

<BlogCallToAction/>

## 3 Slog

Go ships with a logging module `log` in its standard library, which has a lot of limitations. For one, it lacks log levels, and for another, it has no support for structured logging. In October 2022, a [proposal](https://github.com/golang/go/issues/56345) was made for a logging library with support for structured logging and levels called [Slog](https://pkg.go.dev/golang.org/x/exp/slog). The proposal was accepted and it will be included in [Go 1.21](https://github.com/golang/go/wiki/Resources-for-slog). The preliminary implementation is at [https://pkg.go.dev/golang.org/x/exp/slog](https://pkg.go.dev/golang.org/x/exp/slog), and you can use it with the recent versions of Go. Once implemented in Go, you will be able to access it from `log/slog`.

The following are some of the features of Slog:

- Structured logging with support for JSON and Logfmt format.
- A faster performance
- Support for levels
- Allows adding custom fields to logs
- Forwarding logs to multiple destinations.
  -Part of the standard library. No need for a third-party logging library.

### How to Use Slog

Ensure you have the latest version of Go. If the version is 1.20 or lower, install `slog` as follows:

```
go get golang.org/x/exp/slog
```

For Go versions 1.21 or higher, Slog will be included in the standard library. So the installation won't be necessary.

In your text editor, create a `slog_demo.go` file, and paste the following:

```go
package main

import (
    "golang.org/x/exp/slog"
)

func main() {

    slog.Debug("This is a Debug message")
    slog.Info("This is an Info message")
    slog.Warn("This is a Warning message")
    slog.Error("This is an Error message")
}
```

Slog has a default logger that formats and sends messages to the standard output. If you save and run the file, you will see the output looking like the following:

```
2023/04/01 18:01:53 INFO This is an Info message
2023/04/01 18:01:53 WARN This is a Warning message
2023/04/01 18:01:53 ERROR This is an Error message
```

Currently, the messages are unstructured. To make the messages structured, you can create a logger, which lets you choose the log message format.

Let's structure the messages using Logfmt with the following example:

```go
package main

import (
    "os"

    "golang.org/x/exp/slog"
)

func main() {
    logger := slog.New(slog.NewTextHandler(os.Stdout))

    logger.Debug("This is a Debug message")
    logger.Info("This is an Info message")
    logger.Warn("This is a Warning message")
    logger.Error("This is an Error message")
}
```

`slog.New()` creates a logger, and takes a handler, which is used to customize the format of a message and the destination. The `NewTextHandler()` method formats the message in Logfmt format and forwards the message to the standard output.

After you run the file, the output will show you a sequence of key=value pairs that machines can parse:

```
// Output
time=2023-04-01T18:14:25.593+02:00 level=INFO msg="This is an Info message"
time=2023-04-01T18:14:25.593+02:00 level=WARN msg="This is a Warning message"
time=2023-04-01T18:14:25.593+02:00 level=ERROR msg="This is an Error message"
```

To use the JSON format instead, all you have to do is replace `NewTextHandler` with `NewJSONHandler`:

```go
package main

import (
    "os"

    "golang.org/x/exp/slog"
)

func main() {
    logger := slog.New(slog.NewJSONHandler(os.Stdout)) // <-

    logger.Debug("This is a Debug message")
    logger.Info("This is an Info message")
    logger.Warn("This is a Warning message")
    logger.Error("This is an Error message")
}
```

```
// Output
{"time":"2023-04-01T18:18:36.766631319+02:00","level":"INFO","msg":"This is an Info message"}
{"time":"2023-04-01T18:18:36.766862142+02:00","level":"WARN","msg":"This is a Warning message"}
{"time":"2023-04-01T18:18:36.766878299+02:00","level":"ERROR","msg":"This is an Error message"}
```

You can add also add custom fields to the message, the following simplified examples show you how to do it:

```go
package main

import (
    "os"

    "golang.org/x/exp/slog"
)

func main() {
    jsonHandler := slog.NewJSONHandler(os.Stdout)
    logger := slog.New(jsonHandler)

    logger.Info("This is an Info message", slog.Int("version", 1.0))  // <-
}
```

`slog.Int()` is an [attr](https://pkg.go.dev/golang.org/x/exp/slog#Attr), which is a key-pair value.

Running the file yields the following:

```
// Output
{"time":"2023-04-01T18:42:37.141663541+02:00","level":"INFO","msg":"This is an Info message","version":1}
```

The log message now has an extra field `version` with a value `1`.

There is a lot to unpack about Slog, see the [documentation](https://pkg.go.dev/golang.org/x/exp/slog) for more details.

### #4 apex/log

If you haven't decided on the logging library to use yet, you can consider the [apex/log](https://github.com/apex/log) library. It is a structured logging library, which at the time of writing has over 1.3K stars.

Here are some of the interesting features:

- structured logging with JSON or Logfmt
- customizing log messages
- filtering logs
- forwarding logs to multiple destinations.

### How to Use apex/log

Download the package with the following command:

```
go get -u github.com/apex/log
```

Create an `apex_demo.go` file with the following content:

```go
package main

import (
    "os"

    "github.com/apex/log"
    "github.com/apex/log/handlers/json"
)

func main() {
    log.SetHandler(json.New(os.Stdout))

    log.Debug("This is a debug message")
    log.Info("This is an info message")
    log.Warn("This is a warning message")
    log.Error("This is an error message")
}
```

`SetHandler()` customizes the message, as well as set the destination to send the logs.

The following is the output the code yields:

```
{"fields":{},"level":"info","timestamp":"2023-04-01T19:45:46.858501259+02:00","message":"This is an info message"}
{"fields":{},"level":"warn","timestamp":"2023-04-01T19:45:46.858836484+02:00","message":"This is a warning message"}
{"fields":{},"level":"error","timestamp":"2023-04-01T19:45:46.858856503+02:00","message":"This is an error message"}
```

Similar to the other logging libraries, the `apex/log` includes the level, timestamp, and message with minimal effort.

You can also add extra fields to the message as shown in the following:

```go
func main() {
    log.SetHandler(json.New(os.Stdout))
    ctx := log.WithFields(log.Fields{
                "version": 1.0,
        })


    // update the following lines with ctx
    ctx.Debug("This is a debug message")
    ctx.Info("This is an info message")
    ctx.Warn("This is a warning message")
    ctx.Error("This is an error message")
}
```

The output looks like this once you run the file:

```
// Output
{"fields":{"version":1},"level":"info","timestamp":"2023-04-01T20:04:05.704981836+02:00","message":"This is an info message"}
{"fields":{"version":1},"level":"warn","timestamp":"2023-04-01T20:04:05.70530574+02:00","message":"This is a warning message"}
{"fields":{"version":1},"level":"error","timestamp":"2023-04-01T20:04:05.705329404+02:00","message":"This is an error message"}
```

Now the `version` field shows up in all the log messages.

We have looked at a few basic features in this section, for more information, take a look at the [documentation](https://github.com/apex/log).

### #5 Logrus

[Logrus](https://github.com/sirupsen/logrus) is one of the oldest structured logging library available for Go. While its performance is not as good as the libraries we saw earlier in this post, it is still a good library to use. Note that it is currently in maintenance mode, and new features won't be introduced. So keep that in mind if you want to start using it.

The following are some of the features:

- Structured logging support.
- Has an API compatible with the standard library `log`.
- Supports adding extra fields to log messages.
- customizing log messages.
- extensible.

### How to Use Logrus

Install the package as follows:

```
go get -u github.com/sirupsen/logrus
```

Create the `logrus_demo.go` file as follows:

```go
package main

import (
    log "github.com/sirupsen/logrus"
)

func main() {
    log.SetFormatter(&log.JSONFormatter{})
    log.Debug("This is a debug message")
    log.Info("This is an info message")
    log.Warn("This is a warning message")
    log.Error("This is an error message")
}
```

`SetFormatter()` formats the messages in JSON format. You then invoke some log methods, corresponding to the supported levels. Other levels we haven't included are `TRACE`, `FATAL`, and `PANIC`.

The output will look the following when you run the file:

```
# Output
{"level":"info","msg":"This is an info message","time":"2023-04-01T19:07:33+02:00"}
{"level":"warning","msg":"This is a warning message","time":"2023-04-01T19:07:33+02:00"}
{"level":"error","msg":"This is an error message","time":"2023-04-01T19:07:33+02:00"}
```

In the output, the message with the `DEBUG` level is omitted. This is because Logrus defaults to a minimum level of `INFO`. You can customize this with the `SetLevel()` method:

```go
package main

import (
    log "github.com/sirupsen/logrus"
)

func main() {
    log.SetFormatter(&log.JSONFormatter{})
    log.SetLevel(log.ErrorLevel)      // <- add this line
    log.Debug("This is a debug message")
    log.Info("This is an info message")
    log.Warn("This is a warning message")
    log.Error("This is an error message")
}
```

```
// Output
{"level":"error","msg":"This is an error message","time":"2023-04-01T19:11:44+02:00"}
```

Logrus now has a minimum level of `ERROR`, and will show messages more severe than `ERROR`, such as `FATAL`, and `PANIC`.

If you want to learn more about Logrus features, read through the [documentation](https://github.com/sirupsen/logrus).

## Conclusion

In this article, we looked at the 5 best logging libraries for Go. We hope you have now chosen the logging library for your next project. If you are still undecided, we would suggest you go with Zap, but keep a close eye on Slog, which will soon be part of the core library. It also is having a positive reception within the Go community.
