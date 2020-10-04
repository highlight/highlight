package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jay-khatri/fullstory/backend/worker"
	"github.com/k0kubun/pp"
	"github.com/rs/cors"

	ha "github.com/99designs/gqlgen/handler"
	cgraph "github.com/jay-khatri/fullstory/backend/client-graph/graph"
	cgenerated "github.com/jay-khatri/fullstory/backend/client-graph/graph/generated"
	mgraph "github.com/jay-khatri/fullstory/backend/main-graph/graph"
	mgenerated "github.com/jay-khatri/fullstory/backend/main-graph/graph/generated"
	rd "github.com/jay-khatri/fullstory/backend/redis"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	_ "github.com/jinzhu/gorm/dialects/postgres"
)

var (
	frontendURL = os.Getenv("FRONTEND_URI")
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
	} else if path == "/client" {
		return true
	} else if path == "/segment" {
		return true
	}
	return false
}

var defaultPort = "8082"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	rd.SetupRedisStore()
	rd.SetupRedisClient()
	db := model.SetupDB()
	mux := http.NewServeMux()
	main := &mgraph.Resolver{
		DB: db,
	}
	mux.Handle("/main", mgraph.AdminMiddleWare(ha.GraphQL(mgenerated.NewExecutableSchema(
		mgenerated.Config{
			Resolvers: main,
		}))))
	mux.Handle("/client", cgraph.ClientMiddleWare(ha.GraphQL(cgenerated.NewExecutableSchema(
		cgenerated.Config{
			Resolvers: &cgraph.Resolver{
				DB:    db,
				Redis: rd.Client,
			},
		}))))

	mux.HandleFunc("/segment", func(rw http.ResponseWriter, req *http.Request) {
		rw.Header().Set("Content-Type", "application/json")
		body := req.Body
		defer body.Close()
		b, err := ioutil.ReadAll(body)
		if err != nil {
			http.Error(rw, e.Wrap(err, "can't ready body").Error(), http.StatusUnauthorized)
			return
		}
		pp.Println(string(b))
		json.NewEncoder(rw).Encode(`{"hello":"hi"}`)
	})

	handler := cors.New(cors.Options{
		AllowOriginRequestFunc: validateOrigin,
		AllowCredentials:       true,
		AllowedHeaders:         []string{"Content-Type", "Token"},
	}).Handler(mux)

	w := &worker.Worker{R: main}
	w.Start()

	loggedRouter := handlers.LoggingHandler(os.Stdout, handler)
	fmt.Println("listening...")
	log.Fatal(http.ListenAndServe(":"+port, loggedRouter))
}
