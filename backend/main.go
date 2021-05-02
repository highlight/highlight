package main

import (
	"flag"
	"net/http"
	"os"
	"strings"

	"github.com/DataDog/datadog-go/statsd"
	"github.com/go-chi/chi"
	"github.com/gorilla/handlers"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/highlight/backend/worker"
	"github.com/rs/cors"
	"github.com/sendgrid/sendgrid-go"
	"github.com/stripe/stripe-go/client"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	ghandler "github.com/99designs/gqlgen/graphql/handler"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	private "github.com/highlight-run/highlight/backend/private-graph/graph"
	privategen "github.com/highlight-run/highlight/backend/private-graph/graph/generated"
	public "github.com/highlight-run/highlight/backend/public-graph/graph"
	publicgen "github.com/highlight-run/highlight/backend/public-graph/graph/generated"
	log "github.com/sirupsen/logrus"

	_ "gorm.io/gorm"
)

var (
	env                = os.Getenv("ENVIRONMENT")
	frontendURL        = os.Getenv("FRONTEND_URI")
	staticFrontendPath = os.Getenv("STATIC_FRONTEND_PATH")
	statsdHost         = os.Getenv("DD_STATSD_HOST")
	apmHost            = os.Getenv("DD_APM_HOST")
	landingURL         = os.Getenv("LANDING_PAGE_URI")
	sendgridKey        = os.Getenv("SENDGRID_API_KEY")
	stripeApiKey       = os.Getenv("STRIPE_API_KEY")
	runtime            = flag.String("runtime", "all", "the runtime of the backend; either 1) dev (all runtimes) 2) worker 3) public-graph 4) private-graph")
)

var runtimeParsed util.Runtime

func init() {
	flag.Parse()
	if runtime == nil {
		log.Fatal("runtime is nil, provide a value")
	} else if !util.Runtime(*runtime).IsValid() {
		log.Fatalf("invalid runtime: %v", *runtime)
	}
	runtimeParsed = util.Runtime(*runtime)
}

func health(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("healthy"))
	return
}

func validateOrigin(request *http.Request, origin string) bool {
	if runtimeParsed == util.PrivateGraph {
		// From the highlight frontend, only the url is whitelisted.
		isPreviewEnv := strings.HasPrefix(origin, "https://frontend-pr-") && strings.HasSuffix(origin, ".onrender.com")
		if origin == frontendURL || origin == landingURL || isPreviewEnv {
			return true
		}
	} else if runtimeParsed == util.PublicGraph || runtimeParsed == util.All {
		return true
	}
	return false
}

var defaultPort = "8082"

func main() {
	if os.Getenv("DEPLOYMENT_KEY") != "HIGHLIGHT_ONPREM_BETA" {
		log.Fatalf("please specify a deploy key in order to run Highlight")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	if env == "prod" {
		// Connect to the datadog daemon.
		_, err := statsd.New(statsdHost)
		if err != nil {
			log.Fatalf("error connecting to statsd: %v", err)
			return
		}
		tracer.Start(tracer.WithAgentAddr(apmHost))
		defer tracer.Stop()
	}

	db := model.SetupDB()

	stripeClient := &client.API{}
	stripeClient.Init(stripeApiKey, nil)

	storage, err := storage.NewStorageClient()
	if err != nil {
		log.Fatalf("error creating storage client: %v", err)
	}

	private.SetupAuthClient()
	privateResolver := &private.Resolver{
		DB:            db,
		MailClient:    sendgrid.NewSendClient(sendgridKey),
		StripeClient:  stripeClient,
		StorageClient: storage,
	}
	r := chi.NewMux()
	// Common middlewares for both the client/main graphs.
	r.Use(handlers.CompressHandler)
	r.Use(func(h http.Handler) http.Handler {
		return handlers.LoggingHandler(os.Stdout, h)
	})
	r.Use(cors.New(cors.Options{
		AllowOriginRequestFunc: validateOrigin,
		AllowCredentials:       true,
		AllowedHeaders:         []string{"Highlight-Demo", "Content-Type", "Token", "Sentry-Trace"},
	}).Handler)
	r.MethodFunc(http.MethodGet, "/health", health)

	/*
		Run a simple server that runs the frontend if 'staticFrontedPath' and 'all' is set.
	*/
	fs := http.FileServer(http.Dir(staticFrontendPath))
	r.Handle("/*", http.StripPrefix("/", fs))

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
		r.Route(privateEndpoint, func(r chi.Router) {
			r.Use(private.PrivateMiddleware)
			privateServer := ghandler.NewDefaultServer(privategen.NewExecutableSchema(
				privategen.Config{
					Resolvers: privateResolver,
				}),
			)
			privateServer.Use(util.NewTracer(util.PrivateGraph))
			r.Handle("/", privateServer)
		})
	}
	if runtimeParsed == util.PublicGraph || runtimeParsed == util.All {
		publicEndpoint := "/public"
		if runtimeParsed == util.PublicGraph {
			publicEndpoint = "/"
		}
		r.Route(publicEndpoint, func(r chi.Router) {
			r.Use(public.PublicMiddleware)
			clientServer := ghandler.NewDefaultServer(publicgen.NewExecutableSchema(
				publicgen.Config{
					Resolvers: &public.Resolver{
						DB: db,
					},
				}))
			clientServer.Use(util.NewTracer(util.PublicGraph))
			r.Handle("/", clientServer)
		})
	}

	/*
		Decide what binary to run
		For the the 'worker' runtime, run only the worker.
		For the the 'all' runtime, run both the server and worker.
		For anything else, just run the server.
	*/
	log.Printf("runtime is: %v \n", runtimeParsed)
	log.Println("process running...")
	if runtimeParsed == util.Worker {
		w := &worker.Worker{Resolver: privateResolver, S3Client: storage}
		w.Start()
	} else if runtimeParsed == util.All {
		w := &worker.Worker{Resolver: privateResolver, S3Client: storage}
		go func() {
			w.Start()
		}()
		log.Fatal(http.ListenAndServe(":"+port, r))
	} else {
		log.Fatal(http.ListenAndServe(":"+port, r))
	}
}
