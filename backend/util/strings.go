package util

import "encoding/json"

func JsonStringToStringArray(s string) []*string {
	var eventInterface []*string
	if err := json.Unmarshal([]byte(s), &eventInterface); err != nil {
		return []*string{&s}
	}
	return eventInterface
}
