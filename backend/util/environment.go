package util

import "os"

var (
	env            = os.Getenv("ENVIRONMENT")
	DEV_ENV        = "dev"
	TEST_ENV       = "test"
	ON_PREM        = os.Getenv("REACT_APP_ONPREM")
	DOPPLER_CONFIG = os.Getenv("DOPPLER_CONFIG")
	IN_DOCKER      = os.Getenv("IN_DOCKER")
)

func IsDevEnv() bool {
	return env == DEV_ENV
}

func IsTestEnv() bool {
	return env == TEST_ENV
}

func IsDevOrTestEnv() bool {
	return env == DEV_ENV || env == TEST_ENV
}

func IsOnPrem() bool {
	return ON_PREM == "true"
}

func IsInDocker() bool {
	return IN_DOCKER == "true"
}

func IsOnRender() bool {
	return DOPPLER_CONFIG == "prod_aws_render"
}
