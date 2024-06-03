package listener

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

type UnquoteTest struct {
	input          string
	expectedOutput string
}

func TestUnquote(t *testing.T) {
	var testCases = []UnquoteTest{
		{
			input:          "test",
			expectedOutput: "test",
		},
		{
			input:          `"test"`,
			expectedOutput: "test",
		},
		{
			input:          `"\w\w"`,
			expectedOutput: "\\w\\w",
		},
		{
			input:          `'\w\w'`,
			expectedOutput: "\\w\\w",
		},
	}

	for _, tc := range testCases {
		// Call the function with the test case
		output := Unquote(tc.input)
		assert.Equal(t, tc.expectedOutput, output)
	}
}

type NumericValueTest struct {
	value          string
	key            string
	expectedOutput string
}

func TestNumericValue(t *testing.T) {
	var testCases = []NumericValueTest{
		{
			value:          "10",
			key:            "",
			expectedOutput: "10",
		},
		{
			value:          "10",
			key:            "Duration",
			expectedOutput: "10",
		},
		{
			value:          "other",
			key:            "Duration",
			expectedOutput: "other",
		},
		{
			value:          "10s",
			key:            "Duration",
			expectedOutput: "10000000000",
		},
		{
			value:          "10s",
			key:            "Length",
			expectedOutput: "10000",
		},
		{
			value:          "10s",
			key:            "ActiveLength",
			expectedOutput: "10000",
		},
		{
			value:          "10s",
			key:            "OtherKey",
			expectedOutput: "10000000000",
		},
		{
			value:          "10s",
			key:            "",
			expectedOutput: "10000000000",
		},
		{
			value:          "10ns",
			key:            "Length",
			expectedOutput: "0",
		},
	}

	for _, tc := range testCases {
		// Call the function with the test case
		output := NumericValue(tc.value, tc.key)
		assert.Equal(t, tc.expectedOutput, output)
	}
}
