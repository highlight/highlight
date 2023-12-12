This directory contains an [ANTLR](https://www.antlr.org/) grammar for parsing search strings and converting them to data structures we can use for things like syntax highlighting in the client, and building SQL queries on the server.

Many files in this directory are generated using the `generate:antlr4` commaned. The only files we maintain by hand are:

**ANTLR Files**
* `SearchGrammar.g4` - This is the raw grammar that ANTLR uses. From here we rely on the ANTLR CLI to generate the language-specific code we need.

**TypeScript Files**
* `utils.(test.)ts` - This contains helpers for running all the generated code + our custom TypeScript [listener](https://tomassetti.me/listeners-and-visitors/).
* `listener.ts` - Our custom listener for capturing data about the query and creating an object we can use in the client for showing a visual representation of the query with syntax highlight and errors.

In the future we will also have some Go files generated. At that point it might make sense to reorganize and move the grammar file somewhere else.
