package main

import (
	"testing"

	"github.com/aws/smithy-go/ptr"
	"github.com/stretchr/testify/assert"
)

// workaround for setting flag
var _ = func() bool {
	testing.Init()
	return true
}()

var testCases = []struct {
	input          *string
	expectedOutput *string
}{
	{
		nil,
		nil,
	},
	{
		ptr.String(`[]`),
		nil,
	},
	{
		ptr.String(`["production"]`),
		ptr.String("environment!=production"),
	},
	{
		ptr.String(`["production", "development"]`),
		ptr.String("environment!=(production OR development)"),
	},
	{
		ptr.String(`["production", "development", "local"]`),
		ptr.String("environment!=(production OR development OR local)"),
	},
}

func TestTranslateEnvironments(t *testing.T) {
	for _, tc := range testCases {
		// Call the function with the test case
		output, err := translateEnvironments(tc.input)
		assert.Nil(t, err)

		if tc.expectedOutput == nil {
			assert.Nil(t, output)
		} else {
			assert.Equal(t, *tc.expectedOutput, *output)
		}
	}
}
