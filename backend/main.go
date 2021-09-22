package main

import (
	"flag"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	"github.com/aws/aws-xray-sdk-go/xray"
	"github.com/gammazero/workerpool"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/highlight/backend/worker"
	e "github.com/pkg/errors"
	"github.com/rs/cors"
	"github.com/sendgrid/sendgrid-go"
	"github.com/stripe/stripe-go/client"

	ghandler "github.com/99designs/gqlgen/graphql/handler"
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
	frontendURL        = os.Getenv("FRONTEND_URI")
	staticFrontendPath = os.Getenv("ONPREM_STATIC_FRONTEND_PATH")
	landingStagingURL  = os.Getenv("LANDING_PAGE_STAGING_URI")
	sendgridKey        = os.Getenv("SENDGRID_API_KEY")
	stripeApiKey       = os.Getenv("STRIPE_API_KEY")
	runtime            = flag.String("runtime", "all", "the runtime of the backend; either 1) dev (all runtimes) 2) worker 3) public-graph 4) private-graph")
)

//  we inject this value at build time for on-prem
var SENDGRID_API_KEY string

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

func healthRouter(runtime util.Runtime) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte(fmt.Sprintf("%v is healthy", runtime)))
		if err != nil {
			log.Error(e.Wrap(err, "error writing health response"))
		}
	}
}

func validateOrigin(request *http.Request, origin string) bool {
	if runtimeParsed == util.PrivateGraph {
		// From the highlight frontend, only the url is whitelisted.
		isRenderPreviewEnv := strings.HasPrefix(origin, "https://frontend-pr-") && strings.HasSuffix(origin, ".onrender.com")
		isAWSRenderEnv := strings.HasPrefix(origin, "https://pr-") && strings.HasSuffix(origin, ".d1ggqq795qhcr.amplifyapp.com")

		if origin == frontendURL || origin == "https://www.highlight.run" || origin == "https://highlight.run" || origin == landingStagingURL || isRenderPreviewEnv || isAWSRenderEnv {
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
		if err := dd.Start(); err != nil {
			log.Fatal(e.Wrap(err, "error starting dd clients with error"))
		} else {
			defer dd.Stop()
		}
	} else {
		log.Info("Excluding dd client setup process...")
		log.Info("Disabling AWS xray...")
		os.Setenv("AWS_XRAY_SDK_DISABLED", "TRUE")
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

	private.SetupAuthClient()
	privateResolver := &private.Resolver{
		DB:            db,
		MailClient:    sendgrid.NewSendClient(sendgridKey),
		StripeClient:  stripeClient,
		StorageClient: storage,
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
		r.Route(privateEndpoint, func(r chi.Router) {
			r.Use(private.PrivateMiddleware)
			privateServer := ghandler.NewDefaultServer(privategen.NewExecutableSchema(
				privategen.Config{
					Resolvers: privateResolver,
				}),
			)
			privateServer.Use(util.NewTracer(util.PrivateGraph))
			privateServer.SetErrorPresenter(util.GraphQLErrorPresenter(string(util.PrivateGraph)))
			privateServer.SetRecoverFunc(util.GraphQLRecoverFunc())
			r.Handle("/",
				xray.Handler(xray.NewFixedSegmentNamer("private-graph"), privateServer),
			)
		})
	}
	if runtimeParsed == util.PublicGraph || runtimeParsed == util.All {
		publicEndpoint := "/public"
		if runtimeParsed == util.PublicGraph {
			publicEndpoint = "/"
		}
		r.Route(publicEndpoint, func(r chi.Router) {
			r.Use(public.PublicMiddleware)
			publicServer := ghandler.NewDefaultServer(publicgen.NewExecutableSchema(
				publicgen.Config{
					Resolvers: &public.Resolver{
						DB:                    db,
						StorageClient:         storage,
						PushPayloadWorkerPool: workerpool.New(80),
						AlertWorkerPool:       workerpool.New(40),
					},
				}))
			publicServer.Use(util.NewTracer(util.PublicGraph))
			publicServer.SetErrorPresenter(util.GraphQLErrorPresenter(string(util.PublicGraph)))
			publicServer.SetRecoverFunc(util.GraphQLRecoverFunc())
			r.Handle("/",
				xray.Handler(xray.NewFixedSegmentNamer("public-graph"), publicServer),
			)
		})
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

func expireHighlightAfterDate(endDate time.Time) {
	for {
		if time.Now().After(endDate) {
			log.Fatalf("your highlight trial has expired")
		}
		time.Sleep(time.Hour)
	}
}
