package queryparser

import (
	"strings"
	"unicode"
)

type Filters struct {
	Body       []string
	Attributes map[string][]string
}

// Parses a query string into Attributes and Body (not keyed attributes)
// Example: some message email:foo@bar.com service:image-processor email:baz@buzz.com
// =>
// Body -> []string{"some", "message"}
// Attributes -> map[string][]string{"email": {"foo@bar.com", "baz@buzz.com"}, "service": {"image-processor"}}
func Parse(query string) Filters {
	filters := Filters{
		Attributes: make(map[string][]string),
	}

	queries := splitQuery(query)

	for _, q := range queries {
		parts := strings.SplitN(q, ":", 2)

		if len(parts) == 1 && len(parts[0]) > 0 {
			body := parts[0]

			if strings.Contains(body, "*") {
				body = strings.ReplaceAll(body, "*", "%")
				filters.Body = append(filters.Body, body)
			} else {
				splitBody := strings.FieldsFunc(body, isSeparator)
				filters.Body = append(filters.Body, splitBody...)
			}
		} else if len(parts) == 2 {
			key, value := parts[0], parts[1]

			wildcardValue := strings.ReplaceAll(value, "*", "%")

			filters.Attributes[key] = append(filters.Attributes[key], wildcardValue)
		}
	}

	return filters
}

func isSeparator(r rune) bool {
	return !unicode.IsLetter(r) && !unicode.IsDigit(r)
}

// Splits the query by spaces _unless_ it is quoted
// "some thing" => ["some", "thing"]
// "some thing 'spaced string' else" => ["some", "thing", "spaced string", "else"]
func splitQuery(query string) []string {
	var result []string
	inquote := false
	i := 0
	for j, c := range query {
		if c == '"' {
			inquote = !inquote
		} else if c == ' ' && !inquote {
			result = append(result, unquoteAndTrim(query[i:j]))
			i = j + 1
		}
	}
	return append(result, unquoteAndTrim(query[i:]))
}

func unquoteAndTrim(s string) string {
	return strings.ReplaceAll(strings.Trim(s, " "), `"`, "")
}
