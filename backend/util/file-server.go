package util

import (
	"log"
	"net/http"
	"strings"

	"github.com/go-chi/chi"
)

// FileServer conveniently sets up a http.FileServer handler to serve
// static files from a http.FileSystem.
func FileServer(r chi.Router, routePath string, filePath string) {
	filesDir := http.Dir(filePath)
	if strings.ContainsAny(routePath, "{}*") {
		log.Fatalf("FileServer does not permit any URL parameters.")
	}

	if routePath != "/" && routePath[len(routePath)-1] != '/' {
		r.Get(routePath, http.RedirectHandler(routePath+"/", 301).ServeHTTP)
		routePath += "/"
	}
	routePath += "*"

	r.Get(routePath, func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := strings.TrimSuffix(rctx.RoutePattern(), "/*")
		fs := http.StripPrefix(pathPrefix, http.FileServer(filesDir))
		fs.ServeHTTP(w, r)
	})
}
