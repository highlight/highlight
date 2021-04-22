package util

type BackendType string

const (
	Worker      BackendType = "worker"
	MainGraph   BackendType = "private-graph"
	ClientGraph BackendType = "public-graph"
)
