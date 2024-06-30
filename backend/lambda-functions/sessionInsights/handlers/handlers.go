package handlers

import (
	"bufio"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"image/png"
	"io"
	"strconv"
	"time"

	"github.com/disintegration/imaging"
	"github.com/openlyinc/pointy"
	log "github.com/sirupsen/logrus"

	"gorm.io/gorm"

	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"

	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/lambda"
	"github.com/highlight-run/highlight/backend/lambda-functions/sessionInsights/utils"
	"github.com/highlight-run/highlight/backend/model"
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
	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error setting up DB"))
	}

	sendgridClient := sendgrid.NewSendClient(env.Config.SendgridKey)

	lambdaClient, err := lambda.NewLambdaClient()
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error initializing Lambda client"))
	}

	return InitHandlers(db, sendgridClient, lambdaClient)
}

func (h *handlers) GetSessionInsightsData(ctx context.Context, input utils.ProjectIdResponse) (*utils.SessionInsightsData, error) {
	var result struct {
		ProjectName string
		AiInsights  bool
	}
	if err := h.db.Raw(`
		SELECT p.name as project_name, coalesce(ws.ai_insights, false) as ai_insights
		FROM projects p
		LEFT OUTER JOIN all_workspace_settings ws
		ON p.workspace_id = ws.workspace_id
		WHERE p.id = ?
	`, input.ProjectId).Scan(&result).Error; err != nil {
		return nil, errors.Wrap(err, "error querying project info")
	}

	var interestingSessionsSql []utils.InterestingSessionSql
	if err := h.db.Raw(`
		SELECT a.*, (
			SELECT FLOOR(AVG(chunk_index)) 
			AS chunk_index 
			FROM event_chunks 
			WHERE session_id = a.id)
		FROM
		(SELECT s.identifier, s.user_properties, s.fingerprint, s.country, s.active_length, s.secure_id, s.id, s.event_counts
		FROM sessions s
		WHERE s.id in
			(SELECT DISTINCT ON (s.fingerprint) s.id
			FROM sessions s
			WHERE s.project_id = ?
			AND s.created_at >= ?
			AND s.created_at < ?
			AND NOT s.excluded
			AND s.processed
			AND s.within_billing_quota
			AND s.normalness IS NOT NULL
			AND s.normalness > 0
			ORDER BY s.fingerprint, s.normalness)
		ORDER BY s.normalness
		LIMIT 3) a
	`, input.ProjectId, input.Start, input.End).Scan(&interestingSessionsSql).Error; err != nil {
		return nil, errors.Wrap(err, "error querying interesting sessions")
	}

	interestingSessions := []utils.InterestingSession{}
	if len(interestingSessionsSql) != 3 {
		return nil, errors.New(fmt.Sprintf("expected 3 interesting sessions, returned %d", len(interestingSessionsSql)))
	}

	for _, item := range interestingSessionsSql {
		insightStrs := []string{}
		if result.AiInsights {
			type insightType struct {
				Insight string `json:"insight"`
			}
			var insight insightType
			var insights []insightType

			res, err := h.lambdaClient.GetSessionInsight(ctx, input.ProjectId, item.Id)
			if err != nil {
				return nil, err
			}
			if res.StatusCode != 200 {
				return nil, errors.New(fmt.Sprintf("session insight lambda returned %d", res.StatusCode))
			}

			b, err := io.ReadAll(res.Body)
			if err != nil {
				return nil, err
			}
			if err := json.Unmarshal(b, &insight); err != nil {
				return nil, err
			}
			if err := json.Unmarshal([]byte(insight.Insight), &insights); err != nil {
				return nil, err
			}
			for _, i := range insights {
				insightStrs = append(insightStrs, i.Insight)
			}
		}

		interestingSessions = append(interestingSessions, utils.InterestingSession{
			Identifier:   truncate100(getIdentifier(item.UserProperties, item.Identifier, item.Fingerprint)),
			AvatarUrl:    getAvatarUrl(item.UserProperties),
			Country:      getLocation(item.Country),
			ActiveLength: formatDurationMinute(item.ActiveLength * time.Millisecond),
			Url:          formatSessionURL(input.ProjectId, item.SecureId),
			Id:           item.Id,
			Insights:     insightStrs,
			ChunkIndex:   item.ChunkIndex,
			EventCounts:  item.EventCounts,
		})
	}

	return &utils.SessionInsightsData{
		ProjectId:           input.ProjectId,
		StartFmt:            input.Start.Format("01/02"),
		EndFmt:              input.End.Format("01/02"),
		ProjectName:         result.ProjectName,
		UseHarold:           result.AiInsights,
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
		AND (
			wa.project_ids IS NULL 
			OR p.id = ANY(wa.project_ids))
	`, input.ProjectId).Scan(&toAddrs).Error; err != nil {
		return errors.Wrap(err, "error querying recipient emails")
	}

	if input.DryRun {
		fmt.Printf("%#v\n", toAddrs)
		toAddrs = []struct {
			AdminID int
			Email   string
		}{{AdminID: 5141, Email: "zane@highlight.io"}}
	}

	images := map[string]string{}
	for idx, session := range input.InterestingSessions {
		img, err := h.lambdaClient.GetSessionScreenshot(ctx, input.ProjectId, session.Id, pointy.Int(1000000), pointy.Int(session.ChunkIndex), nil)
		if err != nil {
			return err
		}

		// Resize the image to 2x what's shown in the email,
		// preserving aspect ratio and cropping centered at the top
		src, _ := png.Decode(bytes.NewReader(img.Image))
		dstImageFill := imaging.Fill(src, 852, 465, imaging.Top, imaging.Lanczos)
		var b bytes.Buffer
		output := bufio.NewWriter(&b)
		if err := png.Encode(output, dstImageFill); err != nil {
			return err
		}

		images["session"+strconv.Itoa(session.Id)] = base64.StdEncoding.EncodeToString(b.Bytes())
		input.InterestingSessions[idx].ScreenshotUrl = fmt.Sprintf("cid:session%d", session.Id)

		res, err := h.lambdaClient.GetActivityGraph(ctx, session.EventCounts)
		if err != nil {
			return err
		}
		if res.StatusCode != 200 {
			return errors.New(fmt.Sprintf("activity graph lambda returned %d", res.StatusCode))
		}
		imageBytes, err := io.ReadAll(res.Body)
		if err != nil {
			return err
		}
		images["activity"+strconv.Itoa(session.Id)] = base64.StdEncoding.EncodeToString(imageBytes)
		input.InterestingSessions[idx].ActivityGraphUrl = fmt.Sprintf("cid:activity%d", session.Id)
	}

	for _, toAddr := range toAddrs {
		toEmail := toAddr.Email
		unsubscribeUrl := email.GetSubscriptionUrl(toAddr.AdminID, false)

		log.WithContext(ctx).Infof("generating email for %s", toEmail)
		html, err := h.lambdaClient.GetSessionInsightEmailHtml(ctx, toEmail, unsubscribeUrl, input)
		if err != nil {
			return err
		}
		log.WithContext(ctx).Infof("generated email for %s", toEmail)

		from := mail.NewEmail("Highlight", email.SendGridOutboundEmail)
		to := &mail.Email{Address: toAddr.Email}
		subject := fmt.Sprintf("[Highlight] Session Insights - %s", input.ProjectName)
		m := mail.NewV3MailInit(from, subject, to, mail.NewContent("text/html", html))
		m.AddCategories("session-insights")

		for imageId, img := range images {
			log.WithContext(ctx).Infof("attaching image %s", imageId)
			a := mail.NewAttachment()
			a.SetContent(img)
			a.SetType("image/png")
			a.SetFilename(fmt.Sprintf("%s.png", imageId))
			a.SetDisposition("inline")
			a.SetContentID(imageId)
			m.AddAttachment(a)
		}

		log.WithContext(ctx).Infof("sending email to %s", toEmail)
		if resp, sendGridErr := h.sendgridClient.Send(m); sendGridErr != nil || resp.StatusCode >= 300 {
			estr := "error sending sendgrid email -> "
			estr += fmt.Sprintf("resp-code: %v; ", resp)
			if sendGridErr != nil {
				estr += fmt.Sprintf("err: %v", sendGridErr.Error())
			}
			return errors.New(estr)
		}
		log.WithContext(ctx).Info("sent")
	}

	return nil
}
