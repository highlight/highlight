package otel

import (
	"strconv"

	"github.com/influxdata/go-syslog/v3/rfc5424"
	"go.opentelemetry.io/collector/pdata/plog"
)

func extractSyslog(fields *extractedFields) {
	p := rfc5424.NewParser(rfc5424.WithBestEffort())
	message, err := p.Parse([]byte(fields.logBody))
	if msg, ok := message.(*rfc5424.SyslogMessage); err == nil && ok {
		if msg.Message != nil {
			fields.logBody = *msg.Message
		}
		if msg.Facility != nil {
			fields.attrs["facility"] = strconv.Itoa(int(*msg.Facility))
		}
		if msg.Severity != nil {
			fields.logSeverity = plog.SeverityNumber(*msg.Severity).String()
		}
		if msg.Priority != nil {
			fields.attrs["priority"] = strconv.Itoa(int(*msg.Priority))
		}
		if msg.Timestamp != nil {
			fields.timestamp = *msg.Timestamp
		}
		if msg.Hostname != nil {
			fields.attrs["hostname"] = *msg.Hostname
		}
		if msg.Appname != nil {
			fields.attrs["app_name"] = *msg.Appname
		}
		if msg.ProcID != nil {
			fields.attrs["proc_id"] = *msg.ProcID
		}
		if msg.MsgID != nil {
			fields.attrs["msg_id"] = *msg.MsgID
		}
		if msg.StructuredData != nil {

			for topLevelKey, vMap := range *msg.StructuredData {
				for k, v := range vMap {
					fields.attrs[topLevelKey+"."+k] = v
				}
			}
		}
	}
}
