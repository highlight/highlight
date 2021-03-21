package main

import (
	"flag"
	"net/http"
	"os"
	"strings"

	"github.com/DataDog/datadog-go/statsd"
	"github.com/go-chi/chi"
	"github.com/gorilla/handlers"
	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jay-khatri/fullstory/backend/worker"
	"github.com/rs/cors"
	"github.com/sendgrid/sendgrid-go"
	"github.com/stripe/stripe-go/client"

	ha "github.com/99designs/gqlgen/handler"
	cgraph "github.com/jay-khatri/fullstory/backend/client-graph/graph"
	cgenerated "github.com/jay-khatri/fullstory/backend/client-graph/graph/generated"
	mgraph "github.com/jay-khatri/fullstory/backend/main-graph/graph"
	mgenerated "github.com/jay-khatri/fullstory/backend/main-graph/graph/generated"
	rd "github.com/jay-khatri/fullstory/backend/redis"
	log "github.com/sirupsen/logrus"

	_ "github.com/jinzhu/gorm/dialects/postgres"
)

var (
	frontendURL    = os.Getenv("FRONTEND_URI")
	statsdHost     = os.Getenv("STATSD_HOST")
	landingURL     = os.Getenv("LANDING_PAGE_URI")
	sendgridKey    = os.Getenv("SENDGRID_API_KEY")
	stripeApiKey   = os.Getenv("STRIPE_API_KEY")
	localTunnelURL = os.Getenv("LOCAL_TUNNEL_URI")
	runtime        = flag.String("runtime", "dev", "the runtime of the backend; either dev/worker/server")
)

func health(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("healthy"))
	return
}

func validateOrigin(request *http.Request, origin string) bool {
	if path := request.URL.Path; path == "/main" {
		// From the highlight frontend, only the url is whitelisted.
		isPreviewEnv := strings.HasPrefix(origin, "https://frontend-pr-") && strings.HasSuffix(origin, ".onrender.com")
		isLocalTunnel := origin == localTunnelURL
		if origin == frontendURL || origin == landingURL || isPreviewEnv || isLocalTunnel {
			return true
		}
	} else if path == "/client" {
		return true
	}
	return false
}

var defaultPort = "8082"

func main() {
	flag.Parse()
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// Connect to the datadog daemon.
	_, err := statsd.New(statsdHost)
	if err != nil {
		log.Fatalf("error connecting to statsd: %v", err)
		return
	}

	rd.SetupRedisStore()
	db := model.SetupDB()

	stripeClient := &client.API{}
	stripeClient.Init(stripeApiKey, nil)

	mgraph.SetupAuthClient()
	main := &mgraph.Resolver{
		DB:           db,
		MailClient:   sendgrid.NewSendClient(sendgridKey),
		StripeClient: stripeClient,
	}
	r := chi.NewMux()
	r.Use(handlers.CompressHandler)
	r.Use(func(h http.Handler) http.Handler {
		return handlers.LoggingHandler(os.Stdout, h)
	})
	r.Use(cors.New(cors.Options{
		AllowOriginRequestFunc: validateOrigin,
		AllowCredentials:       true,
		AllowedHeaders:         []string{"Highlight-Demo", "Content-Type", "Token", "Sentry-Trace"},
	}).Handler)
	r.Handle("/main", mgraph.AdminMiddleWare(ha.GraphQL(mgenerated.NewExecutableSchema(
		mgenerated.Config{
			Resolvers: main,
		}))))
	r.Handle("/client", cgraph.ClientMiddleWare(ha.GraphQL(cgenerated.NewExecutableSchema(
		cgenerated.Config{
			Resolvers: &cgraph.Resolver{
				DB: db,
			},
		}))))
	w := &worker.Worker{R: main}
	log.Infof("listening with:\nruntime config: %v\ndoppler environment: %v\n", *runtime, os.Getenv("DOPPLER_ENCLAVE_ENVIRONMENT"))
	if rt := *runtime; rt == "dev" {
		go func() {
			w.Start()
		}()
		log.Fatal(http.ListenAndServe(":"+port, r))
	} else if rt == "worker" {
		w.Start()
	} else if rt == "server" {
		log.Fatal(http.ListenAndServe(":"+port, r))
	}
	log.Errorf("invalid runtime")
}
