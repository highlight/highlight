package vercel

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/openlyinc/pointy"
	"github.com/segmentio/encoding/json"
	"github.com/stretchr/testify/assert"
)

func TestCreateLogDrain(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v2/integrations/log-drains" {
			t.Errorf("Expected to request '/fixedvalue', got: %s", r.URL.Path)
		}
		var resp struct {
			Url            string
			Name           string
			Headers        map[string]string
			ProjectIds     []string
			DeliveryFormat string
			Secret         string
			Sources        []string
		}
		data, _ := io.ReadAll(r.Body)
		if err := json.Unmarshal(data, &resp); err != nil {
			t.Error(err)
		}

		assert.Equal(t, "https://pub.highlight.run/vercel/v1/logs", resp.Url)
		assert.Equal(t, "Highlight Log Drain", resp.Name)
		assert.Equal(t, "1", resp.Headers[LogDrainProjectHeader])
		assert.Equal(t, []string{"prj_UYboDfJ3kTGcKmmqu4Ydryzy2KQC"}, resp.ProjectIds)
		assert.Equal(t, "ndjson", resp.DeliveryFormat)
		assert.Equal(t, "1", resp.Secret)
		assert.Equal(t, []string{"static", "lambda", "edge", "build", "external"}, resp.Sources)

		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	ApiBaseUrl = server.URL
	if err := CreateLogDrain(context.TODO(), pointy.String("team_FRV1rjc2RxkhqoTsz8t76fGs"), []string{"prj_UYboDfJ3kTGcKmmqu4Ydryzy2KQC"}, "1", "Highlight Log Drain", "b81LedZpnZtAVrPy5kIdEgWi"); err != nil {
		t.Errorf("failed to create log drain")
	}
}
