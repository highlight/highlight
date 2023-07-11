package handlers

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/lambda"
	"github.com/highlight-run/highlight/backend/lambda-functions/sessionInsights/utils"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"gorm.io/gorm"
)

type Handlers interface {
	GetSessionInsightsData(context.Context, utils.ProjectIdResponse) (*utils.SessionInsightsData, error)
	SendSessionInsightsEmails(context.Context, utils.SessionInsightsData) error
}

type handlers struct {
	db             *gorm.DB
	sendgridClient *sendgrid.Client
	lambdaClient   *lambda.Client
}

func InitHandlers(db *gorm.DB, sendgridClient *sendgrid.Client, lambdaClient *lambda.Client) *handlers {
	return &handlers{
		db:             db,
		sendgridClient: sendgridClient,
		lambdaClient:   lambdaClient,
	}
}

func NewHandlers() *handlers {
	ctx := context.TODO()
	db, err := model.SetupDB(ctx, os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error setting up DB"))
	}

	sendgridClient := sendgrid.NewSendClient(os.Getenv("SENDGRID_API_KEY"))

	lambdaClient, err := lambda.NewLambdaClient()
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error initializing Lambda client"))
	}

	return InitHandlers(db, sendgridClient, lambdaClient)
}

func (h *handlers) GetSessionInsightsData(ctx context.Context, input utils.ProjectIdResponse) (*utils.SessionInsightsData, error) {
	var result struct {
		projectName string
		aiInsights  bool
	}
	if err := h.db.Raw(`
		SELECT p.name as project_name, coalesce(ws.ai_insights, false) as ai_insights
		FROM projects p
		LEFT OUTER JOIN all_workspace_settings ws
		ON p.workspace_id = ws.workspace_id
		WHERE p.id = ?
	`, input.ProjectId).Scan(&result).Error; err != nil {
		return nil, errors.Wrap(err, "error querying project name")
	}

	var interestingSessionsSql []utils.InterestingSessionSql
	if err := h.db.Raw(`
		SELECT s.identifier, s.user_properties, s.fingerprint, s.country, s.active_length, s.secure_id, s.id
		FROM sessions s
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
		AND s.processed
		AND s.within_billing_quota
		ORDER BY s.normalness
		LIMIT 3
	`, input.ProjectId, input.Start, input.End).Scan(&interestingSessionsSql).Error; err != nil {
		return nil, errors.Wrap(err, "error querying interesting sessions")
	}

	interestingSessions := []utils.InterestingSession{}
	for _, item := range interestingSessionsSql {
		insightStrs := []string{}
		if result.aiInsights {
			insights := struct {
				Insight []struct {
					Insight string `json:"insight"`
				} `json:"insight"`
			}{}

			res, err := h.lambdaClient.GetSessionInsight(ctx, input.ProjectId, item.Id)
			if err == nil && res.StatusCode == 200 {
				b, err := io.ReadAll(res.Body)
				if err == nil && json.Unmarshal(b, &insights) == nil {
					for _, i := range insights.Insight {
						insightStrs = append(insightStrs, i.Insight)
					}
				}
			}
		}

		interestingSessions = append(interestingSessions, utils.InterestingSession{
			Identifier:   truncate100(getIdentifier(item.UserProperties, item.Identifier, item.Fingerprint)),
			AvatarUrl:    getAvatarUrl(item.UserProperties),
			Country:      getLocation(item.Country),
			ActiveLength: formatDurationMinute(item.ActiveLength * time.Millisecond),
			URL:          formatSessionURL(input.ProjectId, item.SecureId),
			Id:           item.Id,
			Chunk:        0, // ZANETODO: get chunk / ts for interesting sessions
			Ts:           0, // ZANETODO: get chunk / ts for interesting sessions
			Insights:     insightStrs,
		})
	}

	return &utils.SessionInsightsData{
		ProjectId:           input.ProjectId,
		StartFmt:            input.Start.Format("01/02"),
		EndFmt:              input.End.Format("01/02"),
		ProjectName:         result.projectName,
		UseHarold:           result.aiInsights,
		InterestingSessions: interestingSessions,
		DryRun:              input.DryRun,
	}, nil
}

func formatDurationMinute(input time.Duration) string {
	res := input.Round(time.Minute).String()
	if len(res) >= 2 {
		res = res[:len(res)-2]
	}
	if res == "" {
		return "<1m"
	}
	return res
}

func formatSessionURL(projectId int, secureId string) string {
	return fmt.Sprintf("https://app.highlight.io/%d/sessions/%s", projectId, secureId)
}

func getLocation(country string) string {
	if country == "" {
		return "-"
	}
	return country
}

func getIdentifier(userProperties string, identifier string, fingerprint string) string {
	var properties struct {
		HighlightDisplayName string
		Email                string
	}
	// Unmarshal may throw an error if userProperties is not formatted correctly, but that's ok.
	_ = json.Unmarshal([]byte(userProperties), &properties)
	if properties.HighlightDisplayName != "" {
		return properties.HighlightDisplayName
	}
	if properties.Email != "" {
		return properties.Email
	}
	if identifier != "" {
		return identifier
	}
	if fingerprint != "" {
		return "#" + fingerprint
	}
	return "unidentified"
}

func getAvatarUrl(userProperties string) string {
	var properties struct {
		Avatar string
	}
	// Unmarshal may throw an error if userProperties is not formatted correctly, but that's ok.
	_ = json.Unmarshal([]byte(userProperties), &properties)
	return properties.Avatar
}

// Truncate strings after 100 characters
func truncate100(input string) string {
	count := 100
	if len(input) < count {
		count = len(input)
	}
	return input[0:count]
}

func (h *handlers) SendSessionInsightsEmails(ctx context.Context, input utils.SessionInsightsData) error {
	var toAddrs []struct {
		AdminID int
		Email   string
	}
	if err := h.db.Raw(`
		SELECT a.id as admin_id, a.email
		FROM projects p
		INNER JOIN workspace_admins wa
		ON wa.workspace_id = p.workspace_id
		INNER JOIN admins a
		ON wa.admin_id = a.id
		WHERE p.id = ?
		AND NOT EXISTS (
			SELECT *
			FROM email_opt_outs eoo
			WHERE eoo.admin_id = a.id
			AND eoo.category IN ('All', 'Digests', 'SessionDigests')
		)
	`, input.ProjectId).Scan(&toAddrs).Error; err != nil {
		return errors.Wrap(err, "error querying recipient emails")
	}

	marshalled, err := json.Marshal(input)
	if err != nil {
		return errors.Wrap(err, "error marshalling input")
	}
	var templateData map[string]interface{}
	if err := json.Unmarshal(marshalled, &templateData); err != nil {
		return errors.Wrap(err, "error unmarshalling marshalled input")
	}

	if input.DryRun {
		toAddrs = []struct {
			AdminID int
			Email   string
		}{{AdminID: 5141, Email: "zane@highlight.io"}}
	}

	images := map[int]string{}
	for _, session := range input.InterestingSessions {
		res, err := h.lambdaClient.GetSessionScreenshot(ctx, input.ProjectId, session.Id, session.Ts, session.Chunk)
		if err == nil {
			return err
		}
		if res.StatusCode != 200 {
			return errors.New(fmt.Sprintf("screenshot lambda returned %d", res.StatusCode))
		}
		imageBytes, err := io.ReadAll(res.Body)
		if err != nil {
			return err
		}
		images[session.Id] = base64.StdEncoding.EncodeToString(imageBytes)
	}

	for _, toAddr := range toAddrs {
		toEmail := toAddr.Email
		unsubscribeUrl := email.GetSubscriptionUrl(toAddr.AdminID, false)
		html, err := h.lambdaClient.GetSessionInsightEmailHtml(ctx, toEmail, unsubscribeUrl, input)
		if err != nil {
			return err
		}

		from := mail.NewEmail("Highlight", email.SendGridOutboundEmail)
		to := &mail.Email{Address: toAddr.Email}
		m := mail.NewV3MailInit(from, "Subject", to, mail.NewContent("text/html", html))
		m.SetFrom(from)

		for sessionId, img := range images {
			a := mail.NewAttachment()
			a.SetContent(img)
			a.SetType("image/png")
			a.SetFilename(fmt.Sprintf("session-image-%d.png", sessionId))
			a.SetDisposition("inline")
			a.SetContentID(fmt.Sprintf("session%d", sessionId))
			m.AddAttachment(a)
		}

		if resp, sendGridErr := h.sendgridClient.Send(m); sendGridErr != nil || resp.StatusCode >= 300 {
			estr := "error sending sendgrid email -> "
			estr += fmt.Sprintf("resp-code: %v; ", resp)
			if sendGridErr != nil {
				estr += fmt.Sprintf("err: %v", sendGridErr.Error())
			}
			return errors.New(estr)
		}
	}

	return nil
}
