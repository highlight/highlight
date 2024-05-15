package listener

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

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

func TestUnquote(t *testing.T) {
	for _, tc := range testCases {
		// Call the function with the test case
		output := Unquote(tc.input)
		assert.Equal(t, tc.expectedOutput, output)
	}
}
