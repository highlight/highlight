package microsoftteamsV2_templates

type LogAlertPayload struct {
	AlertName string
	AlertText string
	CountText string
	LogsLink  string
}

var LogAlertMessageTemplate = []byte(`{
	"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
	"type": "AdaptiveCard",
	"version": "1.6",
	"body": [
		{
			"type":   "TextBlock",
			"size":   "Large",
			"weight": "Bolder",
			"text":   "{{.AlertName}} fired!"
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
			"title": "View Logs",
			"url":   "{{.LogsLink}}"
		}
	]
  }`)
