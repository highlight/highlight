---
"@highlight-run/nest": minor
---

Add GraphQL support to `HighlightInterceptor`. The interceptor now detects GraphQL execution contexts (via an optional, lazily-resolved `@nestjs/graphql` dependency) and traces operations with a `graphql.<type> <operationName>` span plus `graphql.operation.*` attributes, while keeping full REST backward compatibility.
