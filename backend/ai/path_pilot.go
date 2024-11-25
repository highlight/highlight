package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/hashicorp/go-retryablehttp"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/storage"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	"io"
	"net/http"
	"strings"
)

type NarrationChunk struct {
	ChunkID   int64  `json:"n"`
	Narration string `json:"narration"`
	Timestamp struct {
		Start int64 `json:"start"`
		End   int64 `json:"end"`
	} `json:"timestamp"`
}

func GetPathPilotSessionNarration(ctx context.Context, sc storage.Client, projectID int, sessionID int) (string, error) {
	path, err := sc.GetDirectDownloadURL(ctx, projectID, sessionID, storage.SessionContentsCompressed, nil)
	if path == nil || err != nil {
		return "", err
	}

	retryClient := retryablehttp.NewClient()
	retryClient.RetryMax = 5
	headers := http.Header{
		"Content-Type":  []string{"application/json"},
		"Authorization": []string{fmt.Sprintf("Bearer %s", env.Config.PathPilotAPIKey)},
	}

	b, _ := json.Marshal(struct {
		URLs []string `json:"urls"`
	}{
		[]string{*path},
	})

	req, _ := retryablehttp.NewRequest(http.MethodPost, "https://uxob-api-e4fc.onrender.com/beta/ingest/replays", bytes.NewBuffer(b))
	req = req.WithContext(ctx)
	req.Header = headers

	resp, err := retryClient.Do(req)
	if err != nil {
		return "", err
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	if resp.StatusCode != http.StatusOK {
		log.WithContext(ctx).WithField("status_code", resp.StatusCode).WithField("body", string(body)).Error("pathpilot ingest failed")
		return "", e.New("not ok")
	}

	var ingestJson []struct {
		RunID string `json:"runId"`
		URL   string `json:"url"`
	}
	if err := json.Unmarshal(body, &ingestJson); err != nil {
		return "", err
	}
	if len(ingestJson) < 1 {
		log.WithContext(ctx).WithField("projectID", projectID).WithField("sessionID", sessionID).WithField("body", body).Error("no session narration run id")
		return "", e.New("no session narration run id")
	}
	runId := ingestJson[0].RunID

	req, _ = retryablehttp.NewRequest(http.MethodGet, fmt.Sprintf("https://uxob-api-e4fc.onrender.com/beta/ingest/run/%s/narration", runId), nil)
	req = req.WithContext(ctx)
	req.Header = headers

	resp, err = retryClient.Do(req)
	if err != nil {
		return "", err
	}
	body, err = io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	// TODO(vkorolik) poll here
	if resp.StatusCode != http.StatusOK {
		log.WithContext(ctx).WithField("status_code", resp.StatusCode).WithField("body", string(body)).Error("pathpilot narration lookup failed")
		return "", e.New("not ok")
	}

	var narrationJson struct {
		Timestamp int64             `json:"start_timestamp"`
		Chunks    []*NarrationChunk `json:"chunks"`
	}
	if err := json.Unmarshal(body, &narrationJson); err != nil {
		return "", err
	}

	return strings.Join(lo.Map(narrationJson.Chunks, func(item *NarrationChunk, _ int) string {
		return item.Narration
	}), ". "), nil
}
