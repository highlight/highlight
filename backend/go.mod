module github.com/highlight-run/highlight/backend

go 1.23.1

replace golang.org/x/crypto => golang.org/x/crypto v0.17.0

replace gopkg.in/yaml.v3 => gopkg.in/yaml.v3 v3.0.1

replace github.com/tidwall/gjson => github.com/tidwall/gjson v1.17.1

replace golang.org/x/net => golang.org/x/net v0.17.0

replace github.com/tidwall/match => github.com/tidwall/match v1.1.1

replace golang.org/x/text => golang.org/x/text v0.14.0

replace nhooyr.io/websocket => nhooyr.io/websocket v1.8.7

replace github.com/lestrrat-go/jwx => github.com/lestrrat-go/jwx v1.2.29

replace github.com/highlight/highlight/sdk/highlight-go => ../sdk/highlight-go

require (
	firebase.google.com/go v3.13.0+incompatible
	github.com/99designs/gqlgen v0.17.45
	github.com/DmitriyVTitov/size v1.5.0
	github.com/PaesslerAG/jsonpath v0.1.1
	github.com/andybalholm/brotli v1.1.0
	github.com/antlr4-go/antlr/v4 v4.13.0
	github.com/aws/aws-sdk-go-v2 v1.29.0
	github.com/aws/aws-sdk-go-v2/config v1.27.11
	github.com/aws/aws-sdk-go-v2/feature/cloudfront/sign v1.7.9
	github.com/aws/aws-sdk-go-v2/service/marketplaceentitlementservice v1.20.2
	github.com/aws/aws-sdk-go-v2/service/marketplacemetering v1.21.2
	github.com/aws/aws-sdk-go-v2/service/s3 v1.53.1
	github.com/aws/smithy-go v1.20.2
	github.com/bradleyfalzon/ghinstallation/v2 v2.10.0
	github.com/clearbit/clearbit-go v1.1.0
	github.com/cloudflare/cloudflare-go v0.97.0
	github.com/coreos/go-oidc/v3 v3.10.0
	github.com/dchest/uniuri v1.2.0
	github.com/disintegration/imaging v1.6.2
	github.com/go-chi/chi v4.1.2+incompatible
	github.com/go-oauth2/oauth2/v4 v4.5.2
	github.com/go-redis/cache/v9 v9.0.0
	github.com/go-redsync/redsync/v4 v4.12.1
	github.com/go-sourcemap/sourcemap v2.1.3+incompatible
	github.com/go-test/deep v1.1.0
	github.com/gofiber/fiber/v2 v2.52.5
	github.com/golang-jwt/jwt v3.2.2+incompatible
	github.com/golang-jwt/jwt/v4 v4.5.0
	github.com/golang/snappy v0.0.4
	github.com/google/go-github/v50 v50.2.0
	github.com/google/uuid v1.6.0
	github.com/gorilla/websocket v1.5.1
	github.com/hashicorp/go-retryablehttp v0.7.7
	github.com/hashicorp/golang-lru/v2 v2.0.7
	github.com/highlight-run/workerpool v1.3.0
	github.com/highlight/go-oauth2-redis/v4 v4.1.4
	github.com/highlight/highlight/sdk/highlight-go v0.10.2
	github.com/huandu/go-assert v1.1.6
	github.com/influxdata/go-syslog/v3 v3.0.0
	github.com/infracloudio/msbotbuilder-go v0.2.5
	github.com/jackc/pgerrcode v0.0.0-20220416144525-469b46aa5efa
	github.com/jackc/pgx/v5 v5.5.5
	github.com/kylelemons/godebug v1.1.0
	github.com/lib/pq v1.10.9
	github.com/lukasbob/srcset v0.0.0-20231122134231-06e7f27b6370
	github.com/mitchellh/mapstructure v1.5.0
	github.com/mssola/user_agent v0.6.0
	github.com/openlyinc/pointy v1.2.1
	github.com/oschwald/geoip2-golang v1.11.0
	github.com/pkg/errors v0.9.1
	github.com/redis/go-redis/v9 v9.5.1
	github.com/rs/cors v1.11.0
	github.com/rs/xid v1.5.0
	github.com/samber/lo v1.39.0
	github.com/sashabaranov/go-openai v1.25.0
	github.com/segmentio/kafka-go v0.4.47
	github.com/sendgrid/sendgrid-go v3.14.0+incompatible
	github.com/shirou/gopsutil v3.21.11+incompatible
	github.com/sirupsen/logrus v1.9.3
	github.com/slack-go/slack v0.12.5
	github.com/speps/go-hashids v2.0.0+incompatible
	github.com/stripe/stripe-go/v78 v78.5.0
	github.com/urfave/cli/v2 v2.27.2
	github.com/vektah/gqlparser/v2 v2.5.15
	go.openly.dev/pointy v1.3.0
	go.opentelemetry.io/collector/pdata v1.7.0
	go.opentelemetry.io/otel v1.29.0
	go.opentelemetry.io/otel/sdk v1.29.0
	go.opentelemetry.io/otel/trace v1.29.0
	golang.org/x/mod v0.16.0
	golang.org/x/oauth2 v0.21.0
	golang.org/x/sync v0.7.0
	golang.org/x/text v0.18.0
	google.golang.org/api v0.185.0
	gopkg.in/DataDog/dd-trace-go.v1 v1.61.0
	gorm.io/driver/postgres v1.5.7
	gorm.io/gorm v1.25.7
)

require (
	cloud.google.com/go/auth v0.5.1 // indirect
	cloud.google.com/go/auth/oauth2adapt v0.2.2 // indirect
	cloud.google.com/go/compute/metadata v0.3.0 // indirect
	cloud.google.com/go/iam v1.1.8 // indirect
	cloud.google.com/go/longrunning v0.5.7 // indirect
	github.com/ClickHouse/ch-go v0.61.5 // indirect
	github.com/DataDog/datadog-go/v5 v5.5.0 // indirect
	github.com/DataDog/gostackparse v0.7.0 // indirect
	github.com/Microsoft/go-winio v0.6.1 // indirect
	github.com/PaesslerAG/gval v1.2.2 // indirect
	github.com/ProtonMail/go-crypto v1.0.0 // indirect
	github.com/aws/aws-sdk-go-v2/aws/protocol/eventstream v1.6.2 // indirect
	github.com/aws/aws-sdk-go-v2/internal/configsources v1.3.5 // indirect
	github.com/aws/aws-sdk-go-v2/internal/endpoints/v2 v2.6.5 // indirect
	github.com/aws/aws-sdk-go-v2/internal/v4a v1.3.5 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/checksum v1.3.7 // indirect
	github.com/aws/aws-sdk-go-v2/service/ssooidc v1.23.4 // indirect
	github.com/cenkalti/backoff/v4 v4.3.0 // indirect
	github.com/cespare/xxhash/v2 v2.3.0 // indirect
	github.com/cloudflare/circl v1.3.7 // indirect
	github.com/davecgh/go-spew v1.1.2-0.20180830191138-d8f796af33cc // indirect
	github.com/decred/dcrd/dcrec/secp256k1/v4 v4.2.0 // indirect
	github.com/dgryski/go-rendezvous v0.0.0-20200823014737-9f7001d12a5f // indirect
	github.com/felixge/httpsnoop v1.0.4 // indirect
	github.com/gammazero/deque v0.1.0 // indirect
	github.com/go-chi/chi/v5 v5.0.12 // indirect
	github.com/go-faster/city v1.0.1 // indirect
	github.com/go-faster/errors v0.7.1 // indirect
	github.com/go-jose/go-jose/v4 v4.0.1 // indirect
	github.com/go-logr/logr v1.4.2 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/go-ole/go-ole v1.3.0 // indirect
	github.com/goccy/go-json v0.10.3 // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/google/go-github/v60 v60.0.0 // indirect
	github.com/google/pprof v0.0.0-20240227163752-401108e1b7e7 // indirect
	github.com/google/s2a-go v0.1.7 // indirect
	github.com/googleapis/enterprise-certificate-proxy v0.3.2 // indirect
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.20.0 // indirect
	github.com/hashicorp/errwrap v1.1.0 // indirect
	github.com/hashicorp/go-cleanhttp v0.5.2 // indirect
	github.com/hashicorp/go-multierror v1.1.1 // indirect
	github.com/huandu/xstrings v1.4.0 // indirect
	github.com/imdario/mergo v0.3.16 // indirect
	github.com/jackc/puddle/v2 v2.2.1 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/lestrrat-go/backoff/v2 v2.0.8 // indirect
	github.com/lestrrat-go/blackmagic v1.0.2 // indirect
	github.com/lestrrat-go/httpcc v1.0.1 // indirect
	github.com/lestrrat-go/iter v1.0.2 // indirect
	github.com/lestrrat-go/jwx v1.2.29 // indirect
	github.com/lestrrat-go/option v1.0.1 // indirect
	github.com/marconi/go-resthooks v0.0.0-20190225103922-ad217f832acb // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/oschwald/maxminddb-golang v1.13.0 // indirect
	github.com/paulmach/orb v0.11.1 // indirect
	github.com/pmezard/go-difflib v1.0.1-0.20181226105442-5d4384ee4fb2 // indirect
	github.com/richardartoul/molecule v1.0.1-0.20221107223329-32cfee06a052 // indirect
	github.com/rs/zerolog v1.32.0 // indirect
	github.com/segmentio/asm v1.2.0 // indirect
	github.com/shopspring/decimal v1.3.1 // indirect
	github.com/sosodev/duration v1.2.0 // indirect
	github.com/spaolacci/murmur3 v1.1.0 // indirect
	github.com/tdewolff/test v1.0.7 // indirect
	github.com/tidwall/btree v1.7.0 // indirect
	github.com/tidwall/buntdb v1.3.0 // indirect
	github.com/tidwall/gjson v1.17.1 // indirect
	github.com/tidwall/grect v0.1.4 // indirect
	github.com/tidwall/match v1.1.1 // indirect
	github.com/tidwall/pretty v1.2.1 // indirect
	github.com/tidwall/rtred v0.1.2 // indirect
	github.com/tidwall/tinyqueue v0.1.1 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/vmihailenco/go-tinylfu v0.2.2 // indirect
	github.com/vmihailenco/msgpack/v5 v5.4.1 // indirect
	github.com/vmihailenco/tagparser/v2 v2.0.0 // indirect
	github.com/xdg-go/pbkdf2 v1.0.0 // indirect
	github.com/xdg-go/scram v1.1.2 // indirect
	github.com/xdg-go/stringprep v1.0.4 // indirect
	github.com/xrash/smetrics v0.0.0-20240312152122-5f08fbb34913 // indirect
	github.com/yusufpapurcu/wmi v1.2.4 // indirect
	go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc v0.49.0 // indirect
	go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.49.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace v1.29.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp v1.26.0 // indirect
	go.opentelemetry.io/otel/metric v1.29.0 // indirect
	go.opentelemetry.io/proto/otlp v1.3.1 // indirect
	go.uber.org/atomic v1.11.0 // indirect
	go.uber.org/multierr v1.11.0 // indirect
	golang.org/x/image v0.18.0 // indirect
	golang.org/x/tools v0.19.0 // indirect
	google.golang.org/genproto/googleapis/api v0.0.0-20240822170219-fc7c04adadcd // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20240903143218-8af14fe29dc1 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)

require (
	cloud.google.com/go v0.115.0 // indirect
	cloud.google.com/go/firestore v1.15.0 // indirect
	cloud.google.com/go/storage v1.41.0 // indirect
	github.com/ClickHouse/clickhouse-go/v2 v2.21.1
	github.com/ReneKroon/ttlcache v1.7.0
	github.com/agnivade/levenshtein v1.1.1 // indirect
	github.com/aws/aws-lambda-go v1.46.0
	github.com/aws/aws-sdk-go-v2/credentials v1.17.11 // indirect
	github.com/aws/aws-sdk-go-v2/feature/ec2/imds v1.16.1 // indirect
	github.com/aws/aws-sdk-go-v2/internal/ini v1.8.0 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/accept-encoding v1.11.2 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/presigned-url v1.11.7 // indirect
	github.com/aws/aws-sdk-go-v2/service/internal/s3shared v1.17.5 // indirect
	github.com/aws/aws-sdk-go-v2/service/sfn v1.26.2
	github.com/aws/aws-sdk-go-v2/service/sso v1.20.5 // indirect
	github.com/aws/aws-sdk-go-v2/service/sts v1.28.6
	github.com/bwmarrin/discordgo v0.27.1
	github.com/cpuguy83/go-md2man/v2 v2.0.4 // indirect
	github.com/dghubble/sling v1.4.2 // indirect
	github.com/go-chi/httplog v0.3.2
	github.com/golang-migrate/migrate/v4 v4.17.0
	github.com/golang/groupcache v0.0.0-20210331224755-41bb18bfe9da // indirect
	github.com/golang/protobuf v1.5.4 // indirect
	github.com/google/go-querystring v1.1.0 // indirect
	github.com/googleapis/gax-go/v2 v2.12.4 // indirect
	github.com/highlight-run/go-resthooks v0.0.0-20220523054100-bf95aa850a20
	github.com/huandu/go-sqlbuilder v1.27.3
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20231201235250-de7065d80cb9 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/klauspost/compress v1.17.9 // indirect
	github.com/nqd/flat v0.2.0
	github.com/pierrec/lz4/v4 v4.1.21 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/sendgrid/rest v2.6.9+incompatible // indirect
	github.com/stretchr/testify v1.9.0
	github.com/tdewolff/parse v2.3.4+incompatible
	go.opencensus.io v0.24.0 // indirect
	golang.org/x/crypto v0.27.0
	golang.org/x/exp v0.0.0-20240222234643-814bf88cf225
	golang.org/x/net v0.29.0 // indirect
	golang.org/x/sys v0.25.0 // indirect
	golang.org/x/time v0.5.0 // indirect
	google.golang.org/appengine v1.6.8 // indirect
	google.golang.org/genproto v0.0.0-20240617180043-68d350f18fd4 // indirect
	google.golang.org/grpc v1.66.2 // indirect
	google.golang.org/protobuf v1.34.2 // indirect
)
