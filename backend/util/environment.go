package util

import (
	"os"
	"strings"

	"github.com/highlight-run/highlight/backend/model"
)

var (
	environment   = os.Getenv("ENVIRONMENT")
	OnPrem        = os.Getenv("ON_PREM")
	DopplerConfig = os.Getenv("DOPPLER_CONFIG")
	InDocker      = os.Getenv("IN_DOCKER")
	InDockerGo    = os.Getenv("IN_DOCKER_GO")
	Version       = os.Getenv("REACT_APP_COMMIT_SHA")
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

func IsHubspotEnabled() bool {
	return !IsDevOrTestEnv()
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

func IsProduction() bool {
	return strings.HasPrefix(DopplerConfig, "prod")
}

func EnvironmentName() string {
	envName := environment

	if IsOnPrem() {
		envName = "on-prem"
	}

	return envName
}
