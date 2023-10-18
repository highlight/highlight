package main

import (
	"context"
	"flag"
	"fmt"
	"html/template"
	"io"
	"math/rand"
	"net/http"
	"os"
	"path"
	"strings"
	"sync"
	"time"

	"github.com/highlight-run/highlight/backend/embeddings"

	ghandler "github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/andybalholm/brotli"
	"github.com/clearbit/clearbit-go/clearbit"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/httplog"
	"github.com/gorilla/websocket"
	"github.com/highlight-run/go-resthooks"
	"github.com/highlight-run/highlight/backend/clickhouse"
	dd "github.com/highlight-run/highlight/backend/datadog"
	highlightHttp "github.com/highlight-run/highlight/backend/http"
	hubspotApi "github.com/highlight-run/highlight/backend/hubspot"
	"github.com/highlight-run/highlight/backend/integrations"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/lambda"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/oauth"
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
	"github.com/highlight-run/highlight/backend/timeseries"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/highlight/backend/vercel"
	"github.com/highlight-run/highlight/backend/worker"
	"github.com/highlight-run/highlight/backend/zapier"
	"github.com/highlight-run/workerpool"
	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
	"github.com/leonelquinteros/hubspot"
	e "github.com/pkg/errors"
	"github.com/rs/cors"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v72/client"
	"gopkg.in/DataDog/dd-trace-go.v1/profiler"
	"gorm.io/gorm"

	_ "github.com/urfave/cli/v2"
	_ "gorm.io/gorm"
)

var (
	frontendURL         = os.Getenv("FRONTEND_URI")
	staticFrontendPath  = os.Getenv("ONPREM_STATIC_FRONTEND_PATH")
	landingStagingURL   = os.Getenv("LANDING_PAGE_STAGING_URI")
	sendgridKey         = os.Getenv("SENDGRID_API_KEY")
	stripeApiKey        = os.Getenv("STRIPE_API_KEY")
	stripeWebhookSecret = os.Getenv("STRIPE_WEBHOOK_SECRET")
	slackSigningSecret  = os.Getenv("SLACK_SIGNING_SECRET")
	otlpEndpoint        = os.Getenv("OTLP_ENDPOINT")
	runtimeFlag         = flag.String("runtime", "all", "the runtime of the backend; either 1) dev (all runtimes) 2) worker 3) public-graph 4) private-graph")
	handlerFlag         = flag.String("worker-handler", "", "applies for runtime=worker; if specified, a handler function will be called instead of Start")
)

// we inject this value at build time for on-prem
var SENDGRID_API_KEY string

var runtimeParsed util.Runtime

const (
	localhostCertPath = "localhostssl/server.crt"
	localhostKeyPath  = "localhostssl/server.key"
)

func init() {
	flag.Parse()
	if runtimeFlag == nil {
		log.Fatal("runtime is nil, provide a value")
	} else if !util.Runtime(*runtimeFlag).IsValid() {
		log.Fatalf("invalid runtime: %v", *runtimeFlag)
	}
	runtimeParsed = util.Runtime(*runtimeFlag)
}

func healthRouter(runtimeFlag util.Runtime, db *gorm.DB, tdb timeseries.DB, rClient *redis.Client, ccClient *clickhouse.Client, queue *kafkaqueue.Queue, batchedQueue *kafkaqueue.Queue) http.HandlerFunc {
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
			if err := enhancedHealthCheck(ctx, db, tdb, rClient, ccClient); err != nil {
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

func enhancedHealthCheck(ctx context.Context, db *gorm.DB, tdb timeseries.DB, rClient *redis.Client, ccClient *clickhouse.Client) error {
	const Timeout = 5 * time.Second

	errors := make(chan error, 5)
	wg := sync.WaitGroup{}
	wg.Add(4)
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
		// in prod, the bucket contains the project id
		// bucket := "dev-1"
		if util.IsDevOrTestEnv() {
			bucket := "dev-bucket"
			if _, err := tdb.Query(ctx, fmt.Sprintf(`from(bucket: "%s") |> range(start: -1m)`, bucket)); err != nil {
				msg := fmt.Sprintf("failed to query influx db: %s", err)
				log.WithContext(ctx).Error(msg)
				errors <- e.New(msg)
			}
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

func validateOrigin(_ *http.Request, origin string) bool {
	if runtimeParsed == util.PrivateGraph {
		// From the highlight frontend, only the url is whitelisted.
		isRenderPreviewEnv := strings.HasPrefix(origin, "https://frontend-pr-") && strings.HasSuffix(origin, ".onrender.com")
		// Is this an AWS Amplify environment?
		isAWSEnv := strings.HasPrefix(origin, "https://pr-") && strings.HasSuffix(origin, ".d25bj3loqvp3nx.amplifyapp.com")
		isReflamePreview := origin == "https://preview.highlight.io"

		if origin == frontendURL || origin == "https://app.highlight.run" || origin == "https://app.highlight.io" || origin == landingStagingURL || isRenderPreviewEnv || isAWSEnv || isReflamePreview {
			return true
		}
	} else if runtimeParsed == util.PublicGraph || runtimeParsed == util.All {
		return true
	}
	return false
}

var defaultPort = "8082"

func main() {
	rand.New(rand.NewSource(time.Now().UnixNano()))
	ctx := context.TODO()

	// setup highlight
	highlight.SetProjectID("1jdkoe52")

	// change OTLP endpoint when set in env
	if otlpEndpoint != "" {
		log.WithContext(ctx).Info("overwriting highlight-go graphql / otlp client address...")
		highlight.SetOTLPEndpoint(otlpEndpoint)
	}

	serviceName := string(runtimeParsed)
	if runtimeParsed == util.Worker {
		if handlerFlag != nil {
			serviceName = *handlerFlag
		}
	}

	highlight.Start(
		highlight.WithServiceName(serviceName),
		highlight.WithServiceVersion(os.Getenv("REACT_APP_COMMIT_SHA")),
	)
	defer highlight.Stop()
	highlight.SetDebugMode(log.StandardLogger())

	// setup highlight logrus hook
	hlog.Init()
	log.WithContext(ctx).WithField("hello", "world").Info("welcome to highlight.io")
	if err := phonehome.Start(ctx); err != nil {
		log.WithContext(ctx).Warn("Failed to start highlight phone-home service.")
	}

	if sendgridKey == "" {
		if SENDGRID_API_KEY == "" {
			log.WithContext(ctx).Warn("sendgrid api key is missing")
		} else {
			log.WithContext(ctx).Info("using sendgrid api key injected from build target!")
			sendgridKey = SENDGRID_API_KEY
		}
	} else {
		log.WithContext(ctx).Info("sendgrid api key is present!")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	shouldLog := !util.IsDevOrTestEnv() && !util.IsOnPrem()
	if shouldLog {
		log.WithContext(ctx).Info("Running dd client setup process...")
		if err := dd.Start(runtimeParsed); err != nil {
			log.WithContext(ctx).Fatal(e.Wrap(err, "error starting dd clients with error"))
		} else {
			defer dd.Stop()
		}
	} else {
		log.WithContext(ctx).Info("Excluding dd client setup process...")
	}

	db, err := model.SetupDB(ctx, os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatalf("Error setting up DB: %v", err)
	}

	if util.IsDevEnv() {
		_, err := model.MigrateDB(ctx, db)

		if err != nil {
			log.WithContext(ctx).Fatalf("Error migrating DB: %v", err)
		}
	}

	tdb := timeseries.New(ctx)
	stripeClient := &client.API{}
	stripeClient.Init(stripeApiKey, nil)

	var storageClient storage.Client
	if util.IsInDocker() {
		log.WithContext(ctx).Info("in docker: using filesystem for object storage")
		fsRoot := "/tmp"
		if os.Getenv("OBJECT_STORAGE_FS") != "" {
			fsRoot = os.Getenv("OBJECT_STORAGE_FS")
		}
		if storageClient, err = storage.NewFSClient(ctx, os.Getenv("REACT_APP_PRIVATE_GRAPH_URI"), fsRoot); err != nil {
			log.WithContext(ctx).Fatalf("error creating filesystem storage client: %v", err)
		}
	} else {
		log.WithContext(ctx).Info("using S3 for object storage")
		if os.Getenv("AWS_ACCESS_KEY_ID") == "" || os.Getenv("AWS_S3_BUCKET_NAME") == "" || os.Getenv("AWS_SECRET_ACCESS_KEY") == "" {
			log.WithContext(ctx).Fatalf("please specify object storage env variables in order to proceed")
		}
		if storageClient, err = storage.NewS3Client(ctx); err != nil {
			log.WithContext(ctx).Fatalf("error creating s3 storage client: %v", err)
		}
	}

	kafkaProducer := kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Type: kafkaqueue.TopicTypeDefault}), kafkaqueue.Producer, nil)
	kafkaBatchedProducer := kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Type: kafkaqueue.TopicTypeBatched}), kafkaqueue.Producer, nil)
	kafkaTracesProducer := kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Type: kafkaqueue.TopicTypeTraces}), kafkaqueue.Producer, nil)
	kafkaDataSyncProducer := kafkaqueue.New(ctx,
		kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Type: kafkaqueue.TopicTypeDataSync}),
		kafkaqueue.Producer, nil)

	lambda, err := lambda.NewLambdaClient()
	if err != nil {
		log.WithContext(ctx).Errorf("error creating lambda client: %v", err)
	}

	redisClient := redis.NewClient()
	sfnClient := stepfunctions.NewClient()

	clickhouseClient, err := clickhouse.NewClient(clickhouse.PrimaryDatabase)
	if err != nil {
		log.WithContext(ctx).Fatalf("error creating clickhouse client: %v", err)
	}

	clickhouse.RunMigrations(ctx, clickhouse.PrimaryDatabase)

	oauthSrv, err := oauth.CreateServer(ctx, db)
	if err != nil {
		log.WithContext(ctx).Fatalf("error creating oauth client: %v", err)
	}

	integrationsClient := integrations.NewIntegrationsClient(db)

	privateWorkerpool := workerpool.New(10000)
	privateWorkerpool.SetPanicHandler(util.Recover)
	subscriptionWorkerPool := workerpool.New(1000)
	subscriptionWorkerPool.SetPanicHandler(util.Recover)
	privateResolver := &private.Resolver{
		ClearbitClient:         clearbit.NewClient(clearbit.WithAPIKey(os.Getenv("CLEARBIT_API_KEY"))),
		DB:                     db,
		TDB:                    tdb,
		MailClient:             sendgrid.NewSendClient(sendgridKey),
		StripeClient:           stripeClient,
		StorageClient:          storageClient,
		LambdaClient:           lambda,
		EmbeddingsClient:       embeddings.New(),
		PrivateWorkerPool:      privateWorkerpool,
		SubscriptionWorkerPool: subscriptionWorkerPool,
		HubspotApi:             hubspotApi.NewHubspotAPI(hubspot.NewClient(hubspot.NewClientConfig()), db, redisClient, kafkaProducer),
		Redis:                  redisClient,
		StepFunctions:          sfnClient,
		OAuthServer:            oauthSrv,
		IntegrationsClient:     integrationsClient,
		ClickhouseClient:       clickhouseClient,
		Store:                  store.NewStore(db, redisClient, integrationsClient, storageClient, kafkaDataSyncProducer),
		DataSyncQueue:          kafkaDataSyncProducer,
		TracesQueue:            kafkaTracesProducer,
	}
	private.SetupAuthClient(ctx, private.GetEnvAuthMode(), oauthSrv, privateResolver.Query().APIKeyToOrgID)
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
	r.Use(cors.New(cors.Options{
		AllowOriginRequestFunc: validateOrigin,
		AllowCredentials:       true,
		AllowedHeaders:         []string{"*"},
	}).Handler)
	r.HandleFunc("/health", healthRouter(runtimeParsed, db, tdb, redisClient, clickhouseClient, kafkaProducer, kafkaBatchedProducer))

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
	if runtimeParsed == util.PrivateGraph || runtimeParsed == util.All {
		privateEndpoint := "/private"
		if runtimeParsed == util.PrivateGraph {
			privateEndpoint = "/"
		}

		r.Route("/oauth", func(r chi.Router) {
			r.Use(private.PrivateMiddleware)
			r.HandleFunc("/token", oauthSrv.HandleTokenRequest)
			r.HandleFunc("/authorize", oauthSrv.HandleAuthorizeRequest)
			r.HandleFunc("/validate", oauthSrv.HandleValidate)
			r.HandleFunc("/revoke", oauthSrv.HandleRevoke)
		})
		r.HandleFunc("/stripe-webhook", privateResolver.StripeWebhook(ctx, stripeWebhookSecret))
		r.Route("/zapier", func(r chi.Router) {
			zapier.CreateZapierRoutes(r, db, &zapierStore, &rh)
		})
		r.HandleFunc("/slack-events", privateResolver.SlackEventsWebhook(ctx, slackSigningSecret))
		r.Post(fmt.Sprintf("%s/%s", privateEndpoint, "login"), privateResolver.Login)
		r.Route(privateEndpoint, func(r chi.Router) {
			r.Use(private.PrivateMiddleware)
			r.Use(highlightChi.Middleware)
			if fsClient, ok := storageClient.(*storage.FilesystemClient); ok {
				fsClient.SetupHTTPSListener(r)
			}
			r.Get("/assets/{project_id}/{hash_val}", privateResolver.AssetHandler)
			r.Get("/project-token/{project_id}", privateResolver.ProjectJWTHandler)

			r.Get("/validate-token", privateResolver.ValidateAuthToken)

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
			privateServer.Use(extension.Introspection{})
			privateServer.Use(extension.AutomaticPersistedQuery{
				Cache: lru.New(10000),
			})
			privateServer.Use(private.NewGraphqlOAuthValidator(privateResolver.Store))
			privateServer.Use(highlight.NewGraphqlTracer(string(util.PrivateGraph)).WithRequestFieldLogging())
			privateServer.Use(util.NewTracer(util.PrivateGraph))
			privateServer.SetErrorPresenter(highlight.GraphQLErrorPresenter(string(util.PrivateGraph)))
			privateServer.SetRecoverFunc(highlight.GraphQLRecoverFunc())
			r.Handle("/",
				privateServer,
			)
		})
	}
	if runtimeParsed == util.PublicGraph || runtimeParsed == util.All {
		if !util.IsDevOrTestEnv() && !util.IsOnPrem() {
			err := profiler.Start(profiler.WithService("public-graph-service"), profiler.WithProfileTypes(profiler.HeapProfile, profiler.CPUProfile))
			if err != nil {
				log.WithContext(ctx).Fatal(err)
			}
			defer profiler.Stop()
		}
		publicResolver := &public.Resolver{
			DB:               db,
			TDB:              tdb,
			ProducerQueue:    kafkaProducer,
			BatchedQueue:     kafkaBatchedProducer,
			DataSyncQueue:    kafkaDataSyncProducer,
			TracesQueue:      kafkaTracesProducer,
			MailClient:       sendgrid.NewSendClient(sendgridKey),
			EmbeddingsClient: embeddings.New(),
			StorageClient:    storageClient,
			HubspotApi:       hubspotApi.NewHubspotAPI(hubspot.NewClient(hubspot.NewClientConfig()), db, redisClient, kafkaProducer),
			Redis:            redisClient,
			RH:               &rh,
			Store:            store.NewStore(db, redisClient, integrationsClient, storageClient, kafkaDataSyncProducer),
		}
		publicEndpoint := "/public"
		if runtimeParsed == util.PublicGraph {
			publicEndpoint = "/"
		}
		r.Route(publicEndpoint, func(r chi.Router) {
			r.Use(public.PublicMiddleware)
			r.Use(highlightChi.Middleware)

			publicServer := ghandler.NewDefaultServer(publicgen.NewExecutableSchema(
				publicgen.Config{
					Resolvers: publicResolver,
				}))
			publicServer.Use(highlight.NewGraphqlTracer(string(util.PublicGraph)))
			publicServer.Use(util.NewTracer(util.PublicGraph))
			publicServer.SetErrorPresenter(highlight.GraphQLErrorPresenter(string(util.PublicGraph)))
			publicServer.SetRecoverFunc(highlight.GraphQLRecoverFunc())
			r.Handle("/",
				publicServer,
			)
		})
		otelHandler := otel.New(publicResolver)
		otelHandler.Listen(r)
		vercel.Listen(r)
		highlightHttp.Listen(r)
	}

	/*
		Run a simple server that runs the frontend if 'staticFrontedPath' and 'all' is set.
	*/
	if staticFrontendPath != "" && util.IsOnPrem() {
		log.Printf("static frontend path: %v \n", staticFrontendPath)
		staticHtmlPath := path.Join(staticFrontendPath, "index.html")
		t, err := template.ParseFiles(staticHtmlPath)
		if err != nil {
			log.Fatalf("error templating html file: %v", err)
		}
		log.Printf("static frontend html path: %v \n", staticHtmlPath)
		f, err := os.Create(staticHtmlPath)
		if err != nil {
			log.Fatalf("error creating file: %v \n", err)
		}
		c := struct {
			FirebaseConfigString string
		}{
			FirebaseConfigString: os.Getenv("REACT_APP_FIREBASE_CONFIG_OBJECT"),
		}
		err = t.Execute(f, c)
		if err != nil {
			log.Fatalf("error executing golang template: %v \n", err)
		}

		log.Printf("running templating script: %v \n", staticFrontendPath)
		fileHandler := http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			fileServer := http.FileServer(http.Dir(staticFrontendPath))
			staticIndex := strings.Index(req.URL.Path, "/static/")
			if staticIndex == -1 {
				// If we're not fetching a static file, return the index.html file directly.
				fsHandler := http.StripPrefix(req.URL.Path, fileServer)
				fsHandler.ServeHTTP(w, req)
			} else {
				// If we are fetching a static file, serve it.
				fileServer.ServeHTTP(w, req)
			}
		})
		r.Handle("/*", fileHandler)
	}

	/*
		Decide what binary to run
		For the the 'worker' runtime, run only the worker.
		For the the 'all' runtime, run both the server and worker.
		For anything else, just run the server.
	*/
	log.Printf("runtime is: %v \n", runtimeParsed)
	log.Println("process running....")
	if runtimeParsed == util.Worker || runtimeParsed == util.All {
		publicResolver := &public.Resolver{
			DB:               db,
			TDB:              tdb,
			ProducerQueue:    kafkaProducer,
			BatchedQueue:     kafkaBatchedProducer,
			DataSyncQueue:    kafkaDataSyncProducer,
			TracesQueue:      kafkaTracesProducer,
			MailClient:       sendgrid.NewSendClient(sendgridKey),
			EmbeddingsClient: embeddings.New(),
			StorageClient:    storageClient,
			HubspotApi:       hubspotApi.NewHubspotAPI(hubspot.NewClient(hubspot.NewClientConfig()), db, redisClient, kafkaProducer),
			Redis:            redisClient,
			Clickhouse:       clickhouseClient,
			RH:               &rh,
			Store:            store.NewStore(db, redisClient, integrationsClient, storageClient, kafkaDataSyncProducer),
		}
		w := &worker.Worker{Resolver: privateResolver, PublicResolver: publicResolver, StorageClient: storageClient}
		if runtimeParsed == util.Worker {
			if !util.IsDevOrTestEnv() && !util.IsOnPrem() {
				serviceName := "worker-service"
				if handlerFlag != nil && *handlerFlag != "" {
					serviceName = *handlerFlag
				}
				err := profiler.Start(profiler.WithService(serviceName), profiler.WithProfileTypes(profiler.HeapProfile, profiler.CPUProfile))
				if err != nil {
					log.Fatal(err)
				}
				defer profiler.Stop()
			}
			if handlerFlag != nil && *handlerFlag != "" {
				func() {
					defer util.RecoverAndCrash()
					w.GetHandler(ctx, *handlerFlag)(ctx)
				}()
			} else {
				go func() {
					w.Start(ctx)
				}()
				if util.IsDevEnv() {
					log.Fatal(http.ListenAndServeTLS(":"+port, localhostCertPath, localhostKeyPath, r))
				} else {
					log.Fatal(http.ListenAndServe(":"+port, r))
				}
			}
		} else {
			go func() {
				w.Start(ctx)
			}()
			// for the 'All' worker, explicitly run all kafka workers
			go w.GetPublicWorker(kafkaqueue.TopicTypeDefault)(ctx)
			go w.GetPublicWorker(kafkaqueue.TopicTypeBatched)(ctx)
			go w.GetPublicWorker(kafkaqueue.TopicTypeDataSync)(ctx)
			go w.GetPublicWorker(kafkaqueue.TopicTypeTraces)(ctx)
			// in `all` mode, report stripe usage every hour
			go func() {
				w.ReportStripeUsage(ctx)
				for range time.Tick(time.Hour) {
					w.ReportStripeUsage(ctx)
				}
			}()
			// in `all` mode, refresh materialized views every hour
			go func() {
				w.RefreshMaterializedViews(ctx)
				for range time.Tick(time.Hour) {
					w.RefreshMaterializedViews(ctx)
				}
			}()
			if util.IsDevEnv() {
				log.Fatal(http.ListenAndServeTLS(":"+port, localhostCertPath, localhostKeyPath, r))
			} else {
				log.Fatal(http.ListenAndServe(":"+port, r))
			}
		}
	} else {
		if util.IsDevEnv() {
			log.Fatal(http.ListenAndServeTLS(":"+port, localhostCertPath, localhostKeyPath, r))
		} else {
			log.Fatal(http.ListenAndServe(":"+port, r))
		}
	}
}
