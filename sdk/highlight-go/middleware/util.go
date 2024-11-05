package middleware

import (
	"fmt"
	"github.com/highlight/highlight/sdk/highlight-go"
	e "github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/attribute"
	semconv "go.opentelemetry.io/otel/semconv/v1.25.0"
	"go.opentelemetry.io/otel/trace"
	"net/http"
	"runtime/debug"
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
		attribute.String(string(semconv.ClientAddressKey), GetIPAddress(r)),
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

func RecoverToError(r interface{}) error {
	switch x := r.(type) {
	case string:
		return e.New(x)
	case error:
		return x
	default:
		return e.New(fmt.Sprint(x))
	}
}

func Recoverer(s trace.Span, w http.ResponseWriter, r *http.Request) {
	if rvr := recover(); rvr != nil {
		if rvr == http.ErrAbortHandler {
			// we don't recover http.ErrAbortHandler so the response
			// to the client is aborted, this should not be logged
			panic(rvr)
		}

		logrus.WithContext(r.Context()).Panicf("%+v\n%s", rvr, debug.Stack())
		highlight.RecordSpanError(s, RecoverToError(rvr))

		if r.Header.Get("Connection") != "Upgrade" {
			w.WriteHeader(http.StatusInternalServerError)
		}
	}
}
