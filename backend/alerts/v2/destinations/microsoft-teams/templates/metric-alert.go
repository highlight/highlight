package microsoftteamsV2_templates

type MetricAlertPayload struct {
	AlertName   string
	AlertText   string
	CountText   string
	MetricsLink string
}

var MetricAlertMessageTemplate = []byte(`{
	"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
	"type": "AdaptiveCard",
	"version": "1.6",
	"body": [
		{
			"type":   "TextBlock",
			"size":   "Large",
			"weight": "Bolder",
			"text":   "{{.AlertName}} Alert"
		},
		{
			"type":   "TextBlock",
			"text":   "{{.AlertText}}"
		},
		{
			"type":   "TextBlock",
			"text":   "{{.CountText}}"
		}
	],
	"actions": [
		{
			"type":  "Action.OpenUrl",
			"title": "View Metrics",
			"url":   "{{.MetricsLink}}"
		}
	]
  }`)
