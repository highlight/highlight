package util

import "os"

var (
	env            = os.Getenv("ENVIRONMENT")
	DEV_ENV        = "dev"
	TEST_ENV       = "test"
	ON_PREM        = os.Getenv("REACT_APP_ONPREM")
	DOPPLER_CONFIG = os.Getenv("DOPPLER_CONFIG")
)

func IsDevOrTestEnv() bool {
	return env == DEV_ENV || env == TEST_ENV
}

func IsOnPrem() bool {
	return ON_PREM == "true"
}

func IsOnRender() bool {
	return ON_RENDER == "prod_aws_render"
}
