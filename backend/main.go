package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/jay-khatri/fullstory/backend/database"
	"github.com/jay-khatri/fullstory/backend/graph"
	"github.com/jay-khatri/fullstory/backend/graph/generated"
	"github.com/jay-khatri/fullstory/backend/track"
	"github.com/rs/cors"

	_ "github.com/jinzhu/gorm/dialects/postgres"
	log "github.com/sirupsen/logrus"
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

	SetupRedis()
	db := database.SetupDB()
	resolver := &graph.Resolver{
		DB: db,
	}
	srv := handler.NewDefaultServer(
		generated.NewExecutableSchema(
			generated.Config{Resolvers: resolver}))
	mux := http.NewServeMux()
	mux.HandleFunc("/add-events", track.AddEvents)
	mux.HandleFunc("/", playground.Handler("GraphQL playground", "/query"))
	mux.Handle("/query", srv)
	handler := cors.AllowAll().Handler(mux)
	fmt.Println("listening...")
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
