package assets

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandleAsset(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(HandleAsset))
	defer server.Close()

	resp, err := http.Get(fmt.Sprintf("%s?src=test&url=https://app.highlight.io/assets/index.css", server.URL))
	assert.NoError(t, err)
	assert.Equal(t, resp.StatusCode, 200)
	bd, err := io.ReadAll(resp.Body)
	assert.NoError(t, err)
	// should be at least 10KB decompressed
	assert.Greater(t, len(bd), 10_000)
}
