package otel

type SystemdKey = string

const Message SystemdKey = "MESSAGE"

func extractSystemd(fields *extractedFields, m map[string]any) {
	fields.logBody = m[Message].(string)
	for k, v := range m {
		if str, ok := v.(string); ok {
			fields.attrs[k] = str
		}
	}
}
