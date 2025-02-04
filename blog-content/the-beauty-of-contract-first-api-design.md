---
title: The beauty of contact-first API design
createdAt: 2022-08-24T12:00:00.000Z
readingTime: 18
authorFirstName: François
authorLastName: Wouts
authorTitle: Developer Happiness Engineer
authorTwitter: 'https://twitter.com/fwouts'
authorLinkedIn: 'https://linkedin.com/in/fwouts'
authorGithub: 'https://github.com/fwouts'
authorWebsite: 'https://fwouts.com/'
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2F39CS6bVyRBWbnq4ileQJ&w=3840&q=75
tags: Engineering
metaTitle: The beauty of contract-first API design
---

Web services have been around for a few decades, and we've seen a number of API patterns evolve over the years. It started with SOAP (originally named XML-RPC, if Wikipedia is to be trusted). Then we saw the rise of REST, often paired with JSON payloads.

Now, Twitter wisdom says we should use GraphQL, or perhaps gRPC. There's also a new kid on the block: tRPC.

These newer technologies have one thing in common: an improved developer experience enabled by explicit API contracts. Let's dig into what API contracts are and why they're important.

## **A common REST scenario**

Two developers have a meeting to discuss a new feature they need to build. The frontend dev shares the UX mocks and describes what they need from the backend. The backend dev goes away for a day or two and implements a couple of new REST endpoints. Once they're done, they send the frontend dev a Postman collection with a series of sample requests, which act as documentation.

The frontend dev then starts building their own code on top of it. They quickly realise that one of the endpoints is missing some data that needs to be shown in the UI, so they talk to the backend dev, who updates the endpoint's implementation the next day. This back-and-forth goes on with various tweaks to the endpoints over the duration of two weeks. The frontend dev gets a little frustrated. The backend dev isn't enjoying the process either and starts to grow resentful. How they wish there was a better way!

What we're missing here is an API contract, agreed upon before implementation even started. This could take the form of a simple text document that describes for each endpoint:

-   what the endpoint does, in unambiguous, human-friendly terms
-   its HTTP method and path (including any dynamic path parameters)
-   the request payload schema
-   the response payload schema
-   any other information such as headers, query parameters and so on
-   example requests and responses

Defining an explicit API contract early on enables the frontend dev to ensure that all the data they need will be there before the endpoint is implemented, while the backend dev has a clear blueprint to start from. It's still possible for either of them to forget a thing or two, but overall the need for rework will be significantly reduced.

With a well-defined API contract, our devs stay happy and productive. This is contract-first API design.

## **OpenAPI (aka Swagger)**

An alternative to a text document is to use the [_OpenAPI format_](https://www.openapis.org/ "https://www.openapis.org/"), which lets you formally describe REST APIs, down to the type of every request/response field, using YAML (or JSON). Here is how the official docs describe it:

_The OpenAPI Specification (OAS) defines a standard, language-agnostic interface to RESTful APIs which allows both humans and computers to discover and understand the capabilities of the service without access to source code, documentation, or through network traffic inspection._

Here is how you would use it to describe a GET /users endpoint:

```
openapi: 3.1.0
paths:
/users:
  get:
    summary: Returns a list of user names.
    responses:
      '200':
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/user"
components:
schemas:
  User:
    properties:
      id:
        type: integer
      name:
        type: string
```
OpenAPI is extremely helpful to understand the full depth of an API. One drawback however is its [_overwhelming complexity and verbosity_](https://spec.openapis.org/oas/v3.1.0 "https://spec.openapis.org/oas/v3.1.0"). It can be difficult to write correct OpenAPI specs manually, and it's fairly difficult to read for the untrained eye. Until recently, the syntax to describe schemas (such as User above) was inspired by [_JSON Schema_](https://json-schema.org/ "https://json-schema.org/") but subtly different, especially when describing optional/nullable fields. Fortunately, OpenAPI 3.1 (released February 2021) brought about 100% compatibility with JSON Schema!

To work around the confusing nature of OpenAPI's syntax, there are a number of GUI editors you can use to read and edit OpenAPI contracts. [_OpenAPI.tools_](https://openapi.tools "https://openapi.tools") has a helpful list including compatibility with each version of OpenAPI. Alternatively, you can use a DSL to generate OpenAPI. Although I'm no longer involved in the project, I can recommend [_Spot_](https://github.com/airtasker/spot "https://github.com/airtasker/spot") for this use case.

Once you have an OpenAPI contract, it can be leveraged to generate documentation, data validators, client libraries, and even server code boilerplate.

Let's now consider the same scenario, but with an OpenAPI contract in the picture.

The backend dev starts by adding the new endpoints to the existing OpenAPI contract and sends it to the frontend dev to review. The frontend dev identifies a few missing fields and sends their feedback. A couple of rounds of comments later, the new OpenAPI contract is ready. The backend dev goes away for a day or two and implements the required backend changes.

In the meantime, the frontend dev uses an [_OpenAPI code generator_](https://github.com/OpenAPITools/openapi-generator "https://github.com/OpenAPITools/openapi-generator") to auto-generate an updated API client library. This allows them to build the entire feature, including tests, using mocked out data. Once the backend is implemented, it just works. The end.

Using this contract-first API design approach, not only do we avoid multiple rounds of rework of the backend, we can also parallelise work: the frontend can be built at the same time as the backend. All that's left is testing their integration, which is trivial thanks to the contract.

## **GraphQL**

[_GraphQL_](https://graphql.org/ "https://graphql.org/") is a graph-based API architecture designed by Facebook. You define your nodes, their fields and relationships to other nodes, then a client can query those nodes in a very efficient way, only requesting the fields it needs, and fetching any related nodes in a single query. Instead of HTTP endpoints, GraphQL uses the concept of "queries", which are entry points to the node graph. For example the query "human(id: String)" would let you fetch a given Human node by its ID, along with any related nodes (e.g. friends, reviews, etc).

```
// An example type definition in GraphQL.
// See https://graphql.org/learn/schema/#type-system

type Query {
  human(id: ID!): Human
}

type Human {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  starships: [Starship]
  totalCredits: Int
}
```
Here is an example query specifying just one field name to be sent back:
```
query {
  human(id: "1000") {
    name
  }
}
// GraphQL uses JSON as its serialisation format. Here is a response for that query:
{
  "data": {
    "human": {
       "name": "Obiwan Kenobi"
    }
  }
}
```
In this scenario, the [_GraphQL schema_](https://graphql.org/ "https://graphql.org/") is the contract. Once both developers have agreed on the new GraphQL schema, the backend dev implements the backend changes while the frontend dev uses [_GraphQL Code Generator_](https://www.graphql-code-generator.com/ "https://www.graphql-code-generator.com/") to automatically generate a type-safe client library based on the new GraphQL schema.

Just like with OpenAPI, we've managed to parallelise work, reduce rework and keep everyone happy.

_Here comes the ad!_

Once you've adopted a contract-first API design process, all that's left is making sure you can easily debug issues across your frontend and backend. When that happens, you want to know exactly how the bug triggered. Wouldn't it be great if you could visualise the steps the user took before it happened? You can do that using [_Highlight_](https://www.highlight.io/ "https://www.highlight.io/")'s session replay feature, while viewing stack traces across both frontend and backend.

<BlogCallToAction />

## **gRPC**

[_gRPC_](https://grpc.io/ "https://grpc.io/") is a language-agnostic RPC-based API architecture designed by Google. It's based on HTTP/2 and in most scenarios, it uses [_protocol buffers_](https://developers.google.com/protocol-buffers "https://developers.google.com/protocol-buffers") as its serialisation format. Each data type (called "message") can be efficiently encoded in binary form thanks to the use of field indexes instead of field names:

```
// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```
Instead of HTTP endpoints, you define RPC methods in a service definition:

```
// The greeter service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}
```
How you use gRPC depends on the language you're using, but it would look roughly like:

```
greeterService.sayHello({
  name: "World"
});

// returns { "message": "Hello, World!" }
```

You'll find that gRPC is less common in web frontend/backend scenarios, mainly because [_Web-gRPC_](https://grpc.io/docs/platforms/web/basics/ "https://grpc.io/docs/platforms/web/basics/") is fairly new and requires a little more setup (plain gRPC requires access to HTTP/2 frames, which aren't exposed by standard browser APIs, hence the need for Web-gRPC—see the [_gRPC blog for details_](https://grpc.io/blog/state-of-grpc-web/#the-grpc-web-spec "https://grpc.io/blog/state-of-grpc-web/#the-grpc-web-spec")).

You may wonder how our scenario would have worked if the backend exposed a gRPC API instead of REST or GraphQL. The process is really quite similar. The main difference is that, instead of updating an OpenAPI contract or a GraphQL schema, the API contract consists of protocol buffers definitions.

Unlike REST or GraphQL, where using a code generator for API clients is optional, gRPC requires it because of the custom serialisation mechanism inherent to protocol buffers (which isn't plain JSON). Just like before, the frontend dev can use the updated protocol buffers definitions and work in parallel with the backend dev, until it's time to integrate.

## **tRPC**

[_tRPC_](https://trpc.io/ "https://trpc.io/") is an alternative API technology that's taking off in 2022. It relies primarily on TypeScript to enable a type-safe API between frontend and backend. You'll need a monorepo to use it (but you're already using a monorepo anyway, right?).

Here is an example endpoint definition with tRPC on the server-side:

```
import * as trpc from '@trpc/server';
import { z } from 'zod';

export const appRouter = trpc.router().query('hello', {
  input: z.object({
    name: z.string(),
 }),
  resolve({ input }) {
    return {
      greeting: `Hello, ${input.name}!`,
    };
  },
});
```
And here is how you use it from the client:
```
const hello = trpc.useQuery(['hello', { text: 'World' }]);

// hello.data.greeting = "Hello, World!"
```
tRPC is different from REST. It has[_its own RPC specification_](https://trpc.io/docs/rpc "https://trpc.io/docs/rpc") based on JSON, with support for batching.

In the case of tRPC, the API contract may or may not be explicit. In the example above, we've explicitly defined the request type with input, but the response type is implicitly defined via the return type of resolve().

We could rewrite the example to use an explicit contract with both input and output:
```
import * as trpc from '@trpc/server';
import { z } from 'zod';

export const appRouter = trpc.router().query('hello', {
  input: z.object({
    name: z.string(),
  }),
  output: z.object({
    greeting: z.string(),
  }),
  resolve({ input }) {
    return {
      greeting: `Hello, ${input.name}!`,
    };
  },
});
```

This opens the door to the same kind of contract-first API design that we've seen with OpenAPI, GraphQL and gRPC: the backend dev can define input and output and ask the frontend dev to review this contract, then the frontend dev can implement their own code by returning a hardcoded, dummy response in resolve() while the backend dev implements the real deal.

## **Summarising**

While REST (with OpenAPI), GraphQL, gRPC and tRPC are very different approaches to API design, they share one important aspect: they all enable a contract-first API design process, which streamlines collaboration between frontend and backend.

API contracts also enable a wide array of developer tools that can save time and eliminate entire categories of bugs. For example, when using an auto-generated OpenAPI client library, frontend devs don't need to manually write any code to hit a particular API endpoint. This means they also can't use the wrong URL path, or the wrong field name, or the wrong field type, and so on.

API contracts can also strengthen the backend. While GraphQL and gRPC automatically validate all incoming requests, you typically need to write validation code manually for REST endpoints. Not so with OpenAPI: just use [_auto-generated data validators_](https://openapi.tools/#data-validators "https://openapi.tools/#data-validators") instead!
