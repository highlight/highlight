package highlight

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/pkg/errors"
	"go.opentelemetry.io/otel/attribute"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
)

type config struct {
	otlpEndpoint       string
	projectID          string
	resourceAttributes []attribute.KeyValue
}

var (
	flushInterval time.Duration
	interruptChan chan bool
	signalChan    chan os.Signal
	wg            sync.WaitGroup
	conf          *config
)

type Option interface {
	apply(conf *config)
}

type option func(conf *config)

func (fn option) apply(conf *config) {
	fn(conf)
}

func WithServiceName(serviceName string) Option {
	return option(func(conf *config) {
		attr := semconv.ServiceNameKey.String(serviceName)
		conf.resourceAttributes = append(conf.resourceAttributes, attr)
	})
}

func WithServiceVersion(serviceVersion string) Option {
	return option(func(conf *config) {
		attr := semconv.ServiceVersionKey.String(serviceVersion)
		conf.resourceAttributes = append(conf.resourceAttributes, attr)
	})
}

// contextKey represents the keys that highlight may store in the users' context
// we append every contextKey with Highlight to avoid collisions
type contextKey string

const (
	Highlight       contextKey = "highlight"
	RequestID                  = Highlight + "RequestID"
	SessionSecureID            = Highlight + "SessionSecureID"
)

var (
	ContextKeys = struct {
		RequestID       contextKey
		SessionSecureID contextKey
	}{
		RequestID:       RequestID,
		SessionSecureID: SessionSecureID,
	}
)

// appState is used for keeping track of the current state of the app
// this can determine whether to accept new errors
type appState byte

const (
	idle appState = iota
	started
	stopped
)

var (
	state      appState // 0 is idle, 1 is started, 2 is stopped
	stateMutex sync.RWMutex
	otlp       *OTLP
)

const (
	consumeErrorWorkerStopped = "highlight worker stopped"
)

// Logger is an interface that implements Log and Logf
type Logger interface {
	Error(v ...interface{})
	Errorf(format string, v ...interface{})
}

// log is this packages logger
var logger struct {
	Logger
}

// noop default logger
type deadLog struct{}

func (d deadLog) Error(_ ...interface{})            {}
func (d deadLog) Errorf(_ string, _ ...interface{}) {}

// init gets called once when you import the package
func init() {
	interruptChan = make(chan bool, 1)
	signalChan = make(chan os.Signal, 1)
	conf = &config{}

	signal.Notify(signalChan, syscall.SIGABRT, syscall.SIGTERM, syscall.SIGINT)
	SetOTLPEndpoint(OTLPDefaultEndpoint)
	SetFlushInterval(2 * time.Second)
	SetDebugMode(deadLog{})
}

// Start is used to start the Highlight client's collection service.
func Start(opts ...Option) {
	StartWithContext(context.Background(), opts...)
}

// StartWithContext is used to start the Highlight client's collection
// service, but allows the user to pass in their own context.Context.
// This allows the user kill the highlight worker by canceling their context.CancelFunc.
func StartWithContext(ctx context.Context, opts ...Option) {
	for _, opt := range opts {
		opt.apply(conf)
	}
	stateMutex.Lock()
	defer stateMutex.Unlock()
	if state == started {
		return
	}
	var err error
	otlp, err = StartOTLP()
	if err != nil {
		logger.Errorf("failed to start opentelemetry exporter: %s", err)
	}
	state = started
	go func() {
		for {
			select {
			case <-time.After(flushInterval):
				wg.Add(1)
				if err := otlp.tracerProvider.ForceFlush(ctx); err != nil {
					logger.Errorf("error flushing otlp exporter: %s", err)
				}
				wg.Done()
			case <-interruptChan:
				shutdown()
				return
			case <-signalChan:
				shutdown()
				return
			case <-ctx.Done():
				shutdown()
				return
			}
		}
	}()
}

// Stop sends an interrupt signal to the main process, closing the channels and returning the goroutines.
func Stop() {
	stateMutex.RLock()
	defer stateMutex.RUnlock()
	if state == stopped || state == idle {
		return
	}
	interruptChan <- true
}

func IsRunning() bool {
	return state == started
}

// SetFlushInterval allows you to override the amount of time in which the
// Highlight client will collect errors before sending them to our backend.
// - newFlushInterval is an integer representing seconds
func SetFlushInterval(newFlushInterval time.Duration) {
	flushInterval = newFlushInterval
}

// SetOTLPEndpoint allows you to override the otlp address used for sending errors and traces.
// Use the root http url. Eg: https://otel.highlight.io:4318
func SetOTLPEndpoint(newOtlpEndpoint string) {
	conf.otlpEndpoint = newOtlpEndpoint
}

func SetDebugMode(l Logger) {
	logger.Logger = l
}

func SetProjectID(id string) {
	conf.projectID = id
}

func GetProjectID() string {
	return conf.projectID
}

// InterceptRequest calls InterceptRequestWithContext using the request object's context
func InterceptRequest(r *http.Request) context.Context {
	return InterceptRequestWithContext(r.Context(), r)
}

// InterceptRequestWithContext captures the highlight session and request ID
// for a particular request from the request headers, adding the values to the provided context.
func InterceptRequestWithContext(ctx context.Context, r *http.Request) context.Context {
	highlightReqDetails := r.Header.Get("X-Highlight-Request")
	ids := strings.Split(highlightReqDetails, "/")
	if len(ids) < 2 {
		return ctx
	}
	ctx = context.WithValue(ctx, ContextKeys.SessionSecureID, ids[0])
	ctx = context.WithValue(ctx, ContextKeys.RequestID, ids[1])
	return ctx
}

func validateRequest(ctx context.Context) (sessionSecureID string, requestID string, err error) {
	stateMutex.RLock()
	defer stateMutex.RUnlock()
	if state == stopped {
		err = errors.New(consumeErrorWorkerStopped)
		return
	}
	if v := ctx.Value(ContextKeys.SessionSecureID); v != nil {
		sessionSecureID = v.(string)
	}
	if v := ctx.Value(ContextKeys.RequestID); v != nil {
		requestID = v.(string)
	}
	return
}

func shutdown() {
	stateMutex.Lock()
	defer stateMutex.Unlock()
	if state == stopped || state == idle {
		return
	}
	if otlp != nil {
		otlp.shutdown()
	}
	state = stopped
	wg.Wait()
}
