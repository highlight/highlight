package microsoftteamsV2_templates

type AlertUpsertPayload struct {
	AdminName   string
	AlertAction string
	AlertName   string
	AlertUrl    string
}

var AlertUpsertMessageTemplate = []byte(`{
	"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
	"type": "AdaptiveCard",
	"version": "1.6",
	"body": [
		{
			"type":   "TextBlock",
			"size":   "Large",
			"weight": "Bolder",
			"text":   "Alert {{.AlertAction}}!"
		},
		{
			"type":   "TextBlock",
			"text":   "{{.AdminName}} has {{.AlertAction}} the alert '[{{.AlertName}}]({{.AlertUrl}})'."
		}
	]
  }`)
