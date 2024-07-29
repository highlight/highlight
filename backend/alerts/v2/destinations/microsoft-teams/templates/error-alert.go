package microsoftteamsV2_templates

type ErrorAlertPayload struct {
	ErrorCount      int
	Location        string
	ErrorLink       string
	Event           string
	SessionLinkText string
	ResolveLink     string
	IgnoreLink      string
	SnoozeLink      string
}

var ErrorAlertMessageTemplate = []byte(`{
	"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
	"type": "AdaptiveCard",
	"version": "1.6",
	"body": [
		{
		"type": "TextBlock",
		"size": "Large",
		"weight": "Bolder",
		"text": "Error Alert: {{.ErrorCount}} Recent Occurances"
		},
		{
		"type": "TextBlock",
		"text": "[Error event in {{.Location}}]({{.ErrorLink}})"
		},
		{
		"type": "TextBlock",
		"fontType": "Monospace",
		"text": "{{.Event}}",
		"wrap": true
		},
		{
		"type": "TextBlock",
		"text": "**Session** {{.SessionLinkText}}"
		}
	],
	"actions": [
		{
			"type":  "Action.OpenUrl",
			"title": "Resolve",
			"url":   "{{.ResolveLink}}"
		},
		{
			"type":  "Action.OpenUrl",
			"title": "Ignore",
			"url":   "{{.IgnoreLink}}"
		},
		{
			"type":  "Action.OpenUrl",
			"title": "Snooze",
			"url":   "{{.SnoozeLink}}"
		}
	]
  }`)
