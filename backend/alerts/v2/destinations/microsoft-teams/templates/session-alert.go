package microsoftteamsV2_templates

type SessionAlertPayload struct {
	AlertName        string
	Query            string
	SecureID         string
	Identifier       string
	SessionURL       string
	MoreSessionsLink string
}

var SessionAlertMessageTemplate = []byte(`{
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
			"text":   "Session found that matches query: **{{.Query}}**"
		},
		{
			"type":   "TextBlock",
			"text":   "**Session**: [#{{.SecureID}}]({{.SessionURL}})"
		},
		{
			"type":   "TextBlock",
			"text":   "**User Identifier**: {{.Identifier}}"
		}
	],
	"actions": [
		{
			"type":  "Action.OpenUrl",
			"title": "View Session",
			"url":   "{{.SessionURL}}"
		},
		{
			"type":  "Action.OpenUrl",
			"title": "View More Sessions",
			"url":   "{{.MoreSessionsLink}}"
		}
	]
  }`)
