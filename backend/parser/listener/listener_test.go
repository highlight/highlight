package listener

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUnquote(t *testing.T) {
	var testCases = []struct {
		input          string
		expectedOutput string
	}{
		{
			"test",
			"test",
		},
		{
			`"test"`,
			"test",
		},
		{
			`"\w\w"`,
			"\\w\\w",
		},
		{
			`'\w\w'`,
			"\\w\\w",
		},
	}

	for _, tc := range testCases {
		// Call the function with the test case
		output := Unquote(tc.input)
		assert.Equal(t, tc.expectedOutput, output)
	}
}

func TestNumericValue(t *testing.T) {
	var testCases = []struct {
		value          string
		key            string
		expectedOutput string
	}{
		{
			"10",
			"",
			"10",
		},
		{
			"10",
			"Duration",
			"10",
		},
		{
			"other",
			"Duration",
			"other",
		},
		{
			"10s",
			"Duration",
			"10000000000",
		},
		{
			"10s",
			"Length",
			"10000",
		},
		{
			"10s",
			"ActiveLength",
			"10000",
		},
		{
			"10s",
			"OtherKey",
			"10000000000",
		},
		{
			"10s",
			"",
			"10000000000",
		},
		{
			"10ns",
			"Length",
			"0",
		},
	}

	for _, tc := range testCases {
		// Call the function with the test case
		output := NumericValue(tc.value, tc.key)
		assert.Equal(t, tc.expectedOutput, output)
	}
}
