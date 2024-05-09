package otel

import (
	"go.opentelemetry.io/collector/pdata/plog"
	"strconv"
)

type SystemdKey = string

const Message SystemdKey = "MESSAGE"
const Priority SystemdKey = "PRIORITY"

func extractSystemd(fields *extractedFields, m map[string]any) {
	fields.logBody, _ = m[Message].(string)
	if prio, ok := m[Priority].(string); ok {
		if priority, err := strconv.ParseInt(prio, 10, 4); err == nil {
			switch priority {
			case 0, 1:
				fields.logSeverity = plog.SeverityNumberFatal.String()
			case 2, 3:
				fields.logSeverity = plog.SeverityNumberError.String()
			case 4, 5:
				fields.logSeverity = plog.SeverityNumberWarn.String()
			case 6:
				fields.logSeverity = plog.SeverityNumberInfo.String()
			case 7:
				fields.logSeverity = plog.SeverityNumberDebug.String()
			}
		}
	}
	for k, v := range m {
		if str, ok := v.(string); ok {
			fields.attrs[k] = str
		}
	}
}
