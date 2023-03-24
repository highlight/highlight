package middleware

import (
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/sirupsen/logrus"
)

func CheckStatus() {
	if !highlight.IsRunning() {
		logrus.Errorf("[highlight-go] middleware added but highlight is not running. did you forget to run `H.Start(); defer H.Stop()`?")
	}
}
