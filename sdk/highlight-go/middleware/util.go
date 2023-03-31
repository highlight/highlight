package middleware

import (
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/attribute"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
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

func GetRequestAttributes(r *http.Request) []attribute.KeyValue {
	attrs := []attribute.KeyValue{
		attribute.String(string(semconv.HTTPMethodKey), r.Method),
		attribute.String(string(semconv.HTTPClientIPKey), GetIPAddress(r)),
	}
	if r.URL != nil {
		attrs = append(attrs,
			attribute.String(string(semconv.HTTPURLKey), r.URL.String()),
			attribute.String(string(semconv.HTTPRouteKey), r.URL.RequestURI()),
		)
	}
	if r.Response != nil {
		attrs = append(attrs, attribute.Int(string(semconv.HTTPStatusCodeKey), r.Response.StatusCode))
	}
	return attrs
}
