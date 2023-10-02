package util

import (
	"github.com/highlight/highlight/sdk/highlight-go"
	"os"
	"runtime"

	log "github.com/sirupsen/logrus"
)

func formatRecover() (any, []byte) {
	if rec := recover(); rec != nil {
		buf := make([]byte, 64<<10)
		buf = buf[:runtime.Stack(buf, false)]
		return rec, buf
	}
	return nil, nil
}

func Recover() {
	if rec, buf := formatRecover(); rec != nil {
		log.Errorf("panic: %+v\n%s", rec, buf)
	}
}

func RecoverAndCrash() {
	if rec, buf := formatRecover(); rec != nil {
		log.Errorf("panic: %+v\n%s", rec, buf)
		highlight.Stop()
		os.Exit(1)
	}
}
