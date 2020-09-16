package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jay-khatri/fullstory/backend/redis"
	"github.com/rs/cors"

	ha "github.com/99designs/gqlgen/handler"
	cgraph "github.com/jay-khatri/fullstory/backend/client-graph/graph"
	cgenerated "github.com/jay-khatri/fullstory/backend/client-graph/graph/generated"
	mgraph "github.com/jay-khatri/fullstory/backend/main-graph/graph"
	mgenerated "github.com/jay-khatri/fullstory/backend/main-graph/graph/generated"
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
	}
	return false
}

var defaultPort = "8082"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	redis.SetupRedisStore()
	redis.SetupRedisClient()
	db := model.SetupDB()
	mux := http.NewServeMux()
	mux.Handle("/main", mgraph.AdminMiddleWare(ha.GraphQL(mgenerated.NewExecutableSchema(
		mgenerated.Config{
			Resolvers: &mgraph.Resolver{
				DB: db,
			},
		}))))
	mux.Handle("/client", cgraph.ClientMiddleWare(ha.GraphQL(cgenerated.NewExecutableSchema(
		cgenerated.Config{
			Resolvers: &cgraph.Resolver{
				DB:    db,
				Redis: redis.Client,
			},
		}))))
	handler := cors.New(cors.Options{
		AllowOriginRequestFunc: validateOrigin,
		AllowCredentials:       true,
		AllowedHeaders:         []string{"Content-Type", "Token"},
	}).Handler(mux)

	fmt.Println("listening...")
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
