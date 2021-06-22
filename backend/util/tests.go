package util

import (
	"encoding/json"
)

func MakeIntPointer(v int) *int {
	return &v
}

func MakeStringPointer(v string) *string {
	return &v
}

func MakeStringPointerFromInterface(v interface{}) *string {
	exampleErrorTraceBytes, _ := json.Marshal(&v)
	exampleErrorTraceString := string(exampleErrorTraceBytes)
	return &exampleErrorTraceString
}
