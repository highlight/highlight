package middleware

import (
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

func CheckStatus() {
	if !highlight.IsRunning() {
		logrus.Errorf("[highlight-go] middleware added but highlight is not running. did you forget to run `H.Start(); defer H.Stop()`?")
	}
}

func GetIPAddress(r *http.Request) string {
	// get users ip for geolocation data
	IPAddress := r.Header.Get("X-Real-Ip")
	if IPAddress == "" {
		IPAddress = r.Header.Get("X-Client-IP")
	}
	if IPAddress == "" {
		IPAddress = r.Header.Get("X-Forwarded-For")
		if IPAddress != "" && strings.Contains(IPAddress, ",") {
			if ipList := strings.Split(IPAddress, ","); len(ipList) > 0 {
				IPAddress = ipList[0]
			}
		}
	}
	if IPAddress == "" {
		IPAddress = r.RemoteAddr
	}
	return IPAddress
}
