package http

import (
	"compress/gzip"
	"encoding/base64"
	"encoding/json"
	"github.com/google/uuid"
	model2 "github.com/highlight-run/highlight/backend/model"
	"io"
	"net/http"
	"strings"
)

type FirehosePayload struct {
	RequestId string
	Timestamp int64
	Records   []struct {
		Data string
	}
}

func ExtractFirehoseMetadata(r *http.Request, body []byte) (int, *FirehosePayload, [][]byte, error) {
	var payload FirehosePayload
	if err := json.Unmarshal(body, &payload); err != nil {
		return 0, nil, nil, err
	}

	if payload.RequestId == "" {
		payload.RequestId = uuid.New().String()
	}

	attributesMap := struct {
		CommonAttributes struct {
			ProjectID string `json:"x-highlight-project"`
		} `json:"commonAttributes"`
	}{}
	if err := json.Unmarshal([]byte(r.Header.Get("X-Amz-Firehose-Common-Attributes")), &attributesMap); err != nil {
		return 0, nil, nil, err
	}

	projectID, err := model2.FromVerboseID(attributesMap.CommonAttributes.ProjectID)
	if err != nil {
		return 0, nil, nil, err
	}

	rawRecords := make([][]byte, 0, len(payload.Records))
	for _, l := range payload.Records {
		data, err := base64.StdEncoding.DecodeString(l.Data)
		if err != nil {
			return 0, nil, nil, err
		}

		var msg []byte
		// try to load data as gzip. if it is not, assume it is not compressed
		gz, err := gzip.NewReader(strings.NewReader(string(data)))
		if err == nil {
			msg, err = io.ReadAll(gz)
			if err != nil {
				return 0, nil, nil, err
			}
		} else {
			msg = data
		}
		rawRecords = append(rawRecords, msg)
	}

	return projectID, &payload, rawRecords, nil
}
