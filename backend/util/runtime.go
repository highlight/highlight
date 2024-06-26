package util

import (
	"context"
	"flag"
	log "github.com/sirupsen/logrus"
)

type Runtime string

const (
	All          Runtime = "all"
	AllGraph     Runtime = "graph"
	Worker       Runtime = "worker"
	PublicGraph  Runtime = "public-graph"
	PrivateGraph Runtime = "private-graph"
)

func (lt Runtime) IsValid() bool {
	switch lt {
	case All, Worker, PublicGraph, PrivateGraph, AllGraph:
		return true
	}
	return false
}

func (lt Runtime) IsPublicGraph() bool {
	return lt == PublicGraph || lt == AllGraph || lt == All
}

func (lt Runtime) IsPrivateGraph() bool {
	return lt == PrivateGraph || lt == AllGraph || lt == All
}

func (lt Runtime) IsWorker() bool {
	return lt == Worker || lt == All
}

type Handler string

const (
	ReportStripeUsage        Handler = "report-stripe-usage"
	MigrateDB                Handler = "migrate-db"
	MetricMonitors           Handler = "metric-monitors"
	LogAlerts                Handler = "log-alerts"
	BackfillStackFrames      Handler = "backfill-stack-frames"
	RefreshMaterializedViews Handler = "refresh-materialized-views"
	PublicWorkerMain         Handler = "public-worker-main"
	PublicWorkerBatched      Handler = "public-worker-batched"
	PublicWorkerDataSync     Handler = "public-worker-datasync"
	PublicWorkerTraces       Handler = "public-worker-traces"
	AutoResolveStaleErrors   Handler = "auto-resolve-stale-errors"
)

func (lt Handler) IsValid() bool {
	switch lt {
	case ReportStripeUsage, MigrateDB, MetricMonitors, LogAlerts, BackfillStackFrames, RefreshMaterializedViews, PublicWorkerMain, PublicWorkerBatched, PublicWorkerDataSync, PublicWorkerTraces, AutoResolveStaleErrors:
		return true
	}
	return false
}

func GetRuntime() (Runtime, Handler) {
	flag.Parse()
	if runtimeFlag == nil {
		log.WithContext(context.Background()).Fatal("runtime is nil, provide a value")
	}
	runtime := Runtime(*runtimeFlag)
	if !runtime.IsValid() {
		log.WithContext(context.Background()).Fatalf("invalid runtime: %v", *runtimeFlag)
	}
	var handler Handler
	if handlerFlag != nil {
		handler = Handler(*handlerFlag)
	}
	return runtime, handler
}
