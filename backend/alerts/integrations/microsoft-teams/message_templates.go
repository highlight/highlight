package microsoft_teams

import (
	"bytes"
	"encoding/json"
	"text/template"
)

type NewSessionAlertPayload struct {
	Title          string
	SessionURL     string
	UserIdentifier string
	AvatarURL      string
	Facts          string
}

type BasicTemplatePayload struct {
	Title       string
	ActionTitle string
	ActionURL   string
	Description string
	Facts       string
}

func MakeAdaptiveCard(templateString []byte, payload interface{}) (map[string]interface{}, error) {
	var output bytes.Buffer

	tmpl := template.Must(template.New("user").Parse(string(templateString)))

	err := tmpl.Execute(&output, payload)
	if err != nil {
		return nil, err
	}

	var adaptiveCard map[string]interface{}

	err = json.Unmarshal(output.Bytes(), &adaptiveCard)
	if err != nil {
		return nil, err
	}
	return adaptiveCard, nil
}

var NewSessionAlertMessageTemplate = []byte(`{
	"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
	"type": "AdaptiveCard",
	"version": "1.0",
	"body": [
		{{ if .AvatarURL }}
			{
				"type": "ColumnSet",
				"columns": [
					{
						"type": "Column",
						"items": [
							{
								"type": "AvatarURL",
								"url": "{{.AvatarURL}}",
								"size": "Small",
								"style": "Person"
							}
						]
					},
					{
						"type": "Column",
						"items": [
							{
								"type":   "TextBlock",
								"size":   "Large",
								"weight": "Bolder",
								"text":   "{{.Title}}",
								"width":                    "stretch",
								"spacing":                  "Small",
								"horizontalAlignment":      "Left",
								"verticalContentAlignment": "Center"
							}
						]
					}
				]
			},
		{{else}}
			{
				"type":   "TextBlock",
				"size":   "Large",
				"weight": "Bolder",
				"text":   "{{.Title}}"
			},
		{{end}}
		{
			"type":   "TextBlock",
			"text":   "{{.UserIdentifier}}"
		},
		{
			"type": "FactSet",
			"facts": {{.Facts}}
				  
		}
	],
	"actions": [
		{
			"type":  "Action.OpenUrl",
			"title": "View Session",
			"url":   "{{.SessionURL}}"
		}
	]
  }`)

var BasicMessageTemplate = []byte(`{
	"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
	"type": "AdaptiveCard",
	"version": "1.0",
	"body": [
		{
			"type":   "TextBlock",
			"size":   "Large",
			"weight": "Bolder",
			"text":   "{{.Title}}",
			"spacing": "Small",
			"horizontalAlignment":      "Left",
			"verticalContentAlignment": "Center"
		},
		{
			"type":   "TextBlock",
			"text":   "{{.Description}}",
			"wrap": true,
			"spacing": "Small",
			"horizontalAlignment":      "Left",
			"verticalContentAlignment": "Center"
		},
		{
			"type": "FactSet",
			"facts": {{.Facts}}
		}
	],
	"actions": [
		{
			"type":  "Action.OpenUrl",
			"title": "{{.ActionTitle}}",
			"url":   "{{.ActionURL}}"
		}
	]
  }`)

var TrackPropertiesTemplate = []byte(`{
	"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
	"type": "AdaptiveCard",
	"version": "1.0",
	"body": [
		{
			"type":   "TextBlock",
			"size":   "Large",
			"weight": "Bolder",
			"text":   "{{.Title}}"
		},
		{
			"type":   "TextBlock",
			"text":   "{{.Description}}"
		},
		{
			"type": "ColumnSet",
			"columns": [
				{
					"type": "Column",
					"items": [
						{
							"type":   "TextBlock",
							"size":   "Medium",
							"weight": "Bolder",
							"text":   "Matched Track Properties"
						},
						{
							"type":   "TextBlock",
							"text":   "{{.MatchedValues}}",
							"wrap":    true,
							"width":   "stretch",
							"spacing": "Small"
						}
					]
				}
			]
		}
		{{ if .RelatedValues }}
			,{
				"type": "ColumnSet",
				"columns": [
					{
						"type": "Column",
						"items": [
							{
								"type":   "TextBlock",
								"size":   "Large",
								"weight": "Bolder",
								"text":   "Matched Track Properties"
							},
							{
								"type":   "TextBlock",
								"text":   "{{.RelatedValues}}",
								"wrap": true
								"width":                    "stretch",
								"spacing":                  "Small",
							}
						]
					}
				]
			}
		{{end}}
	]
  }`)

var UserPropertiesTemplate = []byte(`{
	"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
	"type": "AdaptiveCard",
	"version": "1.0",
	"body": [
		{
			"type":   "TextBlock",
			"size":   "Large",
			"weight": "Bolder",
			"text":   "{{.Title}}"
		},
		{
			"type":   "TextBlock",
			"text":   "{{.Description}}"
		},
		{
			"type": "ColumnSet",
			"columns": [
				{
					"type": "Column",
					"items": [
						{
							"type":   "TextBlock",
							"size":   "Large",
							"weight": "Bolder",
							"text":   "Matched Track Properties"
						},
						{
							"type":   "TextBlock",
							"text":   "{{.MatchedUserProperties}}",
							"wrap":    true,
							"width":   "stretch",
							"spacing": "Small"
						}
					]
				}
			]
		}
	],
	"actions": [
		{
			"type":  "Action.OpenUrl",
			"title": "{{.ActionTitle}}",
			"url":   "{{.ActionURL}}"
		}
	]
}`)
