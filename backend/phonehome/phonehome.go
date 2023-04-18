package phonehome

import (
	"context"
	"github.com/highlight-run/highlight/backend/projectpath"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	"github.com/shirou/gopsutil/mem"
	log "github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"runtime"
	"time"
)

const HighlightProjectID = "1"
const HeartbeatInterval = 5 * time.Second
const HeartbeatSpanName = "highlight-phone-home-interval"
const HeartbeatSpanDeployment = "deployment"
const HeartbeatSpanHighlightVersion = "highlight-version"
const MetricNumCPU = "num-cpu"
const MetricMemUsed = "mem-used"
const MetricMemActive = "mem-active"

func IsOptedOut(ctx context.Context) bool {
	cfg, err := projectpath.GetConfig()
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get opt out status")
		return true
	}
	return cfg.PhoneHomeOptOut
}

func Start(ctx context.Context) error {
	if IsOptedOut(ctx) {
		return nil
	}

	cfg, err := projectpath.GetConfig()
	if err != nil {
		return err
	}
	if cfg.PhoneHomeDeploymentID == "" {
		cfg.PhoneHomeDeploymentID = util.GenerateRandomString(32)
	}
	if err = projectpath.SaveConfig(cfg); err != nil {
		return err
	}

	if !highlight.IsRunning() {
		log.WithContext(ctx).Warn("phone home expected highlight sdk to be running")
	}

	go func() {
		ctx := context.Background()
		for range time.Tick(HeartbeatInterval) {
			vmStat, _ := mem.VirtualMemory()
			highlight.RecordMetric(ctx, MetricNumCPU, float64(runtime.NumCPU()))
			highlight.RecordMetric(ctx, MetricMemUsed, float64(vmStat.Used))
			highlight.RecordMetric(ctx, MetricMemActive, float64(vmStat.Active))
			s, _ := highlight.StartTrace(
				ctx, HeartbeatSpanName,
				attribute.String(highlight.ProjectIDAttribute, HighlightProjectID),
				attribute.String(HeartbeatSpanDeployment, cfg.PhoneHomeDeploymentID),
				attribute.String(HeartbeatSpanHighlightVersion, util.Version),
				attribute.Int(MetricNumCPU, runtime.NumCPU()),
				attribute.Int64(MetricMemUsed, int64(vmStat.Used)),
				attribute.Int64(MetricMemActive, int64(vmStat.Active)),
			)

			s.AddEvent(highlight.LogEvent, trace.WithAttributes(hlog.LogSeverityKey.String("trace"), hlog.LogMessageKey.String("backend-heartbeat")))
			highlight.EndTrace(s)
		}
	}()
	return nil
}
