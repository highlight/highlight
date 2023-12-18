This directory contains an [ANTLR](https://www.antlr.org/) grammar for parsing search strings and converting them to data structures we can use for things like syntax highlighting in the client, and building SQL queries on the server.

All the files in this directory are generated using the `generate:antlr4` command except for `SearchGrammar.g4`. The `.g4` file is the input for ANTLR that we use (via the ANTLR CLI) to generate the language-specific code we need.

If you make changes to the grammar file you will need to run `yarn generate:antlr4` to re-generate the files in thie directory.

In the future we will also have some Go files generated. At that point it might make sense to reorganize and move the grammar file somewhere else.
