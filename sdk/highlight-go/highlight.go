package highlight

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/hasura/go-graphql-client"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/pkg/errors"
)

var (
	metricChan           chan MetricInput
	flushInterval        time.Duration
	client               *graphql.Client
	interruptChan        chan bool
	signalChan           chan os.Signal
	wg                   sync.WaitGroup
	graphqlClientAddress string
	otlpEndpoint         string
	projectID            string
)

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

const backendSetupCooldown = 15

// message channels should be large to avoid blocking request processing
// in case of a surge of metrics or errors.
const messageBufferSize = 1 << 16
const metricCategory = "BACKEND"

var (
	lastBackendSetupTimestamp time.Time
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

func (d deadLog) Error(v ...interface{})                 {}
func (d deadLog) Errorf(format string, v ...interface{}) {}

// Requester is used for making graphql requests
// in testing, a mock requester with an overwritten trigger function may be used
type Requester interface {
	trigger([]*MetricInput) error
}

var (
	requester Requester
)

type graphqlRequester struct{}

func (g graphqlRequester) trigger(metricsInputs []*MetricInput) error {
	if len(metricsInputs) > 0 {
		var mutation struct {
			PushMetrics string `graphql:"pushMetrics(metrics: $metrics)"`
		}
		variables := map[string]interface{}{"metrics": metricsInputs}
		err := client.Mutate(context.Background(), &mutation, variables)
		if err != nil {
			return err
		}
	}
	return nil
}

type mockRequester struct{}

func (m mockRequester) trigger(metricsInput []*MetricInput) error {
	// NOOP
	_ = metricsInput
	return nil
}

type BackendErrorObjectInput struct {
	SessionSecureID *graphql.String `json:"session_secure_id"`
	RequestID       *graphql.String `json:"request_id"`
	Event           graphql.String  `json:"event"`
	Type            graphql.String  `json:"type"`
	URL             graphql.String  `json:"url"`
	Source          graphql.String  `json:"source"`
	StackTrace      graphql.String  `json:"stackTrace"`
	Timestamp       time.Time       `json:"timestamp"`
	Payload         *graphql.String `json:"payload"`
}

type MetricInput struct {
	SessionSecureID graphql.String  `json:"session_secure_id"`
	Group           *graphql.String `json:"group"`
	Name            graphql.String  `json:"name"`
	Value           graphql.Float   `json:"value"`
	Category        *graphql.String `json:"category"`
	Timestamp       time.Time       `json:"timestamp"`
}

// init gets called once when you import the package
func init() {
	metricChan = make(chan MetricInput, messageBufferSize)
	interruptChan = make(chan bool, 1)
	signalChan = make(chan os.Signal, 1)

	signal.Notify(signalChan, syscall.SIGABRT, syscall.SIGTERM, syscall.SIGINT)
	SetGraphqlClientAddress("https://pub.highlight.run")
	SetOTLPEndpoint(OTLPDefaultEndpoint)
	SetFlushInterval(2 * time.Second)
	SetDebugMode(deadLog{})

	requester = graphqlRequester{}
}

// Start is used to start the Highlight client's collection service.
func Start() {
	StartWithContext(context.Background())
}

// StartWithContext is used to start the Highlight client's collection
// service, but allows the user to pass in their own context.Context.
// This allows the user kill the highlight worker by canceling their context.CancelFunc.
func StartWithContext(ctx context.Context) {
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
	var httpClient = &http.Client{}
	if graphqlClientAddress == "https://localhost:8082/public" {
		httpClient = &http.Client{
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
			},
		}
	}
	client = graphql.NewClient(graphqlClientAddress, httpClient)
	state = started
	go func() {
		for {
			select {
			case <-time.After(flushInterval):
				wg.Add(1)
				flushedMetrics := flush()
				wg.Done()
				_ = requester.trigger(flushedMetrics)
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

// SetFlushInterval allows you to override the amount of time in which the
// Highlight client will collect errors before sending them to our backend.
// - newFlushInterval is an integer representing seconds
func SetFlushInterval(newFlushInterval time.Duration) {
	flushInterval = newFlushInterval
}

// SetGraphqlClientAddress allows you to override the graphql client address,
// in case you are running Highlight on-prem, and need to point to your on-prem instance.
func SetGraphqlClientAddress(newGraphqlClientAddress string) {
	graphqlClientAddress = newGraphqlClientAddress
}

// SetOTLPEndpoint allows you to override the otlp address used for sending errors and traces.
// Use the root http url. Eg: https://otel.highlight.io:4318
func SetOTLPEndpoint(newOtlpEndpoint string) {
	otlpEndpoint = newOtlpEndpoint
}

func SetDebugMode(l Logger) {
	logger.Logger = l
}

func SetProjectID(id string) {
	projectID = id
}

func GetProjectID() string {
	return projectID
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

func MarkBackendSetup(ctx context.Context) {
	if lastBackendSetupTimestamp.IsZero() {
		currentTime := time.Now()
		if currentTime.Sub(lastBackendSetupTimestamp).Minutes() > backendSetupCooldown {
			lastBackendSetupTimestamp = currentTime
			var mutation struct {
				MarkBackendSetup string `graphql:"markBackendSetup(session_secure_id: $session_secure_id, type: $type)"`
			}
			sessionSecureID := ctx.Value(ContextKeys.SessionSecureID)
			variables := map[string]interface{}{
				"session_secure_id": graphql.String(fmt.Sprintf("%v", sessionSecureID)),
				"type":              graphql.String(fmt.Sprintf("%v", model.MarkBackendSetupTypeError)),
			}

			err := client.Mutate(ctx, &mutation, variables)
			if err != nil {
				logger.Errorf("[highlight-go] %v", errors.Wrap(err, "error marking backend setup"))
				return
			}
		}
	}
}

// RecordMetric is used to record arbitrary metrics in your golang backend.
// Highlight will process these metrics in the context of your session and expose them
// through dashboards. For example, you may want to record the latency of a DB query
// as a metric that you would like to graph and monitor. You'll be able to view the metric
// in the context of the session and network request and recorded it.
func RecordMetric(ctx context.Context, name string, value float64) {
	sessionSecureID, requestID, err := validateRequest(ctx)
	if err != nil {
		logger.Errorf("[highlight-go] %v", err)
		return
	}
	// track invocation of this function to ensure shutdown waits
	defer wg.Done()
	wg.Add(1)

	req := graphql.String(requestID)
	cat := graphql.String(metricCategory)
	metric := MetricInput{
		SessionSecureID: graphql.String(sessionSecureID),
		Group:           &req,
		Name:            graphql.String(name),
		Value:           graphql.Float(value),
		Category:        &cat,
		Timestamp:       time.Now().UTC(),
	}
	select {
	case metricChan <- metric:
	default:
		logger.Errorf("[highlight-go] metric channel full. discarding value for %s", sessionSecureID)
	}
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

func flush() []*MetricInput {
	tempChanSize := len(metricChan)
	var flushedMetrics []*MetricInput
	for i := 0; i < tempChanSize; i++ {
		e := <-metricChan
		flushedMetrics = append(flushedMetrics, &e)
	}
	return flushedMetrics
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
