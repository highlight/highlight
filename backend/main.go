package main

import (
	"flag"
	"fmt"
	"github.com/sendgrid/sendgrid-go"
	"html/template"
	"io"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"

	"github.com/gorilla/websocket"
	H "github.com/highlight-run/highlight-go"
	highlightChi "github.com/highlight-run/highlight-go/middleware/chi"

	"github.com/clearbit/clearbit-go/clearbit"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/highlight/backend/worker"
	"github.com/highlight-run/workerpool"
	e "github.com/pkg/errors"
	"github.com/rs/cors"
	"github.com/stripe/stripe-go/v72/client"
	"gopkg.in/DataDog/dd-trace-go.v1/profiler"

	ghandler "github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	dd "github.com/highlight-run/highlight/backend/datadog"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	private "github.com/highlight-run/highlight/backend/private-graph/graph"
	privategen "github.com/highlight-run/highlight/backend/private-graph/graph/generated"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
	publicgen "github.com/highlight-run/highlight/backend/public-graph/graph/generated"
	log "github.com/sirupsen/logrus"
	brotli_enc "gopkg.in/kothar/brotli-go.v0/enc"

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
	prefetchSize        = 8 * 1024 * 1024
	messageSize         = 512 * 1024 * 1024
)

//  we inject this value at build time for on-prem
var SENDGRID_API_KEY string

var runtimeParsed util.Runtime

func init() {
	flag.Parse()
	if runtimeFlag == nil {
		log.Fatal("runtime is nil, provide a value")
	} else if !util.Runtime(*runtimeFlag).IsValid() {
		log.Fatalf("invalid runtime: %v", *runtimeFlag)
	}
	runtimeParsed = util.Runtime(*runtimeFlag)
}

func healthRouter(runtimeFlag util.Runtime) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte(fmt.Sprintf("%v is healthy", runtimeFlag)))
		if err != nil {
			log.Error(e.Wrap(err, "error writing health response"))
		}
	}
}

func validateOrigin(request *http.Request, origin string) bool {
	if runtimeParsed == util.PrivateGraph {
		// From the highlight frontend, only the url is whitelisted.
		isRenderPreviewEnv := strings.HasPrefix(origin, "https://frontend-pr-") && strings.HasSuffix(origin, ".onrender.com")
		// Is this an AWS Amplify environment?
		isAWSEnv := (strings.HasPrefix(origin, "https://pr-") && strings.HasSuffix(origin, ".d25bj3loqvp3nx.amplifyapp.com")) || (origin == "https://master.d25bj3loqvp3nx.amplifyapp.com")

		if origin == frontendURL || origin == "https://www.highlight.run" || origin == "https://highlight.run" || origin == landingStagingURL || isRenderPreviewEnv || isAWSEnv {
			return true
		}
	} else if runtimeParsed == util.PublicGraph || runtimeParsed == util.All {
		return true
	}
	return false
}

var defaultPort = "8082"

func main() {
	// initialize logger
	log.SetReportCaller(true)

	switch os.Getenv("DEPLOYMENT_KEY") {
	case "HIGHLIGHT_ONPREM_BETA":
		// default case, should only exist in main highlight prod
	case "HIGHLIGHT_BEHAVE_HEALTH-i_fgQwbthAdqr9Aat_MzM7iU3!@fKr-_vopjXR@f":
		go expireHighlightAfterDate(time.Date(2021, 10, 1, 0, 0, 0, 0, time.UTC))
	default:
		log.Fatal("please specify a deploy key in order to run Highlight")
	}

	if os.Getenv("ENABLE_OBJECT_STORAGE") == "true" && (os.Getenv("AWS_ACCESS_KEY_ID") == "" || os.Getenv("AWS_S3_BUCKET_NAME") == "" || os.Getenv("AWS_SECRET_ACCESS_KEY") == "") {
		log.Fatalf("please specify object storage env variables in order to proceed")
	}

	if sendgridKey == "" {
		if SENDGRID_API_KEY == "" {
			log.Warn("sendgrid api key is missing")
		} else {
			log.Info("using sendgrid api key injected from build target!")
			sendgridKey = SENDGRID_API_KEY
		}
	} else {
		log.Info("sendgrid api key is present!")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	shouldLog := !util.IsDevOrTestEnv() && !util.IsOnPrem()
	if shouldLog {
		log.Info("Running dd client setup process...")
		if err := dd.Start(runtimeParsed); err != nil {
			log.Fatal(e.Wrap(err, "error starting dd clients with error"))
		} else {
			defer dd.Stop()
		}
	} else {
		log.Info("Excluding dd client setup process...")
	}

	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.Fatalf("error setting up db: %v", err)
	}

	stripeClient := &client.API{}
	stripeClient.Init(stripeApiKey, nil)

	storage, err := storage.NewStorageClient()
	if err != nil {
		log.Fatalf("error creating storage client: %v", err)
	}

	opensearchClient, err := opensearch.NewOpensearchClient()
	if err != nil {
		log.Fatalf("error creating opensearch client: %v", err)
	}

	private.SetupAuthClient()
	privateWorkerpool := workerpool.New(10000)
	privateWorkerpool.SetPanicHandler(util.Recover)
	subscriptionWorkerPool := workerpool.New(1000)
	subscriptionWorkerPool.SetPanicHandler(util.Recover)
	privateResolver := &private.Resolver{
		ClearbitClient:         clearbit.NewClient(clearbit.WithAPIKey(os.Getenv("CLEARBIT_API_KEY"))),
		DB:                     db,
		MailClient:             sendgrid.NewSendClient(sendgridKey),
		StripeClient:           stripeClient,
		StorageClient:          storage,
		PrivateWorkerPool:      privateWorkerpool,
		SubscriptionWorkerPool: subscriptionWorkerPool,
		OpenSearch:             opensearchClient,
	}
	r := chi.NewMux()
	// Common middlewares for both the client/main graphs.
	// r.Use(handlers.CompressHandler)
	compressor := middleware.NewCompressor(5, "application/json")
	compressor.SetEncoder("br", func(w io.Writer, level int) io.Writer {
		params := brotli_enc.NewBrotliParams()
		params.SetQuality(level)
		return brotli_enc.NewBrotliWriter(params, w)
	})
	r.Use(compressor.Handler)
	r.Use(cors.New(cors.Options{
		AllowOriginRequestFunc: validateOrigin,
		AllowCredentials:       true,
		AllowedHeaders:         []string{"*"},
	}).Handler)
	r.HandleFunc("/health", healthRouter(runtimeParsed))
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
		r.HandleFunc("/stripe-webhook", privateResolver.StripeWebhook(stripeWebhookSecret))
		r.HandleFunc("/slack-events", privateResolver.SlackEventsWebhook(slackSigningSecret))
		r.Route(privateEndpoint, func(r chi.Router) {
			r.Use(private.PrivateMiddleware)
			r.Use(highlightChi.Middleware)
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
							log.Error("Couldn't validate websocket: no origin")
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
				log.Fatal(err)
			}
			defer profiler.Stop()
		}
		publicEndpoint := "/public"
		if runtimeParsed == util.PublicGraph {
			publicEndpoint = "/"
		}
		r.Route(publicEndpoint, func(r chi.Router) {
			r.Use(public.PublicMiddleware)
			r.Use(highlightChi.Middleware)
			pushPayloadWorkerPool := workerpool.New(80)
			pushPayloadWorkerPool.SetPanicHandler(util.Recover)
			alertWorkerpool := workerpool.New(40)
			alertWorkerpool.SetPanicHandler(util.Recover)

			kafkaProducerID, err := os.Hostname()
			if err != nil {
				kafkaProducerID = "public-unknown"
			}
			kafkaP, err := kafka.NewProducer(&kafka.ConfigMap{
				"sasl.mechanism":         "SCRAM-SHA-512",
				"security.protocol":      "sasl_ssl",
				"bootstrap.servers":      os.Getenv("KAFKA_SERVERS"),
				"sasl.username":          os.Getenv("KAFKA_SASL_USERNAME"),
				"sasl.password":          os.Getenv("KAFKA_SASL_PASSWORD"),
				"client.id":              kafkaProducerID,
				"message.max.bytes":      messageSize,
				"queue.buffering.max.ms": 100,
				"acks":                   1})
			if err != nil {
				log.Fatalf("error setting up kafka-queue producer: `%v", err)
			}
			publicServer := ghandler.NewDefaultServer(publicgen.NewExecutableSchema(
				publicgen.Config{
					Resolvers: &public.Resolver{
						DB:                    db,
						ProducerQueue:         kafka_queue.New(os.Getenv("KAFKA_TOPIC"), kafkaP, nil),
						MailClient:            sendgrid.NewSendClient(sendgridKey),
						StorageClient:         storage,
						PushPayloadWorkerPool: pushPayloadWorkerPool,
						AlertWorkerPool:       alertWorkerpool,
						OpenSearch:            opensearchClient,
					},
				}))
			publicServer.Use(util.NewTracer(util.PublicGraph))
			publicServer.SetErrorPresenter(util.GraphQLErrorPresenter(string(util.PublicGraph)))
			publicServer.SetRecoverFunc(util.GraphQLRecoverFunc())
			r.Handle("/",
				publicServer,
			)
		})
	}

	if util.IsDevOrTestEnv() {
		log.Info("overwriting highlight-go graphql client address...")
		H.SetGraphqlClientAddress("http://localhost:8082/public")
	}
	H.Start()
	defer H.Stop()
	H.SetDebugMode(log.StandardLogger())

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
		pushPayloadWorkerPool := workerpool.New(80)
		pushPayloadWorkerPool.SetPanicHandler(util.Recover)
		alertWorkerpool := workerpool.New(40)
		alertWorkerpool.SetPanicHandler(util.Recover)
		publicResolver := &public.Resolver{
			DB:                    db,
			MailClient:            sendgrid.NewSendClient(sendgridKey),
			StorageClient:         storage,
			PushPayloadWorkerPool: pushPayloadWorkerPool,
			AlertWorkerPool:       alertWorkerpool,
			OpenSearch:            opensearchClient,
		}
		kafkaC, err := kafka.NewConsumer(&kafka.ConfigMap{
			"sasl.mechanism":                  "SCRAM-SHA-512",
			"security.protocol":               "sasl_ssl",
			"bootstrap.servers":               os.Getenv("KAFKA_SERVERS"),
			"sasl.username":                   os.Getenv("KAFKA_SASL_USERNAME"),
			"sasl.password":                   os.Getenv("KAFKA_SASL_PASSWORD"),
			"group.id":                        "group-default",
			"auto.offset.reset":               "smallest",
			"go.application.rebalance.enable": true,
			"queued.min.messages":             kafka_queue.LocalConsumerPrefetch * kafka_queue.ConsumerWorkers,
			"statistics.interval.ms":          5000,
			"fetch.message.max.bytes":         prefetchSize,
			"message.max.bytes":               messageSize,
			"receive.message.max.bytes":       messageSize + 1*1024*1024,
		})
		if err != nil {
			log.Fatalf("error setting up kafka-queue consumer: %v", err)
		}
		consumerQueue := kafka_queue.New(os.Getenv("KAFKA_TOPIC"), nil, kafkaC)
		w := &worker.Worker{Resolver: privateResolver, PublicResolver: publicResolver, S3Client: storage, KafkaQueue: consumerQueue}
		if runtimeParsed == util.Worker {
			if !util.IsDevOrTestEnv() {
				err := profiler.Start(profiler.WithService("worker-service"), profiler.WithProfileTypes(profiler.HeapProfile, profiler.CPUProfile))
				if err != nil {
					log.Fatal(err)
				}
				defer profiler.Stop()
			}
			if handlerFlag != nil && *handlerFlag != "" {
				w.GetHandler(*handlerFlag)()
			} else {
				go func() {
					w.Start()
				}()
				log.Fatal(http.ListenAndServe(":"+port, r))
			}
		} else {
			go func() {
				w.Start()
			}()
			go w.PublicWorker()
			log.Fatal(http.ListenAndServe(":"+port, r))
		}
	} else {
		log.Fatal(http.ListenAndServe(":"+port, r))
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
