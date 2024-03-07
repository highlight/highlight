---
toc: Overview
title: Logging in Rust
slug: logging-in-rust
---

Highlight.io supports logging in Rust via the [log](https://docs.rs/log/latest/log/) crate. The SDK automatically creates an [env_logger](https://docs.rs/env_logger/latest/env_logger/) and installs it globally, so you can use the log crate's logging facades to send logs both to the command line and to Highlight.

```hint
If you don't see one of your languages / frameworks below, reach out to us in our [community](https://highlight.io/community) or create an issue on [github](https://github.com/highlight/highlight/issues/new?assignees=&labels=external+bug+%2F+request&template=feature_request.md&title=).
```

<DocsCardGroup>
    <DocsCard title="actix-web" href="./actix.md">
        {"Integrate logging with actix-web."}
    </DocsCard>
    <DocsCard title="Without a framework" href="./other.md">
        {"Integrate logging without a framework."}
    </DocsCard>
</DocsCardGroup>
