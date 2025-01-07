package awsmetrics

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatch"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
)

type Config struct {
	Region          string
	AccessKeyID     string
	SecretAccessKey string
}

func NewCloudWatchClient(ctxStaticCredentialsProvider context.Context, cfg *Config) (*cloudwatch.Client, error) {
	awsCfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(cfg.Region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.AccessKeyID,
			cfg.SecretAccessKey,
			"", // Session token, empty in this case
		)),
	)

	if err != nil {
		return nil, err
	}

	return cloudwatch.NewFromConfig(awsCfg), nil
}

// LoadAWSConfig creates AWS SDK config from our config
func LoadAWSConfig(ctx context.Context, cfg *Config) (config.Config, error) {
	return config.LoadDefaultConfig(ctx,
		config.WithRegion(cfg.Region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.AccessKeyID,
			cfg.SecretAccessKey,
			"", // Session token, empty in this case
		)),
	)
}

func NewEC2Client(ctx context.Context, cfg *Config) (*ec2.Client, error) {
	awsCfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(cfg.Region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.AccessKeyID,
			cfg.SecretAccessKey,
			"", // Session token, empty in this case
		)),
	)

	if err != nil {
		return nil, err
	}

	return ec2.NewFromConfig(awsCfg), nil
}
