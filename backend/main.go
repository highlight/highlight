package main

import (
	"context"
	"flag"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"os"
	"path"
	"strings"
	"sync"
	"time"

	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/otel"

	"github.com/andybalholm/brotli"
	"github.com/highlight-run/highlight/backend/integrations"
	"github.com/highlight-run/highlight/backend/oauth"

	"github.com/highlight-run/go-resthooks"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/stepfunctions"
	"github.com/highlight-run/highlight/backend/timeseries"

	"github.com/highlight-run/highlight/backend/lambda"

	hubspotApi "github.com/highlight-run/highlight/backend/hubspot"
	"github.com/leonelquinteros/hubspot"

	"github.com/sendgrid/sendgrid-go"

	"github.com/clearbit/clearbit-go/clearbit"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/httplog"
	"github.com/gorilla/websocket"
	kafkaqueue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/highlight/backend/vercel"
	"github.com/highlight-run/highlight/backend/worker"
	"github.com/highlight-run/highlight/backend/zapier"
	"github.com/highlight-run/workerpool"
	H "github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
	e "github.com/pkg/errors"
	"github.com/rs/cors"
	"github.com/stripe/stripe-go/v72/client"
	"gopkg.in/DataDog/dd-trace-go.v1/profiler"

	ghandler "github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	dd "github.com/highlight-run/highlight/backend/datadog"
	private "github.com/highlight-run/highlight/backend/private-graph/graph"
	privategen "github.com/highlight-run/highlight/backend/private-graph/graph/generated"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
	publicgen "github.com/highlight-run/highlight/backend/public-graph/graph/generated"
	storage "github.com/highlight-run/highlight/backend/storage"
	log "github.com/sirupsen/logrus"

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

func healthRouter(runtimeFlag util.Runtime, db *gorm.DB, tdb timeseries.DB, rClient *redis.Client, osClient *opensearch.Client, ccClient *clickhouse.Client) http.HandlerFunc {
	// only checks kafka because kafka is the only critical infrastructure needed for public graph to be healthy.
	topic := kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Batched: false})
	queue := kafkaqueue.New(context.Background(), topic, kafkaqueue.Producer)
	batchedTopic := kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Batched: true})
	batchedQueue := kafkaqueue.New(context.Background(), batchedTopic, kafkaqueue.Producer)
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		if err := queue.Submit(ctx, &kafkaqueue.Message{Type: kafkaqueue.HealthCheck}, "health"); err != nil {
			http.Error(w, fmt.Sprintf("failed to write message to kafka %s", topic), 500)
			return
		}
		if err := batchedQueue.Submit(ctx, &kafkaqueue.Message{Type: kafkaqueue.HealthCheck}, "health"); err != nil {
			http.Error(w, fmt.Sprintf("failed to write message to kafka %s", batchedTopic), 500)
			return
		}
		if runtimeFlag != util.PublicGraph {
			if err := enhancedHealthCheck(ctx, db, tdb, rClient, osClient, ccClient); err != nil {
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

func enhancedHealthCheck(ctx context.Context, db *gorm.DB, tdb timeseries.DB, rClient *redis.Client, osClient *opensearch.Client, ccClient *clickhouse.Client) error {
	const Timeout = 5 * time.Second

	errors := make(chan error, 5)
	wg := sync.WaitGroup{}
	wg.Add(5)
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
		if err := osClient.IndexSynchronous(ctx, opensearch.IndexSessions, 0, struct{}{}); err != nil {
			msg := fmt.Sprintf("failed to perform opensearch index: %s", err)
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

		if origin == frontendURL || origin == "https://app.highlight.run" || origin == "https://app.highlight.io" || origin == landingStagingURL || isRenderPreviewEnv || isAWSEnv {
			return true
		}
	} else if runtimeParsed == util.PublicGraph || runtimeParsed == util.All {
		return true
	}
	return false
}

var defaultPort = "8082"

func main() {
	ctx := context.TODO()

	// initialize logger
	log.SetReportCaller(true)
	// setup highlight
	H.SetProjectID("1jdkoe52")
	if util.IsDevOrTestEnv() {
		log.WithContext(ctx).Info("overwriting highlight-go graphql client address...")
		H.SetGraphqlClientAddress("https://localhost:8082/public")
		if util.IsInDocker() {
			H.SetOTLPEndpoint("http://collector:4318")
		}
	}
	H.Start()
	defer H.Stop()
	H.SetDebugMode(log.StandardLogger())
	hlog.SetOutput(true)
	hlog.SetOutputLevel(hlog.DebugLevel)
	hlog.WithContext(ctx).Info("welcome to highlight.io")
	// setup highlight logrus hook
	log.AddHook(hlog.NewHook(hlog.WithLevels(
		log.PanicLevel,
		log.FatalLevel,
		log.ErrorLevel,
		log.WarnLevel,
		log.InfoLevel,
	)))

	switch os.Getenv("DEPLOYMENT_KEY") {
	case "HIGHLIGHT_ONPREM_BETA":
		// default case, should only exist in main highlight prod
	case "HIGHLIGHT_BEHAVE_HEALTH-i_fgQwbthAdqr9Aat_MzM7iU3!@fKr-_vopjXR@f":
		go expireHighlightAfterDate(time.Date(2021, 10, 1, 0, 0, 0, 0, time.UTC))
	default:
		log.WithContext(ctx).Fatal("please specify a deploy key in order to run Highlight")
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
		if storageClient, err = storage.NewFSClient(ctx, os.Getenv("PRIVATE_GRAPH_URI"), fsRoot); err != nil {
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

	opensearchClient, err := opensearch.NewOpensearchClient(db)
	if err != nil {
		log.WithContext(ctx).Fatalf("error creating opensearch client: %v", err)
	}

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
		PrivateWorkerPool:      privateWorkerpool,
		SubscriptionWorkerPool: subscriptionWorkerPool,
		OpenSearch:             opensearchClient,
		HubspotApi:             hubspotApi.NewHubspotAPI(hubspot.NewClient(hubspot.NewClientConfig())),
		Redis:                  redisClient,
		StepFunctions:          sfnClient,
		OAuthServer:            oauthSrv,
		IntegrationsClient:     integrationsClient,
		ClickhouseClient:       clickhouseClient,
	}
	authMode := private.Firebase
	if util.IsInDocker() {
		authMode = private.Simple
	}
	private.SetupAuthClient(ctx, authMode, oauthSrv, privateResolver.Query().APIKeyToOrgID)
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
	r.HandleFunc("/health", healthRouter(runtimeParsed, db, tdb, redisClient, opensearchClient, clickhouseClient))

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
		r.Route(privateEndpoint, func(r chi.Router) {
			r.Use(private.PrivateMiddleware)
			r.Use(highlightChi.Middleware)
			if fsClient, ok := storageClient.(*storage.FilesystemClient); ok {
				fsClient.SetupHTTPSListener(r)
			}
			r.Get("/assets/{project_id}/{hash_val}", privateResolver.AssetHandler)
			r.Get("/project-token/{project_id}", privateResolver.ProjectJWTHandler)

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
				Cache: lru.New(100),
			})

			privateServer.Use(util.NewTracer(util.PrivateGraph))
			privateServer.Use(H.NewGraphqlTracer(string(util.PrivateGraph)))
			privateServer.SetErrorPresenter(util.GraphQLErrorPresenter(string(util.PrivateGraph)))
			privateServer.SetRecoverFunc(util.GraphQLRecoverFunc())
			r.Handle("/",
				privateServer,
			)
		})
	}
	if runtimeParsed == util.PublicGraph || runtimeParsed == util.All {
		if !util.IsDevOrTestEnv() {
			err := profiler.Start(profiler.WithService("public-graph-service"), profiler.WithProfileTypes(profiler.HeapProfile, profiler.CPUProfile))
			if err != nil {
				log.WithContext(ctx).Fatal(err)
			}
			defer profiler.Stop()
		}
		alertWorkerpool := workerpool.New(40)
		alertWorkerpool.SetPanicHandler(util.Recover)
		publicResolver := &public.Resolver{
			DB:              db,
			TDB:             tdb,
			ProducerQueue:   kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Batched: false}), kafkaqueue.Producer),
			BatchedQueue:    kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Batched: true}), kafkaqueue.Producer),
			MailClient:      sendgrid.NewSendClient(sendgridKey),
			StorageClient:   storageClient,
			AlertWorkerPool: alertWorkerpool,
			OpenSearch:      opensearchClient,
			HubspotApi:      hubspotApi.NewHubspotAPI(hubspot.NewClient(hubspot.NewClientConfig())),
			Redis:           redisClient,
			RH:              &rh,
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
			publicServer.Use(util.NewTracer(util.PublicGraph))
			publicServer.Use(H.NewGraphqlTracer(string(util.PublicGraph)))
			publicServer.SetErrorPresenter(util.GraphQLErrorPresenter(string(util.PublicGraph)))
			publicServer.SetRecoverFunc(util.GraphQLRecoverFunc())
			r.Handle("/",
				publicServer,
			)
		})
		otelHandler := otel.New(publicResolver)
		otelHandler.Listen(r)
		vercel.Listen(r)
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
		alertWorkerpool := workerpool.New(40)
		alertWorkerpool.SetPanicHandler(util.Recover)
		publicResolver := &public.Resolver{
			DB:              db,
			TDB:             tdb,
			ProducerQueue:   kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Batched: false}), kafkaqueue.Producer),
			BatchedQueue:    kafkaqueue.New(ctx, kafkaqueue.GetTopic(kafkaqueue.GetTopicOptions{Batched: true}), kafkaqueue.Producer),
			MailClient:      sendgrid.NewSendClient(sendgridKey),
			StorageClient:   storageClient,
			AlertWorkerPool: alertWorkerpool,
			OpenSearch:      opensearchClient,
			HubspotApi:      hubspotApi.NewHubspotAPI(hubspot.NewClient(hubspot.NewClientConfig())),
			Redis:           redisClient,
			Clickhouse:      clickhouseClient,
			RH:              &rh,
		}
		w := &worker.Worker{Resolver: privateResolver, PublicResolver: publicResolver, StorageClient: storageClient}
		if runtimeParsed == util.Worker {
			if !util.IsDevOrTestEnv() {
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
				w.GetHandler(ctx, *handlerFlag)(ctx)
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
			// for the 'All' worker, explicitly run the PublicWorker as well
			go w.PublicWorker(ctx)
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

func expireHighlightAfterDate(endDate time.Time) {
	for {
		if time.Now().After(endDate) {
			log.Fatalf("your highlight trial has expired")
		}
		time.Sleep(time.Hour)
	}
}
