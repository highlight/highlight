package model

import (
	"fmt"

	"github.com/lib/pq"

	"github.com/99designs/gqlgen/graphql"
)

func MarshalStringArray(sa pq.StringArray) graphql.Marshaler {
	if sa == nil {
		return graphql.Null
	}
	return graphql.MarshalAny(sa)
}

func UnmarshalStringArray(i interface{}) (pq.StringArray, error) {
	if i == nil {
		return nil, nil
	}
	ia, ok := i.([]interface{})
	if !ok {
		return nil, fmt.Errorf("This is not an array: %v %T", i, i)
	}
	sa := []string{}
	for _, o := range ia {
		s, ok := o.(string)
		if !ok {
			return nil, fmt.Errorf("This is not a string array: %v %T", i, i)
		}
		sa = append(sa, s)
	}
	return sa, nil
}
