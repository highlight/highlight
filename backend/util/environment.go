package util

import "os"

var (
	env           = os.Getenv("ENVIRONMENT")
	DevEnv        = "dev"
	TestEnv       = "test"
	OnPrem        = os.Getenv("ON_PREM")
	DopplerConfig = os.Getenv("DOPPLER_CONFIG")
	InDocker      = os.Getenv("IN_DOCKER")
	InDockerGo    = os.Getenv("IN_DOCKER_GO")
	Version       = os.Getenv("REACT_APP_COMMIT_SHA")
)

func IsHubspotEnabled() bool {
	return !IsDevEnv()
}

func IsDevEnv() bool {
	return env == DevEnv
}

func IsTestEnv() bool {
	return env == TestEnv
}

func IsDevOrTestEnv() bool {
	return IsTestEnv() || IsDevEnv()
}

func IsOnPrem() bool {
	return OnPrem == "true"
}

func IsInDocker() bool {
	return InDocker == "true"
}

func IsBackendInDocker() bool {
	return InDockerGo == "true"
}

func IsOnRender() bool {
	return DopplerConfig == "prod_aws_render"
}
