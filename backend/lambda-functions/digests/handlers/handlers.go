package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"time"

	"golang.org/x/text/language"
	"golang.org/x/text/message"

	log "github.com/sirupsen/logrus"

	"gorm.io/gorm"

	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"

	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/lambda-functions/digests/utils"
	"github.com/highlight-run/highlight/backend/model"
)

type Handlers interface {
	GetProjectIds(context.Context, utils.DigestsInput) ([]utils.ProjectIdResponse, error)
	GetDigestData(context.Context, utils.ProjectIdResponse) (*utils.DigestDataResponse, error)
	SendDigestEmails(context.Context, utils.DigestDataResponse) error
}

type handlers struct {
	db             *gorm.DB
	sendgridClient *sendgrid.Client
}

func InitHandlers(db *gorm.DB, sendgridClient *sendgrid.Client) *handlers {
	return &handlers{
		db:             db,
		sendgridClient: sendgridClient,
	}
}

func NewHandlers() *handlers {
	ctx := context.TODO()
	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error setting up DB"))
	}

	sendgridClient := sendgrid.NewSendClient(env.Config.SendgridKey)

	return InitHandlers(db, sendgridClient)
}

func (h *handlers) GetProjectIds(ctx context.Context, input utils.DigestsInput) ([]utils.ProjectIdResponse, error) {
	weekday := input.AsOf.Weekday()
	end := input.AsOf.AddDate(0, 0, -int(weekday-time.Monday))
	end = time.Date(end.Year(), end.Month(), end.Day(), 0, 0, 0, 0, time.UTC)
	start := end.AddDate(0, 0, -7)
	prior := start.AddDate(0, 0, -7)

	var projectIds []int
	if err := h.db.Raw(`
		SELECT project_id
		FROM daily_session_counts_view
		WHERE date >= ?
		AND date < ?
		GROUP BY 1
		HAVING sum(count) >= 50
	`, start, end).Scan(&projectIds).Error; err != nil {
		return nil, errors.Wrap(err, "error getting project ids")
	}

	response := []utils.ProjectIdResponse{}
	for _, id := range projectIds {
		response = append(response, utils.ProjectIdResponse{
			ProjectId: id,
			DryRun:    input.DryRun,
			End:       end,
			Start:     start,
			Prior:     prior,
		})
	}

	return response, nil
}

func (h *handlers) GetDigestData(ctx context.Context, input utils.ProjectIdResponse) (*utils.DigestDataResponse, error) {
	var projectName string
	if err := h.db.Raw(`
		SELECT name
		FROM projects p
		WHERE p.id = ?
	`, input.ProjectId).Scan(&projectName).Error; err != nil {
		return nil, errors.Wrap(err, "error querying project name")
	}

	var curUsers int
	if err := h.db.Raw(`
		SELECT count(distinct coalesce(nullif(s.identifier, ''), s.client_id)) 
		FROM sessions s
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
		AND s.processed
	`, input.ProjectId, input.Start, input.End).Scan(&curUsers).Error; err != nil {
		return nil, errors.Wrap(err, "error querying current user count")
	}

	var prevUsers int
	if err := h.db.Raw(`
		SELECT count(distinct coalesce(nullif(s.identifier, ''), s.client_id)) 
		FROM sessions s
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
		AND s.processed
	`, input.ProjectId, input.Prior, input.Start).Scan(&prevUsers).Error; err != nil {
		return nil, errors.Wrap(err, "error querying previous user count")
	}

	var curSessions int
	if err := h.db.Raw(`
		SELECT count(*) 
		FROM sessions s
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
		AND s.processed
	`, input.ProjectId, input.Start, input.End).Scan(&curSessions).Error; err != nil {
		return nil, errors.Wrap(err, "error querying current session count")
	}

	var prevSessions int
	if err := h.db.Raw(`
		SELECT count(*) 
		FROM sessions s
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
		AND s.processed
	`, input.ProjectId, input.Prior, input.Start).Scan(&prevSessions).Error; err != nil {
		return nil, errors.Wrap(err, "error querying previous session count")
	}

	var curErrors int
	if err := h.db.Raw(`
		SELECT count(*) 
		FROM error_objects eo
		INNER JOIN error_groups eg
		ON eo.error_group_id = eg.id
		WHERE eo.project_id = ?
		AND eo.created_at >= ?
		AND eo.created_at < ?
		AND eg.state <> 'IGNORED'
	`, input.ProjectId, input.Start, input.End).Scan(&curErrors).Error; err != nil {
		return nil, errors.Wrap(err, "error querying current error count")
	}

	var prevErrors int
	if err := h.db.Raw(`
		SELECT count(*) 
		FROM error_objects eo
		INNER JOIN error_groups eg
		ON eo.error_group_id = eg.id
		WHERE eo.project_id = ?
		AND eo.created_at >= ?
		AND eo.created_at < ?
		AND eg.state <> 'IGNORED'
	`, input.ProjectId, input.Prior, input.Start).Scan(&prevErrors).Error; err != nil {
		return nil, errors.Wrap(err, "error querying previous error count")
	}

	var curActivity float64
	if err := h.db.Raw(`
		SELECT coalesce(avg(s.active_length), 0)
		FROM sessions s
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
		AND s.processed
	`, input.ProjectId, input.Start, input.End).Scan(&curActivity).Error; err != nil {
		return nil, errors.Wrap(err, "error querying current activity")
	}

	var prevActivity float64
	if err := h.db.Raw(`
		SELECT coalesce(avg(s.active_length), 0)
		FROM sessions s
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
		AND s.processed
	`, input.ProjectId, input.Prior, input.Start).Scan(&prevActivity).Error; err != nil {
		return nil, errors.Wrap(err, "error querying previous activity")
	}

	var activeSessionsSql []utils.ActiveSessionSql
	if err := h.db.Raw(`
		SELECT s.identifier, s.user_properties, s.fingerprint, s.city, s.state, s.country, s.active_length, s.secure_id
		FROM sessions s
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
		AND s.processed
		ORDER BY s.active_length desc
		LIMIT 5
	`, input.ProjectId, input.Start, input.End).Scan(&activeSessionsSql).Error; err != nil {
		return nil, errors.Wrap(err, "error querying active sessions")
	}

	activeSessions := []utils.ActiveSession{}
	for _, item := range activeSessionsSql {
		activeSessions = append(activeSessions, utils.ActiveSession{
			Identifier:   truncate100(getIdentifier(item.UserProperties, item.Identifier, item.Fingerprint)),
			Location:     getLocation(item.Country),
			ActiveLength: formatDurationMinute(item.ActiveLength * time.Millisecond),
			URL:          formatSessionURL(input.ProjectId, item.SecureId),
		})
	}

	var errorSessionsSql []utils.ErrorSessionSql
	if err := h.db.Raw(`
		SELECT s.identifier, s.user_properties, s.fingerprint, count(*) as error_count, s.active_length, s.secure_id
		FROM sessions s
		INNER JOIN error_objects eo
		ON s.id = eo.session_id
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
		AND s.processed
		GROUP BY s.id
		ORDER BY count(*) desc
		LIMIT 5
	`, input.ProjectId, input.Start, input.End).Scan(&errorSessionsSql).Error; err != nil {
		return nil, errors.Wrap(err, "error querying error sessions")
	}

	errorSessions := []utils.ErrorSession{}
	for _, item := range errorSessionsSql {
		errorSessions = append(errorSessions, utils.ErrorSession{
			Identifier:   truncate100(getIdentifier(item.UserProperties, item.Identifier, item.Fingerprint)),
			ErrorCount:   formatNumber(item.ErrorCount),
			ActiveLength: formatDurationMinute(item.ActiveLength * time.Millisecond),
			URL:          formatSessionURL(input.ProjectId, item.SecureId),
		})
	}

	var newErrorsSql []utils.NewErrorSql
	if err := h.db.Raw(`
		SELECT eg.event as message, count(distinct coalesce(s.identifier, s.client_id)) as affected_user_count, eg.secure_id
		FROM sessions s
		INNER JOIN error_objects eo
		ON s.id = eo.session_id
		INNER JOIN error_groups eg
		ON eg.id = eo.error_group_id
		WHERE eg.project_id = ?
		AND eg.created_at >= ?
		AND eg.created_at < ?
		AND eg.state <> 'IGNORED'
		GROUP BY eg.id
		ORDER BY count(distinct coalesce(s.identifier, s.client_id)) desc
		LIMIT 5
	`, input.ProjectId, input.Start, input.End).Scan(&newErrorsSql).Error; err != nil {
		return nil, errors.Wrap(err, "error querying new errors")
	}

	newErrors := []utils.NewError{}
	for _, item := range newErrorsSql {
		newErrors = append(newErrors, utils.NewError{
			Message:           truncate100(unwrapErrorMessage(item.Message)),
			AffectedUserCount: formatNumber(item.AffectedUserCount),
			URL:               formatErrorURL(input.ProjectId, item.SecureId),
		})
	}

	var frequentErrorsSql []utils.FrequentErrorSql
	if err := h.db.Raw(`
		SELECT eg.event as message, sum(case when eo.created_at >= ? then 1 else 0 end) as count, sum(case when eo.created_at < ? then 1 else 0 end) as prior_count, eg.secure_id
		FROM error_objects eo
		INNER JOIN error_groups eg
		ON eg.id = eo.error_group_id
		WHERE eg.project_id = ?
		AND eo.created_at >= ?
		AND eo.created_at < ?
		AND eg.state <> 'IGNORED'
		GROUP BY eg.id
		ORDER BY sum(case when eo.created_at >= ? then 1 else 0 end) desc
		LIMIT 5
	`, input.Start, input.Start, input.ProjectId, input.Prior, input.End, input.Start).Scan(&frequentErrorsSql).Error; err != nil {
		return nil, errors.Wrap(err, "error querying frequent errors")
	}

	frequentErrors := []utils.FrequentError{}
	for _, item := range frequentErrorsSql {
		frequentErrors = append(frequentErrors, utils.FrequentError{
			Message: truncate100(unwrapErrorMessage(item.Message)),
			Count:   formatNumber(item.Count),
			Delta:   formatDelta(item.Count - item.PriorCount),
			URL:     formatErrorURL(input.ProjectId, item.SecureId),
		})
	}

	return &utils.DigestDataResponse{
		ProjectId:      input.ProjectId,
		StartFmt:       input.Start.Format("01/02"),
		EndFmt:         input.End.Format("01/02"),
		ProjectName:    projectName,
		UserCount:      formatNumber(curUsers),
		UserDelta:      formatDelta(curUsers - prevUsers),
		SessionCount:   formatNumber(curSessions),
		SessionDelta:   formatDelta(curSessions - prevSessions),
		ErrorCount:     formatNumber(curErrors),
		ErrorDelta:     formatDelta(curErrors - prevErrors),
		ActivityTotal:  formatDurationSecond(time.Duration(curActivity) * time.Millisecond),
		ActivityDelta:  formatDurationDelta(time.Duration(curActivity-prevActivity) * time.Millisecond),
		ActiveSessions: activeSessions,
		ErrorSessions:  errorSessions,
		NewErrors:      newErrors,
		FrequentErrors: frequentErrors,
		DryRun:         input.DryRun,
	}, nil
}

func formatNumber(input int) string {
	p := message.NewPrinter(language.English)
	return p.Sprintf("%d", input)
}

func formatDelta(input int) string {
	if input == 0 {
		return "-"
	}
	prefix := ""
	if input > 0 {
		prefix = "+"
	}
	return prefix + formatNumber(input)
}

func formatDurationSecond(input time.Duration) string {
	return input.Round(time.Second).String()
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

func formatDurationDelta(input time.Duration) string {
	prefix := ""
	if input > 0 {
		prefix = "+"
	}
	return prefix + formatDurationSecond(input)
}

func formatSessionURL(projectId int, secureId string) string {
	return fmt.Sprintf("https://app.highlight.io/%d/sessions/%s", projectId, secureId)
}

func formatErrorURL(projectId int, secureId string) string {
	return fmt.Sprintf("https://app.highlight.io/%d/errors/%s", projectId, secureId)
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

// Truncate strings after 100 characters
func truncate100(input string) string {
	count := 100
	if len(input) < count {
		count = len(input)
	}
	return input[0:count]
}

// Error message may be a JSON string or array. Try to unwrap it.
func unwrapErrorMessage(message string) string {
	if message == "" {
		return message
	}

	if message[0] == '[' {
		var wrapper struct {
			Data []string
		}
		var val []byte = []byte(fmt.Sprintf(`{"data":%s}`, message))
		err := json.Unmarshal(val, &wrapper)
		if err != nil || len(wrapper.Data) == 0 {
			return message
		}
		return unwrapErrorMessage(wrapper.Data[0])
	} else {
		var wrapper struct {
			Data string
		}
		var val []byte = []byte(fmt.Sprintf(`{"data":%s}`, message))
		err := json.Unmarshal(val, &wrapper)
		if err != nil || wrapper.Data == "" {
			return message
		}
		return unwrapErrorMessage(wrapper.Data)
	}
}

func (h *handlers) SendDigestEmails(ctx context.Context, input utils.DigestDataResponse) error {
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
			AND eoo.category IN ('All', 'Digests')
		)
		AND (
			wa.project_ids IS NULL 
			OR p.id = ANY(wa.project_ids))
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

	for _, toAddr := range toAddrs {
		to := &mail.Email{Address: toAddr.Email}

		m := mail.NewV3Mail()
		from := mail.NewEmail("Highlight", email.SendGridOutboundEmail)
		m.SetFrom(from)
		m.SetTemplateID(email.DigestEmailTemplateID)

		p := mail.NewPersonalization()
		p.AddTos(to)
		curData := map[string]interface{}{}
		for k, v := range templateData {
			curData[k] = v
		}
		curData["toEmail"] = toAddr.Email
		curData["unsubscribeUrl"] = email.GetSubscriptionUrl(toAddr.AdminID, false)

		p.DynamicTemplateData = curData

		m.AddPersonalizations(p)

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
