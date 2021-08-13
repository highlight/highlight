package util

import "os"

var (
	env    	 = os.Getenv("ENVIRONMENT")
	DEV_ENV  = "dev"
	TEST_ENV = "test"
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
