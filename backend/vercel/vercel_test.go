package vercel

import (
	"context"
	"encoding/json"
	"fmt"
	http2 "github.com/highlight-run/highlight/backend/http"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/openlyinc/pointy"
	"github.com/stretchr/testify/assert"
)

func TestCreateLogDrain(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/v2/integrations/log-drains" {
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
			assert.Equal(t, "1", resp.Headers[http2.LogDrainProjectHeader])
			assert.Equal(t, "vercel-project-name", resp.Headers[http2.LogDrainServiceHeader])
			assert.Equal(t, []string{"prj_UYboDfJ3kTGcKmmqu4Ydryzy2KQC"}, resp.ProjectIds)
			assert.Equal(t, "ndjson", resp.DeliveryFormat)
			assert.Equal(t, "1", resp.Secret)
			assert.Equal(t, []string{"static", "lambda", "edge", "build", "external"}, resp.Sources)
		} else if r.URL.Path == "/v9/projects" {
			projectsResponse := struct {
				Projects   []*privateModel.VercelProject `json:"projects"`
				Pagination struct {
					Next int `json:"next"`
				} `json:"pagination"`
			}{
				Projects: []*privateModel.VercelProject{{
					ID:   "prj_UYboDfJ3kTGcKmmqu4Ydryzy2KQC",
					Name: "vercel-project-name",
					Env: []*privateModel.VercelEnv{{
						ID:              "abc",
						Key:             "def",
						ConfigurationID: "456",
					}},
				}},
				Pagination: struct {
					Next int `json:"next"`
				}(struct{ Next int }{
					Next: 0,
				}),
			}
			body, err := json.Marshal(&projectsResponse)
			assert.NoError(t, err)
			_, err = w.Write(body)
			assert.NoError(t, err)
		} else {
			err := fmt.Sprintf("Expected to request '/fixedvalue', got: %s", r.URL.Path)
			t.Error(err)
			http.Error(w, err, http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	ApiBaseUrl = server.URL
	if err := CreateLogDrain(context.TODO(), pointy.String("team_FRV1rjc2RxkhqoTsz8t76fGs"), []string{"prj_UYboDfJ3kTGcKmmqu4Ydryzy2KQC"}, "1", "Highlight Log Drain", "b81LedZpnZtAVrPy5kIdEgWi"); err != nil {
		t.Errorf("failed to create log drain")
	}
}
