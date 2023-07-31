package otel

import (
	"github.com/influxdata/go-syslog/v3/rfc5424"
	"go.opentelemetry.io/collector/pdata/plog"
	"strconv"
)

func extractSyslog(fields *extractedFields, attrs map[string]any) {
	p := rfc5424.NewParser(rfc5424.WithBestEffort())
	message, err := p.Parse([]byte(fields.logBody))
	if msg, ok := message.(*rfc5424.SyslogMessage); err == nil && ok {
		if msg.Message != nil {
			fields.logBody = *msg.Message
		}
		if msg.Facility != nil {
			attrs["facility"] = strconv.Itoa(int(*msg.Facility))
		}
		if msg.Severity != nil {
			fields.logSeverity = plog.SeverityNumber(*msg.Severity).String()
		}
		if msg.Priority != nil {
			attrs["priority"] = strconv.Itoa(int(*msg.Priority))
		}
		if msg.Timestamp != nil {
			fields.timestamp = *msg.Timestamp
		}
		if msg.Hostname != nil {
			attrs["hostname"] = *msg.Hostname
		}
		if msg.Appname != nil {
			attrs["app_name"] = *msg.Appname
		}
		if msg.ProcID != nil {
			attrs["proc_id"] = *msg.ProcID
		}
		if msg.MsgID != nil {
			attrs["msg_id"] = *msg.MsgID
		}
		if msg.StructuredData != nil {
			for k, v := range *msg.StructuredData {
				attrs[k] = v
			}
		}
	}
}
