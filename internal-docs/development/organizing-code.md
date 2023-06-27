# Organizing code

**This doc was created as a result of a team retrospective. Anyone who has opinions can and should edit this document to improve the experience for Highlight developers.**

## Backend

One big challenge new developers at Highlight (particularly those without Go experience) is overcoming the fact that much of our code is contained in giant files (`schema.resolvers.go` or `resolver.go`). This is largely a result of not trying to create new files that deviate away from [gqlgen](https://gqlgen.com/) as well as the fact that Go is generally of the mindset that there is nothing objectively wrong this approach.

However, as we grow, there will become more of a demand to split the codebase, namely:

* Attributing ownership to an individual to a team based on a directory/file path.
* Testing in isolation.
* Reducing the amount of [copy/pasted code](https://github.com/highlight/highlight/pull/5626#issuecomment-1589751236).

Therefore, we propose the following workflow for deciding where one's code should go:

### The `store` directory

We use [GORM](https://gorm.io) as our ORM to Postgres. It has several gotchas that are difficult for new developers. Use this directory to create thin wrappers around GORM calls as well as side effects such as updating other data stores (e.g. OpenSearch).

Examples:

- [#5354](https://github.com/highlight/highlight/pull/5354)
- [#5557](https://github.com/highlight/highlight/pull/5557)

### Adding to product-specific functionality

If you have some type of product specific functionality, move your logic into a directory that most closely matches that feature. Ideally, these directories do not touch a data store (if so, they probably should be in the `store` directory for better reuse).

Examples:

- [errors](https://github.com/highlight/highlight/pull/5557)
- [integrations](https://github.com/highlight/highlight/pull/3472)

*Note: the `errors` product directory is named `errorgroups` to avoid conflicts with the internal Go [`errors` package](https://pkg.go.dev/errors).*


### Adding to schema.resolvers.go and resolver.go

Naming can actually be pretty challenging, especially in Go. When in doubt, just add to these files as usual.