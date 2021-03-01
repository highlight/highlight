package main

import (
	"flag"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/honeycombio/beeline-go/wrappers/hnynethttp"
	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jay-khatri/fullstory/backend/worker"
	"github.com/rs/cors"
	"github.com/sendgrid/sendgrid-go"
	"github.com/stripe/stripe-go/client"

	ha "github.com/99designs/gqlgen/handler"
	beeline "github.com/honeycombio/beeline-go"
	cgraph "github.com/jay-khatri/fullstory/backend/client-graph/graph"
	cgenerated "github.com/jay-khatri/fullstory/backend/client-graph/graph/generated"
	mgraph "github.com/jay-khatri/fullstory/backend/main-graph/graph"
	mgenerated "github.com/jay-khatri/fullstory/backend/main-graph/graph/generated"
	rd "github.com/jay-khatri/fullstory/backend/redis"
	log "github.com/sirupsen/logrus"

	_ "github.com/jinzhu/gorm/dialects/postgres"
)

var (
	frontendURL  = os.Getenv("FRONTEND_URI")
	sendgridKey  = os.Getenv("SENDGRID_API_KEY")
	stripeApiKey = os.Getenv("STRIPE_API_KEY")
	runtime      = flag.String("runtime", "dev", "the runtime of the backend; either dev/worker/server")
)

func health(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("healthy"))
	return
}

func validateOrigin(request *http.Request, origin string) bool {
	if path := request.URL.Path; path == "/main" {
		// From the highlight frontend, only the url is whitelisted.
		if origin == frontendURL {
			return true
		}
	} else if path == "/client" || path == "/email" {
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
	rd.SetupRedisStore()
	db := model.SetupDB()
	mux := http.NewServeMux()

	stripeClient := &client.API{}
	stripeClient.Init(stripeApiKey, nil)

	beeline.Init(beeline.Config{
		WriteKey: "5ef6d60bb0e65ec29ac69cc60b1c2a84",
		Dataset:  "highlight-backend",
	})
	defer beeline.Close()

	mgraph.SetupAuthClient()
	main := &mgraph.Resolver{
		DB:           db,
		MailClient:   sendgrid.NewSendClient(sendgridKey),
		StripeClient: stripeClient,
	}

	mux.Handle("/main", mgraph.AdminMiddleWare(ha.GraphQL(mgenerated.NewExecutableSchema(
		mgenerated.Config{
			Resolvers: main,
		}))))
	mux.Handle("/client", cgraph.ClientMiddleWare(ha.GraphQL(cgenerated.NewExecutableSchema(
		cgenerated.Config{
			Resolvers: &cgraph.Resolver{
				DB: db,
			},
		}))))
	mux.HandleFunc("/email", emailHandler)

	handler := cors.New(cors.Options{
		AllowOriginRequestFunc: validateOrigin,
		AllowCredentials:       true,
		AllowedHeaders:         []string{"Highlight-Demo", "Content-Type", "Token", "Sentry-Trace"},
	}).Handler(mux)

	loggedRouter := handlers.LoggingHandler(os.Stdout, hnynethttp.WrapHandler(handler))
	w := &worker.Worker{R: main}
	log.Infof("listening with:\nruntime config: %v\ndoppler environment: %v\n", *runtime, os.Getenv("DOPPLER_ENCLAVE_ENVIRONMENT"))
	if rt := *runtime; rt == "dev" {
		go func() {
			w.Start()
		}()
		log.Fatal(http.ListenAndServe(":"+port, handlers.CompressHandler(loggedRouter)))
	} else if rt == "worker" {
		w.Start()
	} else if rt == "server" {
		log.Fatal(http.ListenAndServe(":"+port, handlers.CompressHandler(loggedRouter)))
	}
	log.Errorf("invalid runtime")
}
