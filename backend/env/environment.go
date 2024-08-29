package env

import (
	"context"
	"encoding/base64"
	"flag"
	"github.com/mitchellh/mapstructure"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	"io"
	"net/url"
	"os"
	"reflect"
	"strconv"
	"strings"
	"time"
)

// EnterpriseEnvPublicKey is set by the go build process via `-ldflags="-X util.EnterpriseEnvPublicKey=value"`
var EnterpriseEnvPublicKey string

type Configuration struct {
	ApolloIoAPIKey              string `mapstructure:"APOLLO_IO_API_KEY"`
	ApolloIoSenderID            string `mapstructure:"APOLLO_IO_SENDER_ID"`
	AuthAdminPassword           string `mapstructure:"ADMIN_PASSWORD"`
	AuthFirebaseSecret          string `mapstructure:"FIREBASE_SECRET"`
	AuthJWTAccessToken          string `mapstructure:"JWT_ACCESS_SECRET"`
	AuthMode                    string `mapstructure:"REACT_APP_AUTH_MODE"`
	AuthWhitelistedAccount      string `mapstructure:"WHITELISTED_FIREBASE_ACCOUNT"`
	AwsCloudfrontDomain         string `mapstructure:"AWS_CLOUDFRONT_DOMAIN"`
	AwsCloudfrontPrivateKey     string `mapstructure:"AWS_CLOUDFRONT_PRIVATE_KEY"`
	AwsCloudfrontPublicKeyID    string `mapstructure:"AWS_CLOUDFRONT_PUBLIC_KEY_ID"`
	AwsRoleArn                  string `mapstructure:"AWS_ROLE_ARN"`
	AwsS3BucketName             string `mapstructure:"AWS_S3_BUCKET_NAME_NEW"`
	AwsS3GithubBucketName       string `mapstructure:"AWS_S3_GITHUB_BUCKET_NAME"`
	AwsS3ResourcesBucketName    string `mapstructure:"AWS_S3_RESOURCES_BUCKET"`
	AwsS3SourceMapBucketName    string `mapstructure:"AWS_S3_SOURCE_MAP_BUCKET_NAME_NEW"`
	AwsS3StagingBucketName      string `mapstructure:"AWS_S3_STAGING_BUCKET_NAME"`
	ClearbitApiKey              string `mapstructure:"CLEARBIT_API_KEY"`
	ClickUpClientID             string `mapstructure:"CLICKUP_CLIENT_ID"`
	ClickUpClientSecret         string `mapstructure:"CLICKUP_CLIENT_SECRET"`
	ClickhouseAddress           string `mapstructure:"CLICKHOUSE_ADDRESS"`
	ClickhouseDatabase          string `mapstructure:"CLICKHOUSE_DATABASE"`
	ClickhousePassword          string `mapstructure:"CLICKHOUSE_PASSWORD"`
	ClickhouseTestDatabase      string `mapstructure:"CLICKHOUSE_TEST_DATABASE"`
	ClickhouseUsername          string `mapstructure:"CLICKHOUSE_USERNAME"`
	ConsumerFraction            string `mapstructure:"CONSUMER_SPAN_SAMPLING_FRACTION"`
	DeleteSessionsArn           string `mapstructure:"DELETE_SESSIONS_ARN"`
	DemoProjectID               string `mapstructure:"DEMO_PROJECT_ID"`
	DiscordBotId                string `mapstructure:"DISCORD_BOT_ID"`
	DiscordBotSecret            string `mapstructure:"DISCORD_BOT_SECRET"`
	DiscordClientId             string `mapstructure:"DISCORD_CLIENT_ID"`
	DiscordClientSecret         string `mapstructure:"DISCORD_CLIENT_SECRET"`
	Doppler                     string `mapstructure:"DOPPLER_CONFIG"`
	ECSContainerMetadataUri     string `mapstructure:"ECS_CONTAINER_METADATA_URI_V4"`
	EmailOptOutSalt             string `mapstructure:"EMAIL_OPT_OUT_SALT"`
	EnterpriseEnvExpiration     time.Time
	EnterpriseEnvPublicKey      string `mapstructure:"ENTERPRISE_ENV_PUBLIC_KEY"`
	Environment                 string `mapstructure:"ENVIRONMENT"`
	FrontClientId               string `mapstructure:"FRONT_CLIENT_ID"`
	FrontClientSecret           string `mapstructure:"FRONT_CLIENT_SECRET"`
	FrontendUri                 string `mapstructure:"REACT_APP_FRONTEND_URI"`
	GithubAppId                 string `mapstructure:"GITHUB_APP_ID"`
	GithubClientId              string `mapstructure:"GITHUB_CLIENT_ID"`
	GithubClientSecret          string `mapstructure:"GITHUB_CLIENT_SECRET"`
	GithubPrivateKey            string `mapstructure:"GITHUB_PRIVATE_KEY"`
	GitlabClientId              string `mapstructure:"GITLAB_CLIENT_ID"`
	GitlabClientSecret          string `mapstructure:"GITLAB_CLIENT_SECRET"`
	HeightClientId              string `mapstructure:"HEIGHT_CLIENT_ID"`
	HeightClientSecret          string `mapstructure:"HEIGHT_CLIENT_SECRET"`
	HubspotApiKey               string `mapstructure:"HUBSPOT_API_KEY"`
	HubspotCookieString         string `mapstructure:"HUBSPOT_COOKIE_STRING"`
	HubspotCsrfToken            string `mapstructure:"HUBSPOT_CSRF_TOKEN"`
	HubspotOAuthToken           string `mapstructure:"HUBSPOT_OAUTH_TOKEN"`
	HuggingfaceApiToken         string `mapstructure:"HUGGINGFACE_API_TOKEN"`
	HuggingfaceModelUrl         string `mapstructure:"HUGGINGFACE_MODEL_URL"`
	InDocker                    string `mapstructure:"IN_DOCKER"`
	JiraClientId                string `mapstructure:"JIRA_CLIENT_ID"`
	JiraClientSecret            string `mapstructure:"JIRA_CLIENT_SECRET"`
	KafkaEnvPrefix              string `mapstructure:"KAFKA_ENV_PREFIX"`
	KafkaSASLPassword           string `mapstructure:"KAFKA_SASL_PASSWORD"`
	KafkaSASLUsername           string `mapstructure:"KAFKA_SASL_USERNAME"`
	KafkaServers                string `mapstructure:"KAFKA_SERVERS"`
	KafkaTopic                  string `mapstructure:"KAFKA_TOPIC"`
	LandingStagingURL           string `mapstructure:"LANDING_PAGE_STAGING_URI"`
	LicenseKey                  string `mapstructure:"LICENSE_KEY"`
	LinearClientId              string `mapstructure:"LINEAR_CLIENT_ID"`
	LinearClientSecret          string `mapstructure:"LINEAR_CLIENT_SECRET"`
	MicrosoftTeamsBotId         string `mapstructure:"MICROSOFT_TEAMS_BOT_ID"`
	MicrosoftTeamsBotPassword   string `mapstructure:"MICROSOFT_TEAMS_BOT_PASSWORD"`
	OAuthClientID               string `mapstructure:"OAUTH_CLIENT_ID"`
	OAuthClientSecret           string `mapstructure:"OAUTH_CLIENT_SECRET"`
	OAuthProviderUrl            string `mapstructure:"OAUTH_PROVIDER_URL"`
	OAuthRedirectUrl            string `mapstructure:"OAUTH_REDIRECT_URL"`
	OTLPDogfoodEndpoint         string `mapstructure:"OTLP_DOGFOOD_ENDPOINT"`
	OTLPEndpoint                string `mapstructure:"OTLP_ENDPOINT"`
	ObjectStorageFS             string `mapstructure:"OBJECT_STORAGE_FS"`
	OnPrem                      string `mapstructure:"ON_PREM"`
	OpenAIApiKey                string `mapstructure:"OPENAI_API_KEY"`
	PricingBasicPriceID         string `mapstructure:"BASIC_PLAN_PRICE_ID"`
	PricingEnterprisePriceID    string `mapstructure:"ENTERPRISE_PLAN_PRICE_ID"`
	PricingStartupPriceID       string `mapstructure:"STARTUP_PLAN_PRICE_ID"`
	PrivateGraphUri             string `mapstructure:"REACT_APP_PRIVATE_GRAPH_URI"`
	PublicGraphUri              string `mapstructure:"REACT_APP_PUBLIC_GRAPH_URI"`
	RedisEndpoint               string `mapstructure:"REDIS_EVENTS_STAGING_ENDPOINT"`
	Release                     string `mapstructure:"RELEASE"`
	SQLDatabase                 string `mapstructure:"PSQL_DB"`
	SQLDockerHost               string `mapstructure:"PSQL_DOCKER_HOST"`
	SQLHost                     string `mapstructure:"PSQL_HOST"`
	SQLPassword                 string `mapstructure:"PSQL_PASSWORD"`
	SQLPort                     string `mapstructure:"PSQL_PORT"`
	SQLUser                     string `mapstructure:"PSQL_USER"`
	SSL                         string `mapstructure:"SSL"`
	SendgridKey                 string `mapstructure:"SENDGRID_API_KEY"`
	SessionFilePathPrefix       string `mapstructure:"SESSION_FILE_PATH_PREFIX"`
	SessionRetentionDays        string `mapstructure:"SESSION_RETENTION_DAYS"`
	SlackClientId               string `mapstructure:"SLACK_CLIENT_ID"`
	SlackClientSecret           string `mapstructure:"SLACK_CLIENT_SECRET"`
	SlackSigningSecret          string `mapstructure:"SLACK_SIGNING_SECRET"`
	SlackTestAccessToken        string `mapstructure:"TEST_SLACK_ACCESS_TOKEN"`
	StripeApiKey                string `mapstructure:"STRIPE_API_KEY"`
	StripeErrorsProductID       string `mapstructure:"STRIPE_ERRORS_PRODUCT_ID"`
	StripeSessionsProductID     string `mapstructure:"STRIPE_SESSIONS_PRODUCT_ID"`
	StripeWebhookSecret         string `mapstructure:"STRIPE_WEBHOOK_SECRET"`
	VercelClientId              string `mapstructure:"VERCEL_CLIENT_ID"`
	VercelClientSecret          string `mapstructure:"VERCEL_CLIENT_SECRET"`
	Version                     string `mapstructure:"REACT_APP_COMMIT_SHA"`
	WorkerMaxMemoryThreshold    string `mapstructure:"WORKER_MAX_MEMORY_THRESHOLD"`
	ZapierIntegrationSigningKey string `mapstructure:"ZAPIER_INTEGRATION_SIGNING_KEY"`
}

func (c *Configuration) load() {
	if err := mapstructure.Decode(lo.SliceToMap(os.Environ(), func(item string) (string, string) {
		pair := strings.SplitN(item, "=", 2)
		return pair[0], pair[1]
	}), c); err != nil {
		log.WithError(err).Fatal("failed to load environment variables")
	}
}

// CopyTo copies non-empty values of the current configuration to the destination configuration.
func (c *Configuration) CopyTo(destination *Configuration) {
	dest := reflect.ValueOf(destination).Elem()
	src := reflect.ValueOf(*c)
	for i := 0; i < src.NumField(); i++ {
		field := src.Field(i)
		key := src.Type().Field(i).Name
		if field.String() != "" {
			dest.FieldByName(key).Set(field)
		}
	}
}

var (
	Config      Configuration
	RuntimeFlag = flag.String("runtime", "all", "the runtime of the backend; either 1) dev (all runtimes) 2) worker 3) public-graph 4) private-graph")
	HandlerFlag = flag.String("worker-handler", "", "applies for runtime=worker; if specified, a handler function will be called instead of Start")
)

func init() {
	Config.load()
}

func GetEnterpriseEnvPublicKey() string {
	if EnterpriseEnvPublicKey != "" {
		dec := base64.NewDecoder(base64.StdEncoding, strings.NewReader(EnterpriseEnvPublicKey))
		data, err := io.ReadAll(dec)
		if err != nil {
			log.WithContext(context.Background()).WithError(err).Fatal("failed to read public key data")
		}
		return string(data)
	}
	return Config.EnterpriseEnvPublicKey
}

func GetFrontendDomain() (string, error) {
	u, err := url.Parse(Config.FrontendUri)
	if err != nil {
		return "", err
	}
	return u.Host, nil
}

func IsDevEnv() bool {
	return Config.Environment == "dev"
}

func IsTestEnv() bool {
	return Config.Environment == "test"
}

func IsDevOrTestEnv() bool {
	return IsTestEnv() || IsDevEnv()
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
	return !IsProduction() && (Config.InDocker == "enterprise" || (RuntimeFlag != nil && *RuntimeFlag != "all"))
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
