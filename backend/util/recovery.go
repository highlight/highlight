package util

import (
	"runtime"

	log "github.com/sirupsen/logrus"
)

func Recover() {
	if rec := recover(); rec != nil {
		buf := make([]byte, 64<<10)
		buf = buf[:runtime.Stack(buf, false)]
		log.Errorf("panic: %+v\n%s", rec, buf)
	}
}
