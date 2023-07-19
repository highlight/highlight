package queryparser

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParse(t *testing.T) {
	want := Filters{
		Attributes: map[string][]string{"email": {"foo@bar.com"}},
	}
	assert.Equal(t, want, Parse("email:foo@bar.com"))
}

func TestParseNoValue(t *testing.T) {
	want := Filters{
		Attributes: map[string][]string{"email": {""}},
	}
	assert.Equal(t, want, Parse("email:"))
}

func TestParseEmptyString(t *testing.T) {
	want := Filters{
		Attributes: map[string][]string{},
	}
	assert.Equal(t, want, Parse(""))
}

func TestParseBody(t *testing.T) {
	want := Filters{
		Body:       []string{"email"},
		Attributes: map[string][]string{},
	}
	assert.Equal(t, want, Parse("email"))
}

func TestParseBodyWithWildcard(t *testing.T) {
	want := Filters{
		Body:       []string{"%email%"},
		Attributes: map[string][]string{},
	}
	assert.Equal(t, want, Parse("*email*"))
}
