---
title: Auto-generating OpenAPI documents with TypeScript interfaces
createdAt: 2022-10-01T12:00:00.000Z
readingTime: 8
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
metaTitle: Auto-generating OpenAPI documents with TypeScript interfaces
---

[OpenAPI](https://learn.openapis.org/specification/paths.html "https://learn.openapis.org/specification/paths.html") is a wonderful tool to explicitly document your REST API endpoints.

It’s also a particularly verbose YAML-based format that can be difficult to write by hand. Look at this [“simple” example](hthttps://github.com/OAI/learn.openapis.org/blob/main/examples/v3.1/tictactoe.yaml "https://github.com/OAI/learn.openapis.org/blob/main/examples/v3.1/tictactoe.yaml") from the official docs. It’s almost as if the [people who invented OpenAPI](https://swagger.io/ "https://swagger.io/") expected you to use a dedicated OpenAPI editor tool!

If you use TypeScript in your codebase, you might already have defined types such as request and response bodies for each of your endpoints:

```
export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
}

export type CreateUserResponse = {
  userId: string;
}
```

If you want to document your API with OpenAPI, you then need to carefully replicate this information in YAML format. This can be tedious and error-prone. Can we do better?

In fact, we can! Projects such as [tsoa](https://tsoa-community.github.io/docs/ "https://tsoa-community.github.io/docs/"), [Deepkit](https://twitter.com/MarcJSchmidt/status/1555571803241717760 "https://twitter.com/MarcJSchmidt/status/1555571803241717760") and [Spot](https://github.com/airtasker/spot "https://github.com/airtasker/spot") take your TypeScript code, run some magic, and spit out OpenAPI on the other end. How? We’re about to find out!

## **TypeScript Compiler API**

If you use TypeScript, you’re probably most familiar with the `tsc` tool. However, the `typescript` npm package offers much more than that. In particular, TypeScript lets you hook into its internals with the [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API "https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API"). Unlike the rest of the TypeScript project, this API is officially unstable. In practice, it’s however only seen minor breaking changes ([see history](https://github.com/microsoft/TypeScript/wiki/API-Breaking-Changes "https://github.com/microsoft/TypeScript/wiki/API-Breaking-Changes")). I’ve been using it since 2017, and I’ve only had to tweak my code once. Good job TypeScript team, as always :)

TypeScript Compiler API gives you the following functionality:

-   parsing TypeScript source files and reading their AST ([abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree "https://en.wikipedia.org/wiki/Abstract_syntax_tree"))
-   type-checking TypeScript programs, with detailed access to syntactic and semantic errors
-   inspecting the inferred type of any particular node in the AST
-   transforming the AST and printing out the modified source code
-   doing all kinds of shenanigans with virtual files and so on (even [type-checking code entirely in the browser](https://tseditor.fwouts.com/ "https://tseditor.fwouts.com/")!)

For example, say we have the following TypeScript file:

```
// example.ts

export type MyType = {
  foo: string;
  bar: number;
};
```

We can use the following code to extract information about `MyType`:

```
import path from "path";
import ts from "typescript";

const mainEntryPoint = path.join(__dirname, "example.ts");
const program = ts.createProgram([mainEntryPoint], {});
const typeChecker = program.getTypeChecker()!;

// Parse the main source file and look for type definitions.
const sourceFile = program.getSourceFile(mainEntryPoint)!;
for (const statement of sourceFile.statements) {
  if (ts.isInterfaceDeclaration(statement)) {
    console.log(`Encountered an interface named: ${statement.name.text}`);
    const type = typeChecker.getTypeAtLocation(statement);
    console.log(
      `Properties: ${type
        .getProperties()
        .map((p) => p.name)
        .join(", ")}`
    );
  }
}
```

This will print the following:
```
Encountered an interface named: MyType
Properties: foo, bar
```
We can go one step further and look at the type of each property:

```
for (const property of type.getProperties()) {
  console.log(`Property: ${property.name}`);
  console.log(typeChecker.getTypeAtLocation(property.valueDeclaration!));
}
```

Here is the output:

```
Property: foo
{
  flags: 4,     // matches the value of ts.TypeFlags.String
  id: 14,
  intrinsicName: 'string',
  objectFlags: 0
}
Property: bar
{
  flags: 8,     // matches the value of ts.TypeFlags.Number
  id: 15,
  intrinsicName: 'number',
  objectFlags: 0
}
```

This also works with more complex types such as arrays, unions, and so on. For example, when `type.isUnion()` is `true`, you can iterate through `type.types` to check each possible type.

We can go one step further and look at the inferred type of a particular variable. Say we have the following code:

```
// example.ts

function f() {
  return 123 as const;
}

const myVariable = f();
```

We can check the type of `myVariable` with:

```
const symbols = typeChecker.getSymbolsInScope(
  sourceFile,
  ts.SymbolFlags.Variable
);
const symbol = symbols.find((s) => s.name == "myVariable")!;
console.log(
  typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
);
```

This will tell us that TypeScript inferred its type as the number literal `123`:
```
{
  checker: ...
  flags: 256,     // matches the value of ts.TypeFlags.NumberLiteral
  id: 87,
  symbol: undefined,
  value: 123,
  regularType: ...
  freshType: ...
}
```

This means that we can take any TypeScript code and introspect not only types, but also variables in the codebase.

## **From TypeScript to OpenAPI**

Using this knowledge, it’s possible to transform TypeScript into [JSON Schema](https://json-schema.org/ "https://json-schema.org/"), and by extension OpenAPI (which is 100% compatible with JSON Schema since v3.1).

We’re not going to implement this here because it would take a few thousand lines of code. Instead, let’s walk through how the open-source project `tsoa` makes it all work.

First, let’s get familiar with the syntax that `tsoa` uses and walk through the following example from [the documentation](https://tsoa-community.github.io/docs/getting-started.html "https://tsoa-community.github.io/docs/getting-started.html"):

```
@Route("users")
export class UsersController extends Controller {
  @Get("{userId}")
  public async getUser(
    @Path() userId: number,
    @Query() name?: string
  ): Promise<User> {
    return new UsersService().get(userId, name);
  }

  @SuccessResponse("201", "Created") // Custom success response
  @Post()
  public async createUser(
    @Body() requestBody: UserCreationParams
  ): Promise<void> {
    this.setStatus(201); // set return status 201
    new UsersService().create(requestBody);
    return;
  }
}
```

How does `tsoa` transform this into an OpenAPI document?

It all starts with the [`ControllerGenerator` class](https://github.com/lukeautry/tsoa/blob/8d23f961621a6ae67a2498525d2e6766dc5faf6b/packages/cli/src/metadataGeneration/controllerGenerator.ts "https://github.com/lukeautry/tsoa/blob/8d23f961621a6ae67a2498525d2e6766dc5faf6b/packages/cli/src/metadataGeneration/controllerGenerator.ts"), which takes a controller definition and uses TypeScript to inspect arguments passed to each decorator. This extracts useful metadata such as each endpoint’s path, its HTTP method, query parameters, and so on. Each method (`getUser` and `createUser` here) gets processed by the [`MethodGenerator` class](https://github.com/lukeautry/tsoa/blob/8d23f961621a6ae67a2498525d2e6766dc5faf6b/packages/cli/src/metadataGeneration/methodGenerator.ts "https://github.com/lukeautry/tsoa/blob/8d23f961621a6ae67a2498525d2e6766dc5faf6b/packages/cli/src/metadataGeneration/methodGenerator.ts"). Each method parameter (such as `userId`, `name` and `requestBody`) is in turn processed by the [`ParameterGenerator` class](https://github.com/lukeautry/tsoa/blob/64f0885dc692c7bddc0d45c96c30ce0a6dc277c9/packages/cli/src/metadataGeneration/parameterGenerator.ts "https://github.com/lukeautry/tsoa/blob/64f0885dc692c7bddc0d45c96c30ce0a6dc277c9/packages/cli/src/metadataGeneration/parameterGenerator.ts").

The real magic happens in the [`TypeResolver` class](https://github.com/lukeautry/tsoa/blob/8d23f961621a6ae67a2498525d2e6766dc5faf6b/packages/cli/src/metadataGeneration/typeResolver.ts "https://github.com/lukeautry/tsoa/blob/8d23f961621a6ae67a2498525d2e6766dc5faf6b/packages/cli/src/metadataGeneration/typeResolver.ts"), where the type of each parameter is resolved and converted to `tsoa`'s internal type model. This is where the TypeScript Compiler API really comes into play. Looking at the code, you can see that covering every possible type isn’t easy. That’s already a thousand lines of code, albeit very well-structured and readable.

Once the code has been processed through the `ControllerGenerator` using the `TypeResolver`, `tsoa` has all the metadata it needs to output the corresponding OpenAPI document. Now, it’s just a matter of converting the metadata to the right format and output it as YAML. This happens in the [`generateSpec()` method](https://github.com/lukeautry/tsoa/blob/8d23f961621a6ae67a2498525d2e6766dc5faf6b/packages/cli/src/module/generate-spec.ts#L17 "https://github.com/lukeautry/tsoa/blob/8d23f961621a6ae67a2498525d2e6766dc5faf6b/packages/cli/src/module/generate-spec.ts#L17"), which in the case of OpenAPI 3 will invoke the [`SpecGenerator3` class](https://github.com/lukeautry/tsoa/blob/8d23f961621a6ae67a2498525d2e6766dc5faf6b/packages/cli/src/swagger/specGenerator3.ts#L18 "https://github.com/lukeautry/tsoa/blob/8d23f961621a6ae67a2498525d2e6766dc5faf6b/packages/cli/src/swagger/specGenerator3.ts#L18"). All that class does is convert from `tsoa`'s internal metadata format to the official OpenAPI 3 specification.

## **The cherry on top: automatic request validation**

The beauty of a tool such as `tsoa` is that it provides not only OpenAPI document generation, but also the ability to automatically validate incoming requests ([see documentation](https://tsoa-community.github.io/docs/error-handling.html#handling-validation-errors "https://tsoa-community.github.io/docs/error-handling.html#handling-validation-errors")). If a client attempts to send a payload field with a `number` when it should be a `string` for example, an error will be thrown before the endpoint is executed. We don’t need to write any validation code ourselves; that comes out of the box thanks to the types inferred by `tsoa` with the TypeScript Compiler API.

While an invalid request could come from a malicious hacker trying to break your API, it could also very well be an error in your client code. This is where [Highlight](https://highlight.io/ "https://highlight.io/") comes in. When an error is thrown, not only can you see the server-side error stack in Highlight, but you’ll be able to replay the session that led to this bug in the first place from the user’s perspective. Knowing what circumstances led to a particular bug can be essential to fix it!

<BlogCallToAction />

## **What will you use the TypeScript Compiler API for?**

Generating OpenAPI documents is but one possible application of the TypeScript Compiler API. You could also use it to [generate forms from types automatically](https://tseditor.fwouts.com/ "https://tseditor.fwouts.com/"), to [auto-generate React component properties](https://previewjs.com/docs/features/autogenerated-props "https://previewjs.com/docs/features/autogenerated-props"), and so on.

What will you use the TypeScript Compiler API for? [Let me know](https://twitter.com/fwouts "https://twitter.com/fwouts") and don’t hesitate to ask for help if you get stuck!
