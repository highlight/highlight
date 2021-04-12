package util

type BackendType string

const (
	Worker      BackendType = "worker"
	MainGraph   BackendType = "main-graph"
	ClientGraph BackendType = "client-graph"
)
