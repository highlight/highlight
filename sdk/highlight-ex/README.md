# Highlight Elixir SDK

This repository contains the source code for the `Highlight` Elixir SDK, which integrates with OpenTelemetry to provide exception tracking, logging, and monitoring capabilities for Elixir applications.

## Prerequisites

Before you start, make sure you have the following installed on your system:

- **Elixir** (version 1.10 or later)
- **Erlang/OTP** (compatible with your Elixir version)

To check if Elixir and Erlang/OTP are installed, run:

```sh
elixir -v
```

You should see output similar to:

```sh
Erlang/OTP 25 [erts-11.1.3] [source] [64-bit]
Elixir 1.13.4 (compiled with Erlang/OTP 25)
```

## Setting Up the Development Environment

After cloning the repository, you need to install the dependencies. Use the following command:

```sh
mix deps.get
```

This will download and install all necessary dependencies required for the project.

## Compiling the Project

To compile the project, run:

```sh
mix compile
```

This ensures that all the modules are compiled and ready for use.

## Running Tests

To ensure that everything is set up correctly and that your changes don't break any existing functionality, run the tests:

```sh
mix test
```

This will execute the test suite and provide you with feedback on the status of the codebase.

## Running the Project

You can start an interactive Elixir shell with the project loaded by running:

```sh
iex -S mix
```

This is useful for testing the library interactively.
