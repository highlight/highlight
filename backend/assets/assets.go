package assets

import (
	"crypto/tls"
	log "github.com/sirupsen/logrus"
	"io"
	"net/http"
	"net/url"
	"strings"
)

const ParamKey = "url"

func HandleAsset(w http.ResponseWriter, r *http.Request) {
	qs := r.URL.Query()
	urlStr := qs.Get(ParamKey)
	u, err := url.Parse(urlStr)
	if err != nil {
		log.WithContext(r.Context()).WithError(err).Error("failed to parse url")
		http.Error(w, "failed to parse url", http.StatusBadRequest)
		return
	}
	log.WithContext(r.Context()).WithField(ParamKey, u).Debug("CORS worker request")

	if len(u.Host) == 0 {
		for n, h := range r.Header {
			// get the origin from the request
			if strings.Contains(n, "Origin") {
				for _, h := range h {
					u.Host = h
				}
			}
		}
	}

	// always allow access origin
	w.Header().Add("Access-Control-Allow-Origin", u.Host)
	w.Header().Add("Access-Control-Allow-Credentials", "true")
	w.Header().Add("Access-Control-Allow-Methods", "GET")

	// create the request to server
	req, err := http.NewRequest(r.Method, u.String(), r.Body)
	if err != nil {
		log.WithContext(r.Context()).WithError(err).Error("failed to build request")
		http.Error(w, "failed to build request", http.StatusInternalServerError)
		return
	}

	// add ALL headers to the connection
	for n, h := range r.Header {
		for _, h := range h {
			req.Header.Add(n, h)
		}
	}

	// use the host provided by the flag
	if len(u.Host) > 0 {
		req.Host = u.Host
	}

	// create a basic client to send the request
	client := http.Client{}
	if r.TLS != nil {
		client.Transport = &http.Transport{
			TLSClientConfig: &tls.Config{},
		}
	}
	resp, err := client.Do(req)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	for h, v := range resp.Header {
		for _, v := range v {
			w.Header().Add(h, v)
		}
	}
	// copy the response from the server to the connected client request
	w.WriteHeader(resp.StatusCode)

	wr, err := io.Copy(w, resp.Body)
	if err != nil {
		log.WithContext(r.Context()).WithField("written", wr).WithError(err).Error("failed to write back body")
	} else {
		log.WithContext(r.Context()).WithField("written", wr).Debug("wrote back body")
	}
}
