package util

import (
	"encoding/json"
	"strings"
)

func JsonStringToStringArray(s string) []*string {
	var eventInterface []*string
	if err := json.Unmarshal([]byte(s), &eventInterface); err != nil {
		return []*string{&s}
	}
	return eventInterface
}

func StringContainsAnyOf(str string, substrings []string) bool {
	for _, s := range substrings {
		if strings.Contains(str, s) {
			return true
		}
	}
	return false
}
