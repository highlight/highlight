package phonehome

import (
	"context"
	"github.com/highlight-run/highlight/backend/model"
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

type UsageType = string

const AdminUsage UsageType = "highlight-admin-usage"
const WorkspaceUsage UsageType = "highlight-workspace-usage"

const BackendSetup = "highlight-backend-setup"
const SessionCount = "highlight-session-count"
const ErrorCount = "highlight-error-count"
const LogCount = "highlight-log-count"
const SessionViewCount = "highlight-session-view-count"
const ErrorViewCount = "highlight-error-view-count"
const LogViewCount = "highlight-log-view-count"

const AboutYouSpanName = "highlight-about-you"
const AboutYouSpanReferral = "highlight-about-you-referral"
const AboutYouSpanRole = "highlight-about-you-role"
const AboutYouSpanTeamSize = "highlight-about-you-team-size"
const AboutYouSpanHeardAbout = "highlight-about-you-heard-about"
const HeartbeatInterval = 5 * time.Second
const HeartbeatSpanName = "highlight-heartbeat"
const HighlightProjectID = "1"
const MetricMemTotal = "highlight-mem-total"
const MetricMemUsedPercent = "highlight-mem-used-percent"
const MetricNumCPU = "highlight-num-cpu"
const SpanDeployment = "highlight-phone-home-deployment-id"
const SpanDopplerConfig = "highlight-doppler-config"
const SpanHighlightVersion = "highlight-version"
const SpanOnPrem = "highlight-is-onprem"

func IsOptedOut(_ context.Context) bool {
	return false
}

func GetDefaultAttributes() ([]attribute.KeyValue, error) {
	cfg, err := projectpath.GetConfig()
	if err != nil {
		return nil, err
	}
	if cfg.PhoneHomeDeploymentID == "" {
		cfg.PhoneHomeDeploymentID = util.GenerateRandomString(32)
	}
	if err = projectpath.SaveConfig(cfg); err != nil {
		return nil, err
	}

	return []attribute.KeyValue{
		attribute.String(highlight.ProjectIDAttribute, HighlightProjectID),
		attribute.String(SpanDeployment, cfg.PhoneHomeDeploymentID),
		attribute.String(SpanDopplerConfig, util.DopplerConfig),
		attribute.String(SpanHighlightVersion, util.Version),
		attribute.String(SpanOnPrem, util.OnPrem),
	}, nil
}

func Start(ctx context.Context) error {
	if IsOptedOut(ctx) {
		return nil
	}

	go func() {
		ctx := context.Background()
		for range time.Tick(HeartbeatInterval) {
			vmStat, _ := mem.VirtualMemory()
			highlight.RecordMetric(ctx, MetricNumCPU, float64(runtime.NumCPU()))
			highlight.RecordMetric(ctx, MetricMemUsedPercent, vmStat.UsedPercent)
			highlight.RecordMetric(ctx, MetricMemTotal, float64(vmStat.Total))
			tags, _ := GetDefaultAttributes()
			tags = append(tags,
				attribute.Int(MetricNumCPU, runtime.NumCPU()),
				attribute.Float64(MetricMemUsedPercent, vmStat.UsedPercent),
				attribute.Int64(MetricMemTotal, int64(vmStat.Total)),
			)

			s, _ := highlight.StartTrace(ctx, HeartbeatSpanName, tags...)
			s.AddEvent(highlight.LogEvent, trace.WithAttributes(hlog.LogSeverityKey.String(log.TraceLevel.String()), hlog.LogMessageKey.String(HeartbeatSpanName)))
			highlight.EndTrace(s)
		}
	}()
	log.WithContext(ctx).Info("started highlight phone home service")
	return nil
}

func ReportAdminAboutYouDetails(ctx context.Context, admin *model.Admin) {
	if IsOptedOut(ctx) {
		return
	}

	tags, _ := GetDefaultAttributes()
	if admin.UserDefinedRole != nil {
		tags = append(tags, attribute.String(AboutYouSpanRole, *admin.UserDefinedRole))
	}
	if admin.UserDefinedTeamSize != nil {
		tags = append(tags, attribute.String(AboutYouSpanTeamSize, *admin.UserDefinedTeamSize))
	}
	if admin.HeardAbout != nil {
		tags = append(tags, attribute.String(AboutYouSpanHeardAbout, *admin.HeardAbout))
	}
	if admin.Referral != nil {
		tags = append(tags, attribute.String(AboutYouSpanReferral, *admin.Referral))
	}

	s, _ := highlight.StartTrace(ctx, AboutYouSpanName, tags...)
	s.AddEvent(highlight.LogEvent, trace.WithAttributes(hlog.LogSeverityKey.String(log.TraceLevel.String()), hlog.LogMessageKey.String(AboutYouSpanName)))
	highlight.EndTrace(s)
}

func ReportUsageMetrics(ctx context.Context, usageType UsageType, id int, metrics []attribute.KeyValue) {
	if IsOptedOut(ctx) {
		return
	}

	tags, _ := GetDefaultAttributes()
	tags = append(tags, attribute.Int("id", id))
	tags = append(tags, metrics...)
	s, _ := highlight.StartTrace(ctx, usageType, tags...)
	s.AddEvent(highlight.LogEvent, trace.WithAttributes(hlog.LogSeverityKey.String(log.TraceLevel.String()), hlog.LogMessageKey.String(usageType)))
	highlight.EndTrace(s)
}
