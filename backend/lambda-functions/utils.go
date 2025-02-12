package lambda_functions

import (
	"context"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	log "github.com/sirupsen/logrus"
)

func Monitor(serviceName string) {
	ctx := context.Background()
	if env.Config.OTLPDogfoodEndpoint != "" {
		log.WithContext(ctx).
			WithField("otlpEndpoint", env.Config.OTLPDogfoodEndpoint).
			Info("overwriting otlp client address for highlight lambda logging")
		highlight.SetOTLPEndpoint(env.Config.OTLPDogfoodEndpoint)
	}

	highlight.SetProjectID("1jdkoe52")
	highlight.Start(
		highlight.WithServiceName(serviceName),
		highlight.WithServiceVersion(env.Config.Version),
		highlight.WithEnvironment(env.EnvironmentName()),
	)
	hlog.Init()
}
