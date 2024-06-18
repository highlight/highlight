package prompts

import (
	_ "embed"
)

//go:embed search_cleaned.md
var SearchSyntaxDocs string

//go:embed error-search_cleaned.md
var ErrorSearch string

//go:embed log-search_cleaned.md
var LogSearch string

//go:embed session-search_cleaned.md
var SessionSearch string

//go:embed trace-search_cleaned.md
var TraceSearch string
