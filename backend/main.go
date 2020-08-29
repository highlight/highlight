package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/playground"
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
	allowedOrigins = []string{"http://localhost:5000"}
)

func health(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("healthy"))
	return
}

var defaultPort = "8082"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	redis.SetupRedis()
	db := model.SetupDB()
	mux := http.NewServeMux()
	mux.HandleFunc("/", playground.Handler("GraphQL playground", "/main"))
	mux.Handle("/main", ha.GraphQL(mgenerated.NewExecutableSchema(
		mgenerated.Config{
			Resolvers: &mgraph.Resolver{
				DB: db,
			},
		})))
	mux.Handle("/client", cgraph.ClientMiddleWare(ha.GraphQL(cgenerated.NewExecutableSchema(
		cgenerated.Config{
			Resolvers: &cgraph.Resolver{
				DB: db,
			},
		}))))
	handler := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowCredentials: true,
		AllowedHeaders:   []string{"id-token", "content-type"},
	}).Handler(mux)
	fmt.Println("listening...")
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
