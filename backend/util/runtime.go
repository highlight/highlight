package util

type Runtime string

const (
	All          Runtime = "all"
	Worker       Runtime = "worker"
	PublicGraph  Runtime = "public-graph"
	PrivateGraph Runtime = "private-graph"
	// TODO: DEPRECATED
	Server Runtime = "server"
)

func (lt Runtime) IsValid() bool {
	switch lt {
	case All, Worker, PublicGraph, PrivateGraph:
		return true
	}
	return false
}
