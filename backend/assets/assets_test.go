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

	resp, err := http.Get(fmt.Sprintf("%s?src=test&url=https://preview.highlight.io/~r_app.webmanifest?~r_rid=knQ44NI79K8s_IOq_MbHMZ0JjqY", server.URL))
	assert.NoError(t, err)
	assert.Equal(t, resp.StatusCode, 200)
	assert.Greater(t, resp.ContentLength, int64(256))
}
