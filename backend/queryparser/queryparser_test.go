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

func TestParseMultipleValues(t *testing.T) {
	want := Filters{
		Attributes: map[string][]string{"email": {"foo@bar.com", "baz@buzz.com"}},
	}
	assert.Equal(t, want, Parse("email:foo@bar.com email:baz@buzz.com"))
}

func TestParseMultipleKeys(t *testing.T) {
	want := Filters{
		Attributes: map[string][]string{"email": {"foo@bar.com"}, "service": {"image-processor"}},
	}
	assert.Equal(t, want, Parse("email:foo@bar.com service:image-processor"))
}

func TestParseValueWithColon(t *testing.T) {
	want := Filters{
		Attributes: map[string][]string{"service": {"foo:bar:buzz"}},
	}
	assert.Equal(t, want, Parse("service:foo:bar:buzz"))
}

func TestParseWithSpaces(t *testing.T) {
	want := Filters{
		Attributes: map[string][]string{"service": {"image processor"}},
	}
	assert.Equal(t, want, Parse("service:\"image processor\""))
}

func TestParseWildcard(t *testing.T) {
	want := Filters{
		Attributes: map[string][]string{"email": {"%bar.com"}},
	}
	assert.Equal(t, want, Parse("email:*bar.com"))
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

// TODO(et) - https://github.com/highlight/highlight/issues/4713
// func TestParseBodyWithQuotes(t *testing.T) {
// 	want := Filters{
// 		Body:       []string{"something went wrong"},
// 		Attributes: map[string][]string{},
// 	}
// 	assert.Equal(t, want, Parse("\"something went wrong\""))
// }

func TestParseBodyWithAttributes(t *testing.T) {
	want := Filters{
		Body:       []string{"some", "message"},
		Attributes: map[string][]string{"email": {"foo@bar.com", "baz@buzz.com"}, "service": {"image-processor"}},
	}
	assert.Equal(t, want, Parse("some message email:foo@bar.com service:image-processor email:baz@buzz.com"))
}
