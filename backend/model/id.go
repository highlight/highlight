package model

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/99designs/gqlgen/graphql"
)

func MarshalInt64ID(i int64) graphql.Marshaler {
	return graphql.MarshalAny(i)
}

func UnmarshalInt64ID(v any) (int64, error) {
	switch v := v.(type) {
	case string:
		return strconv.ParseInt(v, 10, 64)
	case int:
		return int64(v), nil
	case int64:
		return v, nil
	case json.Number:
		return strconv.ParseInt(string(v), 10, 64)
	default:
		return 0, fmt.Errorf("%T is not an int", v)
	}
}
