package util

import "encoding/json"

func JsonStringToStringArray(s string) []*string {
	var eventInterface interface{}
	if err := json.Unmarshal([]byte(s), &eventInterface); err != nil {
		return nil
	}
	// the event interface is either in the form 'string' or '[]string':
	if val, ok := eventInterface.(string); ok {
		return []*string{&val}
	}
	if val, ok := eventInterface.([]interface{}); ok {
		ret := []*string{}
		for _, v := range val {
			if s, ok := v.(string); ok {
				ret = append(ret, &s)
			}
		}
		return ret
	}
	return nil
}
