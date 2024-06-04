package util

import (
	"flag"
	"os"
	"strconv"
	"strings"

	"github.com/highlight-run/highlight/backend/model"
)

type Configuration struct {
	Environment         string `mapstructure:"ENVIRONMENT"`
	OnPrem              string `mapstructure:"ON_PREM"`
	Doppler             string `mapstructure:"DOPPLER_CONFIG"`
	InDocker            string `mapstructure:"IN_DOCKER"`
	Release             string `mapstructure:"RELEASE"`
	Version             string `mapstructure:"REACT_APP_COMMIT_SHA"`
	FrontendUri         string `mapstructure:"REACT_APP_FRONTEND_URI"`
	PrivateGraphUri     string `mapstructure:"REACT_APP_PRIVATE_GRAPH_URI"`
	PublicGraphUri      string `mapstructure:"REACT_APP_PUBLIC_GRAPH_URI"`
	LicenseKey          string `mapstructure:"LICENSE_KEY"`
	SSL                 string `mapstructure:"SSL"`
	ConsumerFraction    string `mapstructure:"CONSUMER_SPAN_SAMPLING_FRACTION"`
	LandingStagingURL   string `mapstructure:"LANDING_PAGE_STAGING_URI"`
	OTLPEndpoint        string `mapstructure:"OTLP_ENDPOINT"`
	OTLPDogfoodEndpoint string `mapstructure:"OTLP_DOGFOOD_ENDPOINT"`
	SendgridKey         string `mapstructure:"SENDGRID_API_KEY"`
	StripeApiKey        string `mapstructure:"STRIPE_API_KEY"`
	StripeWebhookSecret string `mapstructure:"STRIPE_WEBHOOK_SECRET"`
	SlackSigningSecret  string `mapstructure:"SLACK_SIGNING_SECRET"`
}

var (
	Config = Configuration{
		os.Getenv("ENVIRONMENT"),
		os.Getenv("ON_PREM"),
		os.Getenv("DOPPLER_CONFIG"),
		os.Getenv("IN_DOCKER"),
		os.Getenv("RELEASE"),
		os.Getenv("REACT_APP_COMMIT_SHA"),
		os.Getenv("REACT_APP_FRONTEND_URI"),
		os.Getenv("REACT_APP_PRIVATE_GRAPH_URI"),
		os.Getenv("REACT_APP_PUBLIC_GRAPH_URI"),
		os.Getenv("LICENSE_KEY"),
		os.Getenv("SSL"),
		os.Getenv("CONSUMER_SPAN_SAMPLING_FRACTION"),
		os.Getenv("LANDING_PAGE_STAGING_URI"),
		os.Getenv("OTLP_ENDPOINT"),
		os.Getenv("OTLP_DOGFOOD_ENDPOINT"),
		os.Getenv("SENDGRID_API_KEY"),
		os.Getenv("STRIPE_API_KEY"),
		os.Getenv("STRIPE_WEBHOOK_SECRET"),
		os.Getenv("SLACK_SIGNING_SECRET"),
	}
	runtimeFlag = flag.String("runtime", "all", "the runtime of the backend; either 1) dev (all runtimes) 2) worker 3) public-graph 4) private-graph")
	handlerFlag = flag.String("worker-handler", "", "applies for runtime=worker; if specified, a handler function will be called instead of Start")
)

func IsDevEnv() bool {
	return model.IsDevEnv()
}

func IsTestEnv() bool {
	return model.IsTestEnv()
}

func IsDevOrTestEnv() bool {
	return model.IsDevOrTestEnv()
}

func IsOnPrem() bool {
	return Config.OnPrem == "true"
}

func IsInDocker() bool {
	return Config.InDocker == "true"
}

func IsProduction() bool {
	return strings.HasPrefix(Config.Doppler, "prod")
}

func IsEnterpriseDeploy() bool {
	return runtimeFlag != nil && *runtimeFlag != "all"
}

func UseSSL() bool {
	return Config.SSL != "false"
}

func EnvironmentName() string {
	envName := Config.Environment

	if IsOnPrem() {
		envName = "on-prem"
	}

	return envName
}

func ConsumerSpanSamplingRate() float64 {
	i, err := strconv.ParseInt(Config.ConsumerFraction, 10, 64)
	if err != nil {
		i = 1_000
	}
	return 1. / float64(i)
}
