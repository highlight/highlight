// main.go
package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/highlight/highlight/sdk/highlight-go"

	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/trace"
)

type MyLogger struct{}

func (l MyLogger) Error(v ...interface{}) {
	fmt.Println(v...)
}

func (l MyLogger) Errorf(format string, v ...interface{}) {
	fmt.Println(fmt.Sprintf(format, v...))
}

var logger highlight.Logger = MyLogger{}

func main() {
	highlight.SetDebugMode(logger)
	highlight.SetOTLPEndpoint("http://localhost:4318")
	highlight.Start(
		highlight.WithServiceName("my-go-service"),
		highlight.WithProjectID("1"),

		highlight.WithSamplingRateMap(map[trace.SpanKind]float64{
			trace.SpanKindUnspecified: 1.,
			trace.SpanKindInternal:    1.,
			trace.SpanKindServer:      1.,
			trace.SpanKindClient:      1.,
		}),
	)

	defer highlight.Stop()

	router := chi.NewRouter()
	router.Use(highlightChi.Middleware)

	router.Get("/x-highlight-request", func(w http.ResponseWriter, r *http.Request) {
		trace, _ := highlight.StartTrace(r.Context(), "go-custom-span-x-highlight-request", attribute.Int("custom_property", 5))

		defer func() {
			time.Sleep(1 * time.Second)
			highlight.EndTrace(trace)
			fmt.Println("Trace ended")
		}()

		fmt.Fprint(w, "Hello, world!")
	})

	// xHighlightRouter := chi.NewRouter()
	router.Get("/traceparent", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Received request")
		for k, v := range r.Header {
			fmt.Printf("%s: %s\n", k, v)
		}

		traceparent := r.Header.Get("traceparent")
		tracestate := r.Header.Get("tracestate")

		header := http.Header{}
		header.Set("traceparent", traceparent)
		header.Set("tracestate", tracestate)

		propagator := propagation.TraceContext{}
		ctx := propagator.Extract(r.Context(), propagation.HeaderCarrier(header))

		trace, _ := highlight.StartTrace(ctx, "go-custom-span-traceparent", attribute.Int("custom_property", 5))

		defer func() {
			time.Sleep(1 * time.Second)
			highlight.EndTrace(trace)
			fmt.Println("Trace ended")
		}()

		fmt.Println("🌍")
		fmt.Println(trace.SpanContext().TraceID().String())
		fmt.Println(trace.SpanContext().TraceState().String())

		fmt.Fprint(w, "Hello, world!")
	})

	srv := &http.Server{
		Addr:    ":3010",
		Handler: router,
	}

	go func() {
		if err := srv.ListenAndServe(); err != http.ErrServerClosed {
			// unexpected error. Shutdown the server.
			fmt.Println("Server is not closed cleanly:", err)
		}
	}()

	fmt.Println("Server is running on port 3010")

	// Create a channel to receive OS signals.
	c := make(chan os.Signal, 1)
	// Relay interrupt signals to the channel.
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	// Block until we receive our signal.
	<-c

	// Create a deadline to wait for.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Doesn't block if no connections, but will otherwise wait
	// until the timeout deadline.
	srv.Shutdown(ctx)

	fmt.Println("Server is shutting down")
	os.Exit(0)
}
