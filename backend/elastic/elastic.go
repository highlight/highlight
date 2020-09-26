package elastic

import (
	"log"
	"os"

	"github.com/olivere/elastic/v7"
)

// Store is used for working w/ cookies.
var Client *elastic.Client

func SetupElastic() {
	e, err := elastic.NewClient(elastic.SetURL(os.Getenv("ELASTIC_URI")))
	if err != nil {
		log.Fatalf("error connecting to elastic: %v", e)
	}
	Client = e
}
