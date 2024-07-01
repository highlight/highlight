package main

import (
	"context"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/highlight-run/highlight/backend/enterprise"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/pricing"

	ghandler "github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/andybalholm/brotli"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/marketplacemetering"
	"github.com/aws/smithy-go/ptr"
	"github.com/clearbit/clearbit-go/clearbit"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/httplog"
	"github.com/gorilla/websocket"
	golang_lru "github.com/hashicorp/golang-lru/v2"
	"github.com/highlight-run/go-resthooks"
	"github.com/highlight-run/highlight/backend/assets"
	"github.com/highlight-run/highlight/backend/clickhouse"
	dd "github.com/highlight-run/highlight/backend/datadog"
	"github.com/highlight-run/highlight/backend/embeddings"
	highlightHttp "github.com/highlight-run/highlight/backend/http"
	"github.com/highlight-run/highlight/backend/integrations"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/lambda"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/oauth"
	"github.com/highlight-run/highlight/backend/openai_client"
	"github.com/highlight-run/highlight/backend/otel"
	"github.com/highlight-run/highlight/backend/phonehome"
	private "github.com/highlight-run/highlight/backend/private-graph/graph"
	privategen "github.com/highlight-run/highlight/backend/private-graph/graph/generated"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
	publicgen "github.com/highlight-run/highlight/backend/public-graph/graph/generated"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/stepfunctions"
	"github.com/highlight-run/highlight/backend/storage"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/highlight/backend/vercel"
	"github.com/highlight-run/highlight/backend/worker"
	"github.com/highlight-run/highlight/backend/zapier"
	"github.com/highlight-run/workerpool"
	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
	htrace "github.com/highlight/highlight/sdk/highlight-go/trace"
	e "github.com/pkg/errors"
	"github.com/rs/cors"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v78/client"
	_ "github.com/urfave/cli/v2"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.25.0"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
	_ "gorm.io/gorm"
)

var runtimeParsed util.Runtime
var handlerParsed util.Handler

const (
	localhostCertPath = "localhostssl/server.crt"
	localhostKeyPath  = "localhostssl/server.key"
)

func init() {
	runtimeParsed, handlerParsed = util.GetRuntime()
}

func healthRouter(runtimeFlag util.Runtime, db *gorm.DB, rClient *redis.Client, ccClient *clickhouse.Client, queue *kafkaqueue.Queue, batchedQueue *kafkaqueue.Queue) http.HandlerFunc {
	// only checks kafka because kafka is the only critical infrastructure needed for public graph to be healthy.
	topic := kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Type: kafkaqueue.TopicTypeDefault})
	batchedTopic := kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Type: kafkaqueue.TopicTypeBatched})
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		if err := queue.Submit(ctx, "", &kafkaqueue.Message{Type: kafkaqueue.HealthCheck}); err != nil {
			log.WithContext(ctx).Error(fmt.Sprintf("failed kafka health check: %s", err))
			http.Error(w, fmt.Sprintf("failed to write message to kafka %s", topic), 500)
			return
		}
		if err := batchedQueue.Submit(ctx, "", &kafkaqueue.Message{Type: kafkaqueue.HealthCheck}); err != nil {
			log.WithContext(ctx).Error(fmt.Sprintf("failed kafka batched health check: %s", err))
			http.Error(w, fmt.Sprintf("failed to write message to kafka %s", batchedTopic), 500)
			return
		}
		if runtimeFlag != util.PublicGraph {
			if err := enhancedHealthCheck(ctx, db, rClient, ccClient); err != nil {
				log.WithContext(ctx).Error(fmt.Sprintf("failed enhanced health check: %s", err))
				http.Error(w, fmt.Sprintf("failed enhanced health check: %s", err), 500)
				return
			}
		}
		_, err := w.Write([]byte(fmt.Sprintf("%v is healthy", runtimeFlag)))
		if err != nil {
			log.WithContext(ctx).Error(e.Wrap(err, "error writing health response"))
		}
	}
}

func enhancedHealthCheck(ctx context.Context, db *gorm.DB, rClient *redis.Client, ccClient *clickhouse.Client) error {
	const Timeout = 5 * time.Second

	errors := make(chan error, 3)
	wg := sync.WaitGroup{}
	wg.Add(3)
	go func() {
		defer wg.Done()
		ctx, cancel := context.WithTimeout(ctx, Timeout)
		defer cancel()
		if err := db.WithContext(ctx).Model(&model.Project{}).Find(&model.Project{}).Error; err != nil {
			msg := fmt.Sprintf("failed to query database: %s", err)
			log.WithContext(ctx).Error(msg)
			errors <- e.New(msg)
		}
	}()
	go func() {
		defer wg.Done()
		ctx, cancel := context.WithTimeout(ctx, Timeout)
		defer cancel()
		if err := rClient.SetIsPendingSession(ctx, "health-check-test-session", true); err != nil {
			msg := fmt.Sprintf("failed to set redis flag: %s", err)
			log.WithContext(ctx).Error(msg)
			errors <- e.New(msg)
		}
	}()
	go func() {
		defer wg.Done()
		ctx, cancel := context.WithTimeout(ctx, Timeout)
		defer cancel()
		if err := ccClient.HealthCheck(ctx); err != nil {
			msg := fmt.Sprintf("failed to perform clickhouse query: %s", err)
			log.WithContext(ctx).Error(msg)
			errors <- e.New(msg)
		}
	}()
	wg.Wait()
	select {
	case err := <-errors:
		return err
	default:
		return nil
	}
}

var PUBLIC_GRAPH_CORS_OPTIONS = cors.Options{
	AllowedOrigins:   []string{"*"},
	AllowCredentials: false,
	AllowedHeaders:   []string{"*"},
}

var PRIVATE_GRAPH_CORS_OPTIONS = cors.Options{
	AllowOriginRequestFunc: validateOrigin,
	AllowCredentials:       true,
	AllowedHeaders:         []string{"*"},
}

func validateOrigin(_ *http.Request, origin string) bool {
	isHighlightSubdomain := strings.HasSuffix(origin, ".highlight.io")
	if origin == env.Config.FrontendUri || origin == env.Config.LandingStagingURL || isHighlightSubdomain {
		return true
	}

	return false
}

var defaultPort = "8082"

func main() {
	rand.New(rand.NewSource(time.Now().UnixNano()))
	ctx := context.TODO()

	if env.Config.OTLPDogfoodEndpoint != "" {
		log.WithContext(ctx).WithField("otlpEndpoint", env.Config.OTLPDogfoodEndpoint).Info("overwriting otlp client address for highlight backend logging")
		highlight.SetOTLPEndpoint(env.Config.OTLPDogfoodEndpoint)
	}

	serviceName := string(runtimeParsed)
	if runtimeParsed == util.Worker {
		serviceName = string(handlerParsed)
	}

	var samplingMap = map[trace.SpanKind]float64{}
	if env.IsProduction() {
		samplingMap = map[trace.SpanKind]float64{
			trace.SpanKindUnspecified: 1. / 1_000_000,
			trace.SpanKindInternal:    1. / 1_000_000,
			trace.SpanKindConsumer:    env.ConsumerSpanSamplingRate(),
			// report `sampling`
			trace.SpanKindServer: 1.,
			// report all customer data
			trace.SpanKindClient: 1.,
		}
	}

	// setup highlight self-instrumentation
	highlight.Start(
		highlight.WithProjectID("1jdkoe52"),
		highlight.WithEnvironment(env.EnvironmentName()),
		highlight.WithMetricSamplingRate(1./1_000_000),
		highlight.WithSamplingRateMap(samplingMap),
		highlight.WithServiceName(serviceName),
		highlight.WithServiceVersion(env.Config.Version),
	)
	defer highlight.Stop()
	highlight.SetDebugMode(log.StandardLogger())

	// setup highlight logrus hook
	hlog.Init()

	if err := enterprise.Start(ctx); err != nil {
		log.WithContext(ctx).WithError(err).Fatal("Failed to start highlight enterprise license checker.")
	}

	log.WithContext(ctx).
		WithField("release", env.Config.Release).
		WithField("commit", env.Config.Version).
		WithField("env_pub_length", len(env.GetEnterpriseEnvPublicKey())).
		Info("welcome to highlight.io")

	if err := phonehome.Start(ctx); err != nil {
		log.WithContext(ctx).Warn("Failed to start highlight phone-home service.")
	}

	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("Error setting up DB: %v", err)
	}

	if err := htrace.SetupGORMTracing(db, attribute.String(highlight.ProjectIDAttribute, highlight.GetProjectID())); err != nil {
		log.WithContext(ctx).Fatalf("Error setting up GORM tracing hooks: %v", err)
	}

	if env.IsDevEnv() {
		_, err := model.MigrateDB(ctx, db)

		if err != nil {
			log.WithContext(ctx).Fatalf("Error migrating DB: %v", err)
		}
	}

	var pricingClient *pricing.Client
	if env.IsInDocker() {
		pricingClient = pricing.NewNoopClient()
	} else {
		stripeClient := &client.API{}
		stripeClient.Init(env.Config.StripeApiKey, nil)
		pricingClient = pricing.New(stripeClient)
	}

	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(model.AWS_REGION_US_EAST_2))
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to load aws config")
	}
	mpm := marketplacemetering.NewFromConfig(cfg)

	var storageClient storage.Client
	if env.IsInDocker() {
		log.WithContext(ctx).Info("in docker: using filesystem for object storage")
		fsRoot := "/tmp"
		if env.Config.ObjectStorageFS != "" {
			fsRoot = env.Config.ObjectStorageFS
		}
		if storageClient, err = storage.NewFSClient(ctx, env.Config.PrivateGraphUri, fsRoot); err != nil {
			log.WithContext(ctx).Fatalf("error creating filesystem storage client: %v", err)
		}
	} else {
		log.WithContext(ctx).Info("using S3 for object storage")
		if env.Config.AwsAccessKeyID == "" || env.Config.AwsSecretAccessKey == "" {
			log.WithContext(ctx).Fatalf("please specify object storage env variables in order to proceed")
		}
		if storageClient, err = storage.NewS3Client(ctx); err != nil {
			log.WithContext(ctx).Fatalf("error creating s3 storage client: %v", err)
		}
	}

	// sync writes with batching per-partition
	kafkaProducer := kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Type: kafkaqueue.TopicTypeDefault}), kafkaqueue.Producer, nil)
	// sync writes without batching
	kafkaDataSyncProducer := kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Type: kafkaqueue.TopicTypeDataSync}), kafkaqueue.Producer, &kafkaqueue.ConfigOverride{BatchSize: ptr.Int(1)})

	// async writes for workers (where order of write between workers does not matter)
	kCfg := &kafkaqueue.ConfigOverride{Async: ptr.Bool(true)}
	kafkaBatchedProducer := kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Type: kafkaqueue.TopicTypeBatched}), kafkaqueue.Producer, kCfg)
	defer kafkaBatchedProducer.Stop(ctx)
	kafkaTracesProducer := kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Type: kafkaqueue.TopicTypeTraces}), kafkaqueue.Producer, kCfg)
	defer kafkaTracesProducer.Stop(ctx)

	var lambdaClient *lambda.Client
	if !env.IsInDocker() {
		lambdaClient, err = lambda.NewLambdaClient()
		if err != nil {
			log.WithContext(ctx).Errorf("error creating lambda client: %v", err)
		}
	}

	redisClient := redis.NewClient()
	sfnClient := stepfunctions.NewClient()

	clickhouseClient, err := clickhouse.NewClient(clickhouse.PrimaryDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error creating clickhouse client: %v", err)
	}

	clickhouse.RunMigrations(ctx, clickhouse.PrimaryDatabase)

	oauthSrv, err := oauth.CreateServer(ctx, db, redisClient)
	if err != nil {
		log.WithContext(ctx).Fatalf("error creating oauth client: %v", err)
	}

	tp, err := highlight.CreateTracerProvider(env.Config.OTLPEndpoint)
	if err != nil {
		log.WithContext(ctx).Fatalf("error creating collector tracer provider: %v", err)
	}
	tracer := tp.Tracer(
		"github.com/highlight/highlight",
		trace.WithInstrumentationVersion("v0.1.0"),
		trace.WithSchemaURL(semconv.SchemaURL),
	)

	tpNoResources, err := highlight.CreateTracerProvider(env.Config.OTLPEndpoint, sdktrace.WithResource(resource.Empty()))
	if err != nil {
		log.WithContext(ctx).Fatalf("error creating collector tracer provider: %v", err)
	}
	tracerNoResources := tpNoResources.Tracer(
		"github.com/highlight/highlight",
		trace.WithInstrumentationVersion("v0.1.0"),
		trace.WithSchemaURL(semconv.SchemaURL),
	)

	integrationsClient := integrations.NewIntegrationsClient(db)
	dataStore := store.NewStore(db, redisClient, integrationsClient, storageClient, kafkaDataSyncProducer, clickhouseClient)

	oai := &openai_client.OpenAiImpl{}
	if err := oai.InitClient(env.Config.OpenAIApiKey); err != nil {
		log.WithContext(ctx).WithError(err).Error("error creating openai client")
	}

	privateWorkerpool := workerpool.New(10000)
	privateWorkerpool.SetPanicHandler(util.Recover)
	subscriptionWorkerPool := workerpool.New(1000)
	subscriptionWorkerPool.SetPanicHandler(util.Recover)
	privateResolver := &private.Resolver{
		ClearbitClient:         clearbit.NewClient(clearbit.WithAPIKey(env.Config.ClearbitApiKey)),
		DB:                     db,
		Tracer:                 tracer,
		MailClient:             sendgrid.NewSendClient(env.Config.SendgridKey),
		PricingClient:          pricingClient,
		AWSMPClient:            mpm,
		StorageClient:          storageClient,
		LambdaClient:           lambdaClient,
		EmbeddingsClient:       embeddings.New(),
		PrivateWorkerPool:      privateWorkerpool,
		SubscriptionWorkerPool: subscriptionWorkerPool,
		Redis:                  redisClient,
		StepFunctions:          sfnClient,
		OAuthServer:            oauthSrv,
		IntegrationsClient:     integrationsClient,
		OpenAiClient:           oai,
		ClickhouseClient:       clickhouseClient,
		Store:                  dataStore,
		DataSyncQueue:          kafkaDataSyncProducer,
		TracesQueue:            kafkaTracesProducer,
	}
	private.SetupAuthClient(ctx, dataStore, private.GetEnvAuthMode(), oauthSrv, privateResolver.Query().APIKeyToOrgID)
	r := chi.NewMux()
	// Common middlewares for both the client/main graphs.
	errorLogger := httplog.NewLogger(fmt.Sprintf("%v-service", runtimeParsed), httplog.Options{
		JSON:     true,
		LogLevel: "warn",
		Concise:  true,
	})
	r.Use(httplog.RequestLogger(errorLogger))
	compressor := middleware.NewCompressor(5, "application/json")
	compressor.SetEncoder("br", func(w io.Writer, level int) io.Writer {
		return brotli.NewWriterLevel(w, level)
	})
	r.Use(compressor.Handler)
	r.HandleFunc("/health", healthRouter(runtimeParsed, db, redisClient, clickhouseClient, kafkaProducer, kafkaBatchedProducer))

	zapierStore := zapier.ZapierResthookStore{
		DB: db,
	}
	rh := resthooks.NewResthook(&zapierStore)

	privateResolver.RH = &rh
	defer rh.Close()

	/*
		Selectively turn on backends depending on the input flag
		If type is 'all', we run public-graph on /public and private-graph on /private
		If type is 'public-graph', we run public-graph on /
		If type is 'private-graph', we run private-graph on /
	*/
	if runtimeParsed.IsPrivateGraph() {
		privateEndpoint := "/private"
		if runtimeParsed == util.PrivateGraph {
			privateEndpoint = "/"
		}

		r.Route("/oauth", func(r chi.Router) {
			r.Use(highlightChi.Middleware)
			r.Use(private.PrivateMiddleware)
			r.HandleFunc("/token", oauthSrv.HandleTokenRequest)
			r.HandleFunc("/authorize", oauthSrv.HandleAuthorizeRequest)
			r.HandleFunc("/validate", oauthSrv.HandleValidate)
			r.HandleFunc("/revoke", oauthSrv.HandleRevoke)
		})
		r.HandleFunc("/stripe-webhook", privateResolver.StripeWebhook(ctx, env.Config.StripeWebhookSecret))
		r.HandleFunc("/callback/aws-mp", privateResolver.AWSMPCallback(ctx))
		r.Route("/zapier", func(r chi.Router) {
			zapier.CreateZapierRoutes(r, db, &zapierStore, &rh)
		})
		r.HandleFunc("/slack-events", privateResolver.SlackEventsWebhook(ctx, env.Config.SlackSigningSecret))
		r.Post(fmt.Sprintf("%s/%s", privateEndpoint, "microsoft-teams/bot"), privateResolver.MicrosoftTeamsBotEndpoint)

		r.Route(privateEndpoint, func(r chi.Router) {
			r.Use(cors.New(PRIVATE_GRAPH_CORS_OPTIONS).Handler)
			r.Use(highlightChi.Middleware)
			r.Use(private.PrivateMiddleware)
			if fsClient, ok := storageClient.(*storage.FilesystemClient); ok {
				fsClient.SetupHTTPSListener(r)
			}
			r.Get("/assets/{project_id}/{hash_val}", privateResolver.AssetHandler)
			r.Get("/project-token/{project_id}", privateResolver.ProjectJWTHandler)

			private.AuthClient.SetupListeners(r)

			privateServer := ghandler.New(privategen.NewExecutableSchema(
				privategen.Config{
					Resolvers: privateResolver,
				}),
			)

			privateServer.AddTransport(transport.Websocket{
				InitFunc: private.WebsocketInitializationFunction(),
				Upgrader: websocket.Upgrader{
					CheckOrigin: func(r *http.Request) bool {
						if r == nil || r.Header["Origin"] == nil || len(r.Header["Origin"]) == 0 {
							log.WithContext(ctx).Error("Couldn't validate websocket: no origin")
							return false
						}
						return validateOrigin(r, r.Header["Origin"][0])
					},
				},
				KeepAlivePingInterval: 10 * time.Second,
			})
			privateServer.AddTransport(transport.Options{})
			privateServer.AddTransport(transport.GET{})
			privateServer.AddTransport(transport.POST{})
			privateServer.AddTransport(transport.MultipartForm{})
			privateServer.SetQueryCache(lru.New(1000))
			privateServer.Use(extension.AutomaticPersistedQuery{
				Cache: lru.New(10000),
			})
			privateServer.Use(private.NewGraphqlOAuthValidator(privateResolver.Store))
			privateServer.Use(util.NewTracer(util.PrivateGraph))
			privateServer.Use(htrace.NewGraphqlTracer(string(util.PrivateGraph), trace.WithSpanKind(trace.SpanKindConsumer)).WithRequestFieldLogging())
			privateServer.SetErrorPresenter(htrace.GraphQLErrorPresenter(string(util.PrivateGraph)))
			privateServer.SetRecoverFunc(htrace.GraphQLRecoverFunc())
			r.Handle("/",
				privateServer,
			)
		})
	}
	if runtimeParsed.IsPublicGraph() {
		sessionCache, err := golang_lru.New[string, *model.Session](100_000)
		if err != nil {
			log.Fatalf("error initializing lru cache: %v", err)
		}
		publicResolver := &public.Resolver{
			DB:                db,
			Tracer:            tracer,
			TracerNoResources: tracerNoResources,
			ProducerQueue:     kafkaProducer,
			BatchedQueue:      kafkaBatchedProducer,
			DataSyncQueue:     kafkaDataSyncProducer,
			TracesQueue:       kafkaTracesProducer,
			MailClient:        sendgrid.NewSendClient(env.Config.SendgridKey),
			EmbeddingsClient:  embeddings.New(),
			StorageClient:     storageClient,
			Redis:             redisClient,
			Clickhouse:        clickhouseClient,
			RH:                &rh,
			Store:             dataStore,
			LambdaClient:      lambdaClient,
			SessionCache:      sessionCache,
		}
		publicEndpoint := "/public"
		if runtimeParsed == util.PublicGraph {
			publicEndpoint = "/"
		}
		r.Route(publicEndpoint, func(r chi.Router) {
			r.Use(cors.New(PUBLIC_GRAPH_CORS_OPTIONS).Handler)
			r.Use(highlightChi.Middleware)
			r.Use(public.PublicMiddleware)

			publicServer := ghandler.New(publicgen.NewExecutableSchema(
				publicgen.Config{
					Resolvers: publicResolver,
				}))

			publicServer.AddTransport(transport.Websocket{
				KeepAlivePingInterval: 10 * time.Second,
			})
			publicServer.AddTransport(transport.Options{})
			publicServer.AddTransport(transport.GET{})
			publicServer.AddTransport(transport.POST{})
			publicServer.AddTransport(transport.MultipartForm{})
			publicServer.SetQueryCache(lru.New(1000))
			publicServer.Use(extension.AutomaticPersistedQuery{
				Cache: lru.New(100),
			})

			publicServer.Use(htrace.NewGraphqlTracer(string(util.PublicGraph)))
			publicServer.SetErrorPresenter(htrace.GraphQLErrorPresenter(string(util.PublicGraph)))
			publicServer.SetRecoverFunc(htrace.GraphQLRecoverFunc())
			r.HandleFunc("/cors", assets.HandleAsset)
			r.Handle("/",
				publicServer,
			)
		})
		otelHandler := otel.New(publicResolver)
		otelHandler.Listen(r)
		vercel.Listen(r, tracerNoResources)
		highlightHttp.Listen(r, tracerNoResources)
	}

	/*
		Decide what binary to run
		For the the 'worker' runtime, run only the worker.
		For the the 'all' runtime, run both the server and worker.
		For anything else, just run the server.
	*/
	log.Printf("runtime is: %v \n", runtimeParsed)
	log.Println("process running....")
	if runtimeParsed.IsWorker() {
		sessionCache, err := golang_lru.New[string, *model.Session](100_000)
		if err != nil {
			log.Fatalf("error initializing lru cache: %v", err)
		}
		publicResolver := &public.Resolver{
			DB:                db,
			Tracer:            tracer,
			TracerNoResources: tracerNoResources,
			ProducerQueue:     kafkaProducer,
			BatchedQueue:      kafkaBatchedProducer,
			DataSyncQueue:     kafkaDataSyncProducer,
			TracesQueue:       kafkaTracesProducer,
			MailClient:        sendgrid.NewSendClient(env.Config.SendgridKey),
			EmbeddingsClient:  embeddings.New(),
			StorageClient:     storageClient,
			Redis:             redisClient,
			Clickhouse:        clickhouseClient,
			RH:                &rh,
			Store:             dataStore,
			LambdaClient:      lambdaClient,
			SessionCache:      sessionCache,
		}
		w := &worker.Worker{Resolver: privateResolver, PublicResolver: publicResolver, StorageClient: storageClient}
		if runtimeParsed == util.Worker {
			if !env.IsDevOrTestEnv() && !env.IsOnPrem() {
				serviceName := string(handlerParsed)

				log.WithContext(ctx).Info("Running dd client setup process...")
				if err := dd.Start(serviceName); err != nil {
					log.WithContext(ctx).Error(e.Wrap(err, "error starting dd clients with error"))
				} else {
					defer dd.Stop()
				}
			}
			w.GetHandler(ctx, handlerParsed)(ctx)
		} else {
			go func() {
				w.Start(ctx)
			}()
			// for the 'All' worker, explicitly run all kafka workers
			go w.GetPublicWorker(kafkaqueue.TopicTypeDefault)(ctx)
			go w.GetPublicWorker(kafkaqueue.TopicTypeBatched)(ctx)
			go w.GetPublicWorker(kafkaqueue.TopicTypeDataSync)(ctx)
			go w.GetPublicWorker(kafkaqueue.TopicTypeTraces)(ctx)
			go w.StartLogAlertWatcher(ctx)
			go w.StartMetricAlertWatcher(ctx)
			go w.StartSessionDeleteJob(ctx)
			go func() {
				w.ReportStripeUsage(ctx)
				for range time.Tick(time.Hour) {
					w.ReportStripeUsage(ctx)
				}
			}()
			go func() {
				w.RefreshMaterializedViews(ctx)
				for range time.Tick(time.Hour) {
					w.RefreshMaterializedViews(ctx)
				}
			}()
			go func() {
				w.AutoResolveStaleErrors(ctx)
				for range time.Tick(time.Minute) {
					w.AutoResolveStaleErrors(ctx)
				}
			}()
			if env.IsDevEnv() && env.UseSSL() {
				log.WithContext(ctx).
					WithField("runtime", runtimeParsed).
					WithField("port", defaultPort).
					Info("running HTTPS listener")
				log.Fatal(http.ListenAndServeTLS(":"+defaultPort, localhostCertPath, localhostKeyPath, r))
			} else {
				log.WithContext(ctx).
					WithField("runtime", runtimeParsed).
					WithField("port", defaultPort).
					Info("running HTTP listener")
				log.Fatal(http.ListenAndServe(":"+defaultPort, r))
			}
		}
	} else {
		if env.IsDevEnv() && env.UseSSL() {
			log.WithContext(ctx).
				WithField("runtime", runtimeParsed).
				WithField("port", defaultPort).
				Info("running HTTPS listener")
			log.Fatal(http.ListenAndServeTLS(":"+defaultPort, localhostCertPath, localhostKeyPath, r))
		} else {
			log.WithContext(ctx).
				WithField("runtime", runtimeParsed).
				WithField("port", defaultPort).
				Info("running HTTP listener")
			log.Fatal(http.ListenAndServe(":"+defaultPort, r))
		}
	}
}
