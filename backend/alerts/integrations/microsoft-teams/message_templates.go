package microsoft_teams

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

type ErrorAlertTemplatePayload struct {
	Title                      string
	Description                string
	Facts                      string
	SessionLabel               string
	SessionURL                 string
	ErrorURL                   string
	ErrorResolveURL            string
	ErrorIgnoreURL             string
	ErrorSnoozeURL             string
	ContainerStyle             string
	DisplayMissingSessionLabel bool
}

var NewSessionAlertMessageTemplate = []byte(`{
	"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
	"type": "AdaptiveCard",
	"version": "1.6",
	"body": [
		{{ if .AvatarURL }}
			{
				"type": "ColumnSet",
				"columns": [
					{
						"type": "Column",
						"items": [
							{
								"type": "Image",
								"url": "{{.AvatarURL}}",
								"size": "Small",
								"style": "Person"
							}
						],
						"width": "auto"
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
	"version": "1.6",
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
	"version": "1.6",
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
								"wrap": true,
								"width":                    "stretch",
								"spacing":                  "Small"
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
	"version": "1.6",
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

var ErrorAlertMessageTemplate = []byte(`{
	"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
	"type": "AdaptiveCard",
	"version": "1.6",
	"body": [
	  {
		"type": "Container",
		"style": "{{.ContainerStyle}}",
		"items": [
		  {
			"type": "TextBlock",
			"size": "Large",
			"weight": "Bolder",
			"text": "{{.Title}}",
			"spacing": "Small",
			"horizontalAlignment": "Left",
			"verticalContentAlignment": "Center"
		  },
		  {
			"type": "TextBlock",
			"text": "{{.Description}}",
			"wrap": true,
			"spacing": "Small",
			"horizontalAlignment": "Left",
			"verticalContentAlignment": "Center"
		  },
		  {
			"type": "FactSet",
			"facts": {{.Facts}}
		  },
		  {
			"type": "Container",
			"items": [
			  {
				"type": "ColumnSet",
				"columns": [
				  {
					"type": "Column",
					"width": "stretch",
					"items": [
					  {
						"type": "ActionSet",
						"actions": [
						  {
							"type": "Action.OpenUrl",
							"title": "{{.SessionLabel}}",
							"url": "{{.SessionURL}}",
							"isEnabled": {{.DisplayMissingSessionLabel}}
						  },
						  {
							"type": "Action.OpenUrl",
							"title": "View Error",
							"url": "{{.ErrorURL}}"
						  }
						]
					  }
					]
				  }
				]
			  }
			]
		  },
		  {
			"type": "Container",
			"items": [
			  {
				"type": "ColumnSet",
				"columns": [
				  {
					"type": "Column",
					"width": "stretch",
					"items": [
					  {
						"type": "ActionSet",
						"actions": [
						  {
							"type": "Action.OpenUrl",
							"title": "Resolve Error",
							"url": "{{.ErrorResolveURL}}"
						  },
						  {
							"type": "Action.OpenUrl",
							"title": "Ignore Error",
							"url": "{{.ErrorIgnoreURL}}"
						  },
						  {
							"type": "Action.OpenUrl",
							"title": "Snooze Error",
							"url": "{{.ErrorSnoozeURL}}"
						  }
						]
					  }
					]
				  }
				]
			  }
			]
		  }
		]
	  }
	]
  }`)
