package assets

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCreateLogDrain(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(HandleAsset))
	defer server.Close()

	// TODO(vkorolik) https://app.highlight.io/~r/app/~r_top/font/Inter-Black.woff2?~r_rid=cikTELn9HHD3ofQoFhlrfn8O5S4
	resp, err := http.Get(fmt.Sprintf("%s/cors/foo", server.URL))
	assert.NoError(t, err)
	assert.Equal(t, resp.StatusCode, 200)
	assert.Greater(t, resp.ContentLength, 1000)
}
