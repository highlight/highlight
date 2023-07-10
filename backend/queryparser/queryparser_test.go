package queryparser

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParse(t *testing.T) {
	var tests = []struct {
		got  string
		want map[string]string
	}{
		{"email:foo@bar.com", map[string]string{
			"email": "foo@bar.com",
		}},
		{"email", map[string]string{}},
		{"email:", map[string]string{
			"email": "",
		}},
		{"", map[string]string{}},
	}

	for _, tt := range tests {
		t.Run(tt.got, func(t *testing.T) {
			assert.Equal(t, tt.want, Parse(tt.got))
		})
	}

}
