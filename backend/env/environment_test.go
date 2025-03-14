package env

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestGetFrontendCookieDomain(t *testing.T) {
	Config.FrontendUri = "https://localhost:3000"
	domain, err := GetFrontendCookieDomain()
	assert.NoError(t, err)
	assert.Equal(t, ".localhost", domain)

	Config.FrontendUri = "https://app.highlight.io"
	domain, err = GetFrontendCookieDomain()
	assert.NoError(t, err)
	assert.Equal(t, ".highlight.io", domain)

	Config.FrontendUri = "https://backend.hobby.highlight.io"
	domain, err = GetFrontendCookieDomain()
	assert.NoError(t, err)
	assert.Equal(t, ".highlight.io", domain)
}
