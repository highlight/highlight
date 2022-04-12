module github.com/highlight-run/highlight/backend

go 1.14

replace github.com/opensearch-project/opensearch-go => github.com/highlight-run/opensearch-go v1.0.1

require (
	cloud.google.com/go/firestore v1.3.0 // indirect
	cloud.google.com/go/storage v1.11.0 // indirect
	firebase.google.com/go v3.13.0+incompatible
	github.com/99designs/gqlgen v0.13.0
	github.com/DataDog/datadog-go v4.4.0+incompatible
	github.com/DmitriyVTitov/size v1.1.0
	github.com/Microsoft/go-winio v0.4.16 // indirect
	github.com/alexbrainman/sspi v0.0.0-20180613141037-e580b900e9f5 // indirect
	github.com/andybalholm/brotli v1.0.3
	github.com/aws/aws-sdk-go-v2 v1.9.2
	github.com/aws/aws-sdk-go-v2/config v1.1.4
	github.com/aws/aws-sdk-go-v2/feature/cloudfront/sign v1.3.5
	github.com/aws/aws-sdk-go-v2/internal/ini v1.2.2 // indirect
	github.com/aws/aws-sdk-go-v2/service/s3 v1.4.0
	github.com/aws/smithy-go v1.8.0
	github.com/clearbit/clearbit-go v1.0.1
	github.com/confluentinc/confluent-kafka-go v1.8.2
	github.com/go-chi/chi v4.1.2+incompatible
	github.com/go-sourcemap/sourcemap v2.1.3+incompatible
	github.com/go-test/deep v1.0.4
	github.com/gorilla/sessions v1.2.1 // indirect
	github.com/gorilla/websocket v1.4.2
	github.com/highlight-run/highlight-go v0.4.0
	github.com/highlight-run/workerpool v1.3.0
	github.com/jcmturner/gokrb5/v8 v8.2.0 // indirect
	github.com/kr/pretty v0.2.0 // indirect
	github.com/kylelemons/godebug v1.1.0
	github.com/lib/pq v1.10.4
	github.com/mitchellh/mapstructure v1.1.2
	github.com/mssola/user_agent v0.5.3
	github.com/openlyinc/pointy v1.1.2
	github.com/opensearch-project/opensearch-go v1.0.0
	github.com/philhofer/fwd v1.1.1 // indirect
	github.com/pkg/errors v0.9.1
	github.com/rs/cors v1.7.0
	github.com/rs/xid v1.2.1
	github.com/sendgrid/rest v2.6.2+incompatible // indirect
	github.com/sendgrid/sendgrid-go v3.7.0+incompatible
	github.com/sirupsen/logrus v1.6.0
	github.com/slack-go/slack v0.9.1
	github.com/speps/go-hashids v2.0.0+incompatible
	github.com/stripe/stripe-go/v72 v72.73.1
	github.com/vektah/gqlparser/v2 v2.1.0
	golang.org/x/crypto v0.0.0-20210513164829-c07d793c2f9a // indirect
	golang.org/x/oauth2 v0.0.0-20200902213428-5d25da1a8d43
	golang.org/x/sync v0.0.0-20210220032951-036812b2e83c
	golang.org/x/sys v0.0.0-20210915083310-ed5796bab164 // indirect
	golang.org/x/text v0.3.7
	google.golang.org/api v0.31.0
	google.golang.org/genproto v0.0.0-20210916144049-3192f974c780 // indirect
	gopkg.in/DataDog/dd-trace-go.v1 v1.34.0
	gopkg.in/jcmturner/aescts.v1 v1.0.1 // indirect
	gopkg.in/jcmturner/dnsutils.v1 v1.0.1 // indirect
	gopkg.in/jcmturner/goidentity.v3 v3.0.0 // indirect
	gopkg.in/jcmturner/gokrb5.v7 v7.5.0 // indirect
	gopkg.in/jcmturner/rpc.v1 v1.1.0 // indirect
	gopkg.in/kothar/brotli-go.v0 v0.0.0-20170728081549-771231d473d6
	gopkg.in/yaml.v2 v2.3.0 // indirect
	gopkg.in/yaml.v3 v3.0.0-20200615113413-eeeca48fe776 // indirect
	gorm.io/driver/postgres v1.0.8
	gorm.io/gorm v1.21.9
)
