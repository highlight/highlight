package microsoftteamsV2_templates

type EventAlertPayload struct {
	AlertName string
	AlertText string
	CountText string
	AlertLink string
}

var EventAlertMessageTemplate = []byte(`{
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
			"title": "View Alert",
			"url":   "{{.AlertLink}}"
		}
	]
  }`)
