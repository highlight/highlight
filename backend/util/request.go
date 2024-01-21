package util

import (
	"bytes"
	"io"
	"net/http"

	e "github.com/pkg/errors"
	"github.com/segmentio/encoding/json"
)

// Slim wrapper around sending a request with arbitrary request/response interfaces.
func RestRequest(url string, method string, request interface{}, response interface{}) error {
	var bufb []byte
	if request != nil {
		var err error
		bufb, err = json.Marshal(request)
		if err != nil {
			return e.Wrap(err, "error marshaling request")
		}
	}
	client := http.Client{}
	req, err := http.NewRequest(method, url, bytes.NewBuffer(bufb))
	if err != nil {
		return e.Wrap(err, "error building request")
	}
	req.Header = http.Header{
		"Content-Type":  []string{"application/json"},
		"Cache-Control": []string{"no-cache"},
	}
	res, err := client.Do(req)
	if err != nil {
		return e.Wrap(err, "error executing request")
	}

	b, err := io.ReadAll(res.Body)
	if err != nil {
		return e.Wrap(err, "error reading contacts body")
	}
	err = json.Unmarshal(b, response)
	if err != nil {
		return e.Wrap(err, "error unmarshaling contacts response")
	}
	return nil
}
