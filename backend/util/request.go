package util

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

// Slim wrapper around sending a request with arbitrary request/response interfaces.
func RestRequest(url string, method string, request interface{}, response interface{}) error {
	var bufb []byte
	if request != nil {
		var err error
		bufb, err = json.Marshal(request)
		if err != nil {
			return err
		}
	}
	client := http.Client{}
	req, err := http.NewRequest(method, url, bytes.NewBuffer(bufb))
	if err != nil {
		return err
	}
	req.Header = http.Header{
		"Content-Type":  []string{"application/json"},
		"Cache-Control": []string{"no-cache"},
	}
	res, err := client.Do(req)
	if err != nil {
		return err
	}

	b, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}
	err = json.Unmarshal(b, response)
	if err != nil {
		return err
	}
	return nil
}
