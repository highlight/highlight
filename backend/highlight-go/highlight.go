package highlight

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-errors/errors"
	"github.com/highlight-run/highlight/backend/model"
)

type Highlight struct {
}

type HighlightRequest struct {
	skip            bool
	startTime       time.Time
	endTime         time.Time
	errorStackTrace string
	sessionID       int
	requestID       string
}

// Initiate a request
func (h *Highlight) InitiateRequest(request *http.Request) *HighlightRequest {
	hreq := &HighlightRequest{}
	hreq.startTime = time.Now()
	meta := request.Header.Get("X-Highlight-Request")
	split := strings.Split(meta, ":")
	if len(split) != 2 {
		hreq.skip = true
		return hreq
	}
	hreq.requestID = split[0]
	sid, err := strconv.Atoi(split[1])
	if err != nil {
		hreq.skip = true
		return hreq
	}
	hreq.sessionID = sid
	return hreq
}

func (h *HighlightRequest) CaptureError(err error) {
	errors.Wrap(err, 1).ErrorStack()
}

func (h *HighlightRequest) Close() {
	if len(h.errorStackTrace) > 0 {
		model.DB.Create(&model.ErrorObject{})
	}
}
