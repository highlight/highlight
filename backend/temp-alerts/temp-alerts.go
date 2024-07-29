/*
* TODO: These methods were pulled out of the models file to allow imports of other files,
* while avoiding circular imports with the models file. These methods should be refactored
* into a more appropriate file when a direction is decided on how to best handle alerts.
 */

package tempalerts

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"runtime"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/env"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"gorm.io/gorm"

	"github.com/aws/smithy-go/ptr"
	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"

	Email "github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/lambda"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/routing"
)

type SendSlackAlertInput struct {
	// Workspace is a required parameter
	Workspace *model.Workspace
	// SessionSecureID is a required parameter
	SessionSecureID string
	// Project is a required parameter
	Project *model.Project
	// SessionExluded is a required parameter to tell if the session is playable
	SessionExcluded bool
	// UserIdentifier is a required parameter for New User, Error, and SessionFeedback alerts
	UserIdentifier string
	// UserObject is a required parameter for alerts that relate to a session
	UserObject model.JSONB
	// Group is a required parameter for Error alerts
	Group *model.ErrorGroup
	// ErrorObject is a required parameter for Error alerts
	ErrorObject *model.ErrorObject
	// URL is an optional parameter for Error alerts
	URL *string
	// ErrorsCount is a required parameter for Error alerts
	ErrorsCount *int64
	// FirstErrorAlert is a required parameter for Error alerts
	FirstErrorAlert bool
	// MatchedFields is a required parameter for Track Properties and User Properties alerts
	MatchedFields []*model.Field
	// RelatedFields is an optional parameter for Track Properties and User Properties alerts
	RelatedFields []*model.Field
	// UserProperties is a required parameter for User Properties alerts
	UserProperties map[string]string
	// CommentID is a required parameter for SessionFeedback alerts
	CommentID *int
	// CommentText is a required parameter for SessionFeedback alerts
	CommentText string
	// QueryParams is a map of query params to be appended to the url suffix
	// `key:value` will be converted to `key=value` in the url with the appropriate separator (`?` or `&`)
	// - tsAbs is required for rage click alerts
	QueryParams map[string]string
	// RageClicksCount is a required parameter for Rage Click Alerts
	RageClicksCount *int64
	// Timestamp is an optional value for all session alerts.
	Timestamp *time.Time
}

func SendAlertFeedback(ctx context.Context, db *gorm.DB, mailClient *sendgrid.Client, obj *model.ErrorAlert, input *SendSlackAlertInput) {
	obj.Type = ptr.String(model.AlertType.ERROR_FEEDBACK)
	if err := sendSlackAlert(ctx, db, &obj.AlertDeprecated, input); err != nil {
		log.WithContext(ctx).Error(err)
	}
}

func SendErrorAlerts(ctx context.Context, db *gorm.DB, mailClient *sendgrid.Client, lambdaClient *lambda.Client, obj *model.ErrorAlert, input *SendSlackAlertInput) {
	defer func() {
		db.Create(&model.ErrorAlertEvent{
			ErrorAlertID:  obj.ID,
			ErrorObjectID: input.ErrorObject.ID,
			SentAt:        time.Now(),
		})
	}()

	if err := sendSlackAlert(ctx, db, &obj.AlertDeprecated, input); err != nil {
		log.WithContext(ctx).Error(err)
	}
	emailsToNotify, err := model.GetEmailsToNotify(obj.EmailsToNotify)
	if err != nil {
		log.WithContext(ctx).Error(err)
	}

	frontendURL := env.Config.FrontendUri
	errorURL := fmt.Sprintf("%s/%d/errors/%s/instances/%d", frontendURL, obj.ProjectID, input.Group.SecureID, input.ErrorObject.ID)
	errorURL = routing.AttachReferrer(ctx, errorURL, routing.Email)
	sessionURL := fmt.Sprintf("%s/%d/sessions/%s", frontendURL, obj.ProjectID, input.SessionSecureID)

	alertUrl := fmt.Sprintf("%s/%d/alerts/errors/%d", frontendURL, obj.ProjectID, obj.ID)
	sessionExcluded := input.SessionSecureID == "" || input.SessionExcluded

	templateData := map[string]interface{}{
		"alertLink":       alertUrl,
		"errorCount":      *input.ErrorsCount,
		"errorEvent":      input.Group.Event,
		"errorLink":       errorURL,
		"firstError":      input.FirstErrorAlert,
		"projectName":     *input.Project.Name,
		"serviceName":     input.ErrorObject.ServiceName,
		"sessionExcluded": sessionExcluded,
		"sessionLink":     sessionURL,
	}

	emailHtml, err := lambdaClient.FetchReactEmailHTML(ctx, lambda.ReactEmailTemplateErrorAlert, templateData)
	if err != nil {
		log.WithContext(ctx).Error(errors.Wrap(err, "error fetching email html"))
		return
	}

	subjectLine := fmt.Sprintf("%s: %s", obj.Name, input.Group.Event)

	for _, email := range emailsToNotify {
		if err := Email.SendReactEmailAlert(ctx, mailClient, *email, emailHtml, subjectLine); err != nil {
			log.WithContext(ctx).Error(err)
		}
	}
}

type PropertyPair struct {
	key   string
	value string
}

func SendSessionAlerts(ctx context.Context, db *gorm.DB, mailClient *sendgrid.Client, lambdaClient *lambda.Client, obj *model.SessionAlert, input *SendSlackAlertInput) {
	defer func() {
		db.Create(&model.SessionAlertEvent{
			SessionAlertID:  obj.ID,
			SessionSecureID: input.SessionSecureID,
			SentAt:          time.Now(),
		})
	}()

	if err := sendSlackAlert(ctx, db, &obj.AlertDeprecated, input); err != nil {
		log.WithContext(ctx).Error(err)
	}

	emailsToNotify, err := model.GetEmailsToNotify(obj.EmailsToNotify)
	if err != nil {
		log.WithContext(ctx).Error(err)
	}

	frontendURL := env.Config.FrontendUri
	sessionURL := fmt.Sprintf("%s/%d/sessions/%s", frontendURL, obj.ProjectID, input.SessionSecureID)
	alertUrl := fmt.Sprintf("%s/%d/alerts/logs/%d", frontendURL, obj.ProjectID, obj.ID)

	var alertType lambda.ReactEmailTemplate
	subjectLine := ""
	identifier := input.UserIdentifier
	if val, ok := input.UserObject["email"].(string); ok && len(val) > 0 {
		identifier = val
	}
	if val, ok := input.UserObject["highlightDisplayName"].(string); ok && len(val) > 0 {
		identifier = val
	}
	if identifier == "" {
		identifier = "Someone"
	}

	templateData := map[string]interface{}{
		"alertLink":     alertUrl,
		"alertName":     obj.Name,
		"projectName":   *input.Project.Name,
		"userIdentifer": identifier,
		"sessionLink":   sessionURL,
	}

	switch *obj.Type {
	case model.AlertType.NEW_SESSION:
		alertType = lambda.ReactEmailTemplateNewSessionAlert
		subjectLine = fmt.Sprintf("%s just started a new session", identifier)
	case model.AlertType.NEW_USER:
		alertType = lambda.ReactEmailTemplateNewUserAlert
		subjectLine = fmt.Sprintf("%s just started their first session", identifier)
	case model.AlertType.RAGE_CLICK:
		alertType = lambda.ReactEmailTemplateRageClickAlert
		subjectLine = fmt.Sprintf("%s has been rage clicking in a session.", identifier)
	case model.AlertType.TRACK_PROPERTIES:
		alertType = lambda.ReactEmailTemplateTrackEventAlert
		subjectLine = fmt.Sprintf("%s triggered some track events.", identifier)

		propertyArray := []PropertyPair{}
		for _, addr := range input.MatchedFields {
			propertyArray = append(propertyArray, PropertyPair{key: addr.Name, value: addr.Value})
		}

		templateData["eventProperties"] = propertyArray
	case model.AlertType.USER_PROPERTIES:
		alertType = lambda.ReactEmailTemplateTrackUserAlert
		subjectLine = fmt.Sprintf("%s triggered some track events.", identifier)

		propertyArray := []PropertyPair{}
		for _, addr := range input.MatchedFields {
			propertyArray = append(propertyArray, PropertyPair{key: addr.Name, value: addr.Value})
		}

		templateData["userProperties"] = propertyArray
	default:
		return
	}

	if lambdaClient == nil {
		return
	}

	emailHtml, err := lambdaClient.FetchReactEmailHTML(ctx, alertType, templateData)
	if err != nil {
		log.WithContext(ctx).Error(errors.Wrap(err, "error fetching email html"))
		return
	}

	for _, email := range emailsToNotify {
		if err := Email.SendReactEmailAlert(ctx, mailClient, *email, emailHtml, subjectLine); err != nil {
			log.WithContext(ctx).Error(err)

		}
	}
}

func getUserPropertiesBlock(identifier string, userProperties map[string]string) ([]*slack.TextBlockObject, *slack.Accessory) {
	messageBlock := []*slack.TextBlockObject{}
	var accessory *slack.Accessory
	for k, v := range userProperties {
		if k == "" {
			continue
		}
		if v == "" {
			v = "_empty_"
		}
		caser := cases.Title(language.AmericanEnglish)
		key := caser.String(strings.ToLower(k))
		if key == "Avatar" {
			_, err := url.ParseRequestURI(v)
			if err != nil {
				// If not a valid URL, append to the body like any other property
				messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*%s*\n%s", key, v), false, false))
			} else {
				// If it is valid, create an accessory from the image
				accessory = slack.NewAccessory(slack.NewImageBlockElement(v, "avatar"))
			}
		} else {
			messageBlock = append(messageBlock, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*%s*\n%s", key, v), false, false))
		}
	}
	return messageBlock, accessory
}

var FILE_NAME_LENGTH_LIMIT = 75

var RED_ALERT = "#961e13"
var YELLOW_ALERT = "#f2c94c"
var GREEN_ALERT = "#2eb886"
var BLUE_ALERT = "#1e40af"

func getAlertColor(alertType string) string {
	switch alertType {
	case model.AlertType.ERROR, model.AlertType.RAGE_CLICK, model.AlertType.ERROR_FEEDBACK:
		return RED_ALERT
	case model.AlertType.NEW_USER, model.AlertType.NEW_SESSION:
		return GREEN_ALERT
	case model.AlertType.TRACK_PROPERTIES, model.AlertType.USER_PROPERTIES:
		return BLUE_ALERT
	default:
		return YELLOW_ALERT
	}
}

func getPreviewText(alertType string) string {
	switch alertType {
	case model.AlertType.ERROR:
		return "Temporary - overwritten"
	case model.AlertType.RAGE_CLICK:
		return "Rage Clicks Alert"
	case model.AlertType.NEW_USER:
		return "New User Alert"
	case model.AlertType.NEW_SESSION:
		return "New Session Created"
	case model.AlertType.TRACK_PROPERTIES:
		return "Track Properties Alert"
	case model.AlertType.USER_PROPERTIES:
		return "User Properties Alert"
	case model.AlertType.ERROR_FEEDBACK:
		return "Crash Report Alert"
	default:
		return "Alert"
	}
}

func sendSlackAlert(ctx context.Context, db *gorm.DB, obj *model.AlertDeprecated, input *SendSlackAlertInput) error {
	// TODO: combine `error_alerts` and `session_alerts` tables and create composite index on (project_id, type)
	if obj == nil {
		return errors.New("alert is nil")
	}
	// get alerts channels
	channels, err := obj.GetChannelsToNotify()
	if err != nil {
		return errors.Wrap(err, "error getting channels to notify from user properties alert")
	}
	if len(channels) <= 0 {
		return nil
	}
	// get project's channels
	integratedSlackChannels, err := input.Workspace.IntegratedSlackChannels()
	if err != nil {
		return errors.Wrap(err, "error getting slack webhook url for alert")
	}
	if len(integratedSlackChannels) <= 0 {
		return nil
	}

	frontendURL := env.Config.FrontendUri
	suffix := ""
	if input.QueryParams == nil {
		input.QueryParams = make(map[string]string)
	}
	if input.CommentID != nil {
		input.QueryParams["commentId"] = fmt.Sprintf("%d", *input.CommentID)
	}
	if len(input.QueryParams) > 0 {
		for k, v := range input.QueryParams {
			if len(suffix) == 0 {
				suffix += "?"
			} else {
				suffix += "&"
			}
			suffix += fmt.Sprintf("%s=%s", k, v)
		}
	}

	identifier := input.UserIdentifier
	if val, ok := input.UserObject["email"].(string); ok && len(val) > 0 {
		identifier = val
	}
	if val, ok := input.UserObject["highlightDisplayName"].(string); ok && len(val) > 0 {
		identifier = val
	}

	if obj.Type == nil {
		if input.Group != nil {
			obj.Type = &model.AlertType.ERROR
		} else {
			obj.Type = &model.AlertType.NEW_USER
		}
	}

	previewText := getPreviewText(*obj.Type)
	attachmentColor := getAlertColor(*obj.Type)

	var headerBlockSet []slack.Block

	var bodyBlockSet []slack.Block
	var attachment *slack.Attachment

	var sessionString string
	if input.SessionSecureID == "" || input.SessionExcluded {
		if identifier == "" {
			sessionString = "*Session* No recorded session"
		} else {
			sessionString = fmt.Sprintf("*Session* No recorded session (%s)", identifier)
		}
	} else {
		sessionUserIdentifier := identifier
		if sessionUserIdentifier == "" {
			sessionUserIdentifier = "_unidentified_ user"
		}

		sessionLink := fmt.Sprintf("%s/%d/sessions/%s%s", frontendURL, obj.ProjectID, input.SessionSecureID, suffix)
		sessionText := fmt.Sprintf("#%s (%s)", input.SessionSecureID, sessionUserIdentifier)
		sessionString = fmt.Sprintf("*Session* <%s|%s>", sessionLink, sessionText)
	}

	switch *obj.Type {
	case model.AlertType.ERROR:
		previewEvent := input.Group.Event
		if len(input.Group.Event) > 100 {
			previewEvent = input.Group.Event[:100] + "..."
		}
		errorLink := fmt.Sprintf("%s/%d/errors/%s/instances/%d", frontendURL, obj.ProjectID, input.Group.SecureID, input.ErrorObject.ID)
		errorLink = routing.AttachReferrer(ctx, errorLink, routing.Slack)

		// construct Slack message
		// header
		var headerBlock *slack.TextBlockObject
		if input.FirstErrorAlert {
			previewText = fmt.Sprintf("New Error Alert: %s", previewEvent)
			headerBlock = slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*New Error Alert: %d Recent Occurrences ❇️*", *input.ErrorsCount), false, false)
			attachmentColor = YELLOW_ALERT
		} else {
			previewText = fmt.Sprintf("Error Alert: %s", previewEvent)
			headerBlock = slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Error Alert: %d Recent Occurrences*", *input.ErrorsCount), false, false)
		}
		headerBlockSet = append(headerBlockSet, slack.NewSectionBlock(headerBlock, nil, nil))

		// body
		locationName := *input.Project.Name
		if input.ErrorObject.ServiceName != "" {
			locationName = input.ErrorObject.ServiceName + " - " + locationName
		}

		errorEvent := input.Group.Event
		if len(errorEvent) > 250 {
			errorEvent = errorEvent[:250] + "..."
		}

		eventBlock := slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*<%s|Error event in %s>*\n```%s```\n%s", errorLink, locationName, errorEvent, sessionString), false, false)

		var actionBlocks []slack.BlockElement
		caser := cases.Title(language.AmericanEnglish)
		for _, action := range modelInputs.AllErrorState {
			if input.Group.State == action {
				continue
			}

			titleStr := string(action)
			if action == modelInputs.ErrorStateIgnored || action == modelInputs.ErrorStateResolved {
				titleStr = titleStr[:len(titleStr)-1]
			}
			button := slack.NewButtonBlockElement(
				"",
				"click",
				slack.NewTextBlockObject(
					slack.PlainTextType,
					caser.String(strings.ToLower(titleStr)),
					false,
					false,
				),
			)
			button.URL = routing.AttachQueryParam(ctx, errorLink, "action", strings.ToLower(string(action)))
			actionBlocks = append(actionBlocks, button)
		}

		snoozeButton := slack.NewButtonBlockElement(
			"",
			"click",
			slack.NewTextBlockObject(
				slack.PlainTextType,
				"Snooze",
				false,
				false,
			),
		)
		snoozeButton.URL = routing.AttachQueryParam(ctx, errorLink, "action", "snooze")
		actionBlocks = append(actionBlocks, snoozeButton)

		var stackTrace []*modelInputs.ErrorTrace
		var stackTraceBlock *slack.TextBlockObject

		stackTraceString := input.ErrorObject.MappedStackTrace
		if stackTraceString == nil {
			stackTraceString = input.ErrorObject.StackTrace
		}

		if err := json.Unmarshal([]byte(*stackTraceString), &stackTrace); err == nil {
			firstTrace := stackTrace[0]

			var fileLocation string
			if firstTrace.LineNumber != nil {
				fileLocation = fmt.Sprintf("%s:%d", *firstTrace.FileName, *firstTrace.LineNumber)
			} else if firstTrace.FileName != nil {
				fileLocation = *firstTrace.FileName
			} else {
				fileLocation = "File unknown"
			}

			if len(fileLocation) > FILE_NAME_LENGTH_LIMIT {
				cutoffIndex := len(fileLocation) - FILE_NAME_LENGTH_LIMIT
				substringIndex := strings.Index(fileLocation[cutoffIndex:], "/")
				if substringIndex > -1 {
					finalCutoffIndex := cutoffIndex + substringIndex
					fileLocation = "..." + fileLocation[finalCutoffIndex:]
				}
			}

			stackTraceBlock = slack.NewTextBlockObject(slack.PlainTextType, fileLocation, false, false)
		}

		bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(eventBlock, nil, nil))
		bodyBlockSet = append(bodyBlockSet, slack.NewActionBlock("", actionBlocks...))
		if stackTraceBlock != nil {
			highlightLogo := *slack.NewImageBlockElement("https://beta.highlight.io/logo192.png", "Highlight logo")
			bodyBlockSet = append(bodyBlockSet, slack.NewContextBlock("", highlightLogo, stackTraceBlock))
		}
	case model.AlertType.NEW_USER:
		// header
		headerBlock := slack.NewTextBlockObject(slack.MarkdownType, "*New User Alert*", false, false)
		headerBlockSet = append(headerBlockSet, slack.NewSectionBlock(headerBlock, nil, nil))

		// body
		var attributeBlocks []*slack.TextBlockObject
		userPropertiesBlock, accessory := getUserPropertiesBlock(identifier, input.UserProperties)
		attributeBlocks = append(attributeBlocks, userPropertiesBlock...)

		sessionBlock := slack.NewTextBlockObject(slack.MarkdownType, sessionString, false, false)
		bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(sessionBlock, attributeBlocks, accessory))
	case model.AlertType.TRACK_PROPERTIES:
		// format matched properties
		var matchedFormattedFields string
		var relatedFormattedFields string
		for index, addr := range input.MatchedFields {
			matchedFormattedFields = matchedFormattedFields + fmt.Sprintf("%d. *%s*: `%s`\n", index+1, addr.Name, addr.Value)
		}
		for index, addr := range input.RelatedFields {
			relatedFormattedFields = relatedFormattedFields + fmt.Sprintf("%d. *%s*: `%s`\n", index+1, addr.Name, addr.Value)
		}

		// header
		headerBlock := slack.NewTextBlockObject(slack.MarkdownType, "*Track Properties Alert*", false, false)
		headerBlockSet = append(headerBlockSet, slack.NewSectionBlock(headerBlock, nil, nil))

		// body
		var attributeBlocks []*slack.TextBlockObject
		attributeBlocks = append(attributeBlocks, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Matched Track Properties*\n%+v", matchedFormattedFields), false, false))
		attributeBlocks = append(attributeBlocks, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Related Track Properties*\n%+v", relatedFormattedFields), false, false))

		sessionBlock := slack.NewTextBlockObject(slack.MarkdownType, sessionString, false, false)
		bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(sessionBlock, attributeBlocks, nil))
	case model.AlertType.USER_PROPERTIES:
		// format matched properties
		var formattedFields string
		for index, addr := range input.MatchedFields {
			formattedFields = formattedFields + fmt.Sprintf("%d. *%s*: `%s`\n", index+1, addr.Name, addr.Value)
		}

		// header
		headerBlock := slack.NewTextBlockObject(slack.MarkdownType, "*User Properties Alert*", false, false)
		headerBlockSet = append(headerBlockSet, slack.NewSectionBlock(headerBlock, nil, nil))

		// body
		var attributeBlocks []*slack.TextBlockObject
		attributeBlocks = append(attributeBlocks, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Matched User Properties*\n%+v", formattedFields), false, false))

		sessionBlock := slack.NewTextBlockObject(slack.MarkdownType, sessionString, false, false)
		bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(sessionBlock, attributeBlocks, nil))
	case model.AlertType.ERROR_FEEDBACK:
		// header
		if identifier == "" {
			identifier = "User"
		}
		headerBlock := slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*%s Left a Crash Report*", identifier), false, false)
		headerBlockSet = append(headerBlockSet, slack.NewSectionBlock(headerBlock, nil, nil))

		// body
		feedbackBlock := slack.NewTextBlockObject(slack.MarkdownType, input.CommentText, false, false)
		sessionBlock := slack.NewTextBlockObject(slack.MarkdownType, sessionString, false, false)

		bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(feedbackBlock, nil, nil))
		bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(sessionBlock, nil, nil))
	case model.AlertType.RAGE_CLICK:
		// header
		if input.RageClicksCount == nil {
			return nil
		}
		headerBlock := slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Rage Clicks Detected:* %d Recent Occurrences\n\n", *input.RageClicksCount), false, false)
		headerBlockSet = append(headerBlockSet, slack.NewSectionBlock(headerBlock, nil, nil))

		// body
		sessionBlock := slack.NewTextBlockObject(slack.MarkdownType, sessionString, false, false)
		bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(sessionBlock, nil, nil))
	case model.AlertType.NEW_SESSION:
		// header
		headerBlock := slack.NewTextBlockObject(slack.MarkdownType, "*New Session Created*", false, false)
		headerBlockSet = append(headerBlockSet, slack.NewSectionBlock(headerBlock, nil, nil))

		// body
		var attributeBlocks []*slack.TextBlockObject
		userPropertiesBlock, accessory := getUserPropertiesBlock(identifier, input.UserProperties)
		attributeBlocks = append(attributeBlocks, userPropertiesBlock...)
		if input.URL != nil {
			attributeBlocks = append(attributeBlocks, slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*Visited URL*\n%s", *input.URL), false, false))
		}

		sessionBlock := slack.NewTextBlockObject(slack.MarkdownType, sessionString, false, false)
		bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(sessionBlock, attributeBlocks, accessory))
	}

	// move body within line attachment
	attachment = &slack.Attachment{
		Color:  attachmentColor,
		Blocks: slack.Blocks{BlockSet: bodyBlockSet},
	}

	var slackClient *slack.Client
	if input.Workspace.SlackAccessToken != nil {
		slackClient = slack.New(*input.Workspace.SlackAccessToken)
	}
	log.WithContext(ctx).Printf("Sending Slack Alert for project: %d session: %s", obj.ProjectID, input.SessionSecureID)

	// send message
	for _, channel := range channels {
		if channel.WebhookChannel != nil {
			slackChannelId := *channel.WebhookChannelID
			slackChannelName := *channel.WebhookChannel

			go func() {
				defer func() {
					if rec := recover(); rec != nil {
						buf := make([]byte, 64<<10)
						buf = buf[:runtime.Stack(buf, false)]
						log.WithContext(ctx).Errorf("panic: %+v\n%s", rec, buf)
					}
				}()
				if slackClient != nil {
					log.WithContext(ctx).WithFields(log.Fields{"session_secure_id": input.SessionSecureID, "project_id": obj.ProjectID}).Infof("Sending Slack Bot Message with preview_text: %s", previewText)
					if strings.Contains(slackChannelName, "#") {
						_, _, _, err := slackClient.JoinConversation(slackChannelId)
						if err != nil {
							log.WithContext(ctx).WithFields(log.Fields{"session_secure_id": input.SessionSecureID, "project_id": obj.ProjectID}).Error(errors.Wrap(err, "failed to join slack channel"))
						}
					}
					_, _, err := slackClient.PostMessage(slackChannelId, slack.MsgOptionText(previewText, false), slack.MsgOptionBlocks(headerBlockSet...), slack.MsgOptionAttachments(*attachment),
						slack.MsgOptionDisableLinkUnfurl(),  /** Disables showing a preview of any links that are in the Slack message.*/
						slack.MsgOptionDisableMediaUnfurl(), /** Disables showing a preview of any links that are in the Slack message.*/
					)
					if err != nil {
						log.WithContext(ctx).WithFields(log.Fields{"workspace_id": input.Workspace.ID, "message": previewText}).
							Error(errors.Wrap(err, "error sending slack msg via bot api"))
						return
					}
				} else {
					log.WithContext(ctx).Error("couldn't send slack alert, slack client isn't setup AND not webhook channel")
					return
				}
			}()
		}
	}
	return nil
}

func GetLogAlertURL(projectId int, query string, startDate time.Time, endDate time.Time) string {
	queryStr := url.QueryEscape(query)
	startDateStr := url.QueryEscape(startDate.Format("2006-01-02T15:04:05.000Z"))
	endDateStr := url.QueryEscape(endDate.Format("2006-01-02T15:04:05.000Z"))
	frontendURL := env.Config.FrontendUri
	return fmt.Sprintf("%s/%d/logs?query=%s&start_date=%s&end_date=%s", frontendURL,
		projectId, queryStr, startDateStr, endDateStr)
}

type SendSlackAlertForLogAlertInput struct {
	Body      string
	Workspace *model.Workspace
	StartDate time.Time
	EndDate   time.Time
}

func SendSlackLogAlert(ctx context.Context, db *gorm.DB, obj *model.LogAlert, input *SendSlackAlertForLogAlertInput) error {
	defer func() {
		db.Create(&model.LogAlertEvent{
			LogAlertID: obj.ID,
			Query:      obj.Query,
			StartDate:  input.StartDate,
			EndDate:    input.EndDate,
			SentAt:     time.Now(),
		})
	}()
	if obj == nil {
		return errors.New("log alert needs to be defined.")
	}
	if input.Workspace == nil {
		return errors.New("workspace needs to be defined.")
	}

	channels, err := obj.GetChannelsToNotify()
	if err != nil {
		return errors.Wrap(err, "error getting channels to send Slack log alert")
	}
	if len(channels) <= 0 {
		return nil
	}

	var slackClient *slack.Client
	if input.Workspace.SlackAccessToken != nil {
		slackClient = slack.New(*input.Workspace.SlackAccessToken)
	}

	alertUrl := GetLogAlertURL(obj.ProjectID, obj.Query, input.StartDate, input.EndDate)

	previewText := fmt.Sprintf("%s fired!", obj.Name)

	var headerBlockSet []slack.Block
	headerBlock := slack.NewTextBlockObject(slack.MarkdownType, fmt.Sprintf("*%s* fired!", obj.Name), false, false)
	headerBlockSet = append(headerBlockSet, slack.NewSectionBlock(headerBlock, nil, nil))

	var bodyBlockSet []slack.Block
	logBlock := slack.NewTextBlockObject(slack.MarkdownType, input.Body, false, false)

	var actionBlocks []slack.BlockElement
	button := slack.NewButtonBlockElement(
		"",
		"click",
		slack.NewTextBlockObject(
			slack.PlainTextType,
			"View Logs",
			false,
			false,
		),
	)
	button.URL = alertUrl
	actionBlocks = append(actionBlocks, button)

	bodyBlockSet = append(bodyBlockSet, slack.NewSectionBlock(logBlock, nil, nil))
	bodyBlockSet = append(bodyBlockSet, slack.NewActionBlock("", actionBlocks...))

	attachment := &slack.Attachment{
		Color:  RED_ALERT,
		Blocks: slack.Blocks{BlockSet: bodyBlockSet},
	}

	log.WithContext(ctx).Info("Sending Slack Alert for Log Alert")

	// send message
	for _, channel := range channels {
		if channel.WebhookChannel != nil {
			slackChannelId := *channel.WebhookChannelID
			slackChannelName := *channel.WebhookChannel

			// The Highlight Slack bot needs to join the channel before it can send a message.
			// Slack handles a bot trying to join a channel it already is a part of, we don't need to handle it.
			if slackClient != nil {
				if strings.Contains(slackChannelName, "#") {
					_, _, _, err := slackClient.JoinConversation(slackChannelId)
					if err != nil {
						log.WithContext(ctx).WithFields(log.Fields{"project_id": obj.ProjectID}).Error(errors.Wrap(err, "failed to join slack channel while sending welcome message"))
					}
				}
				_, _, err := slackClient.PostMessage(slackChannelId, slack.MsgOptionText(previewText, false), slack.MsgOptionBlocks(headerBlockSet...), slack.MsgOptionAttachments(*attachment),
					slack.MsgOptionDisableLinkUnfurl(),  /** Disables showing a preview of any links that are in the Slack message.*/
					slack.MsgOptionDisableMediaUnfurl(), /** Disables showing a preview of any links that are in the Slack message.*/
				)
				if err != nil {
					log.WithContext(ctx).WithFields(log.Fields{"workspace_id": input.Workspace.ID, "message": previewText}).
						Error(errors.Wrap(err, "error sending slack msg via bot api for welcome message"))
				}

			} else {
				log.WithContext(ctx).Printf("Slack Bot Client was not defined for sending welcome message")
			}
		}
	}

	return nil
}

type SendSlackAlertForMetricMonitorInput struct {
	Message   string
	Workspace *model.Workspace
}

func SendSlackMetricMonitorAlert(ctx context.Context, obj *model.MetricMonitor, input *SendSlackAlertForMetricMonitorInput) error {
	if obj == nil {
		return errors.New("metric monitor needs to be defined.")
	}
	if input.Workspace == nil {
		return errors.New("workspace needs to be defined.")
	}

	channels, err := obj.GetChannelsToNotify()
	if err != nil {
		return errors.Wrap(err, "error getting channels to send MetricMonitor Slack Alert")
	}
	if len(channels) <= 0 {
		return nil
	}

	var slackClient *slack.Client
	if input.Workspace.SlackAccessToken != nil {
		slackClient = slack.New(*input.Workspace.SlackAccessToken)
	}

	frontendURL := env.Config.FrontendUri
	alertUrl := fmt.Sprintf("%s/%d/alerts/monitor/%d", frontendURL, obj.ProjectID, obj.ID)

	log.WithContext(ctx).Info("Sending Slack Alert for Metric Monitor")

	// send message
	for _, channel := range channels {
		if channel.WebhookChannel != nil {
			message := fmt.Sprintf("%s\n<%s|View Monitor>", input.Message, alertUrl)
			slackChannelId := *channel.WebhookChannelID
			slackChannelName := *channel.WebhookChannel

			// The Highlight Slack bot needs to join the channel before it can send a message.
			// Slack handles a bot trying to join a channel it already is a part of, we don't need to handle it.
			if slackClient != nil {
				if strings.Contains(slackChannelName, "#") {
					_, _, _, err := slackClient.JoinConversation(slackChannelId)
					if err != nil {
						log.WithContext(ctx).WithFields(log.Fields{"project_id": obj.ProjectID}).Error(errors.Wrap(err, "failed to join slack channel while sending welcome message"))
					}
				}
				_, _, err := slackClient.PostMessage(slackChannelId, slack.MsgOptionText(message, false),
					slack.MsgOptionDisableLinkUnfurl(),  /** Disables showing a preview of any links that are in the Slack message.*/
					slack.MsgOptionDisableMediaUnfurl(), /** Disables showing a preview of any links that are in the Slack message.*/
				)
				if err != nil {
					log.WithContext(ctx).WithFields(log.Fields{"workspace_id": input.Workspace.ID, "message": fmt.Sprintf("%+v", message)}).
						Error(errors.Wrap(err, "error sending slack msg via bot api for welcome message"))
				}

			} else {
				log.WithContext(ctx).Printf("Slack Bot Client was not defined for sending welcome message")
			}
		}
	}

	return nil
}
