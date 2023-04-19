package util

import "os"

var (
	env            = os.Getenv("ENVIRONMENT")
	DEV_ENV        = "dev"
	TEST_ENV       = "test"
	ON_PREM        = os.Getenv("ON_PREM")
	DOPPLER_CONFIG = os.Getenv("DOPPLER_CONFIG")
	IN_DOCKER      = os.Getenv("IN_DOCKER")
	IN_DOCKER_GO   = os.Getenv("IN_DOCKER_GO")
)

func IsHubspotEnabled() bool {
	return !IsDevEnv()
}

func IsDevEnv() bool {
	return env == DEV_ENV
}

func IsTestEnv() bool {
	return env == TEST_ENV
}

func IsDevOrTestEnv() bool {
	return IsTestEnv() || IsDevEnv()
}

func IsOnPrem() bool {
	return ON_PREM == "true"
}

func IsInDocker() bool {
	return IN_DOCKER == "true"
}

func IsBackendInDocker() bool {
	return IN_DOCKER_GO == "true"
}

func IsOnRender() bool {
	return DOPPLER_CONFIG == "prod_aws_render"
}
