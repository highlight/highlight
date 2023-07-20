package queryparser

import "strings"

func Parse(query string) map[string]string {
	parsed := map[string]string{}

	queries := strings.Split(query, " ")

	for _, q := range queries {
		parts := strings.Split(q, ":")

		if len(parts) == 2 {
			parsed[parts[0]] = parts[1]
		}
	}

	return parsed
}
