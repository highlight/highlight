package handlers

import (
	"context"
	"os"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/lambda-functions/digests/utils"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	"gorm.io/gorm"
)

type Handlers interface {
	GetProjectIds(context.Context, utils.DigestsInput) ([]utils.ProjectIdResponse, error)
	GetDigestData(context.Context, utils.ProjectIdResponse) (*utils.DigestDataResponse, error)
	SendDigestEmail(context.Context, utils.DigestDataResponse) error
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
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.Fatal(errors.Wrap(err, "error setting up DB"))
	}

	sendgridClient := sendgrid.NewSendClient(os.Getenv("SENDGRID_API_KEY"))

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
		SELECT p.id
		FROM projects p
		WHERE EXISTS (
			SELECT 1
			FROM sessions s
			WHERE p.id = s.project_id
			AND s.created_at >= ?
			AND s.created_at < ?
		)
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
	var curUsers int
	if err := h.db.Raw(`
		SELECT count(distinct coalesce(s.identifier, s.client_id)) 
		FROM sessions s
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
	`, input.ProjectId, input.Start, input.End).Scan(&curUsers).Error; err != nil {
		return nil, errors.Wrap(err, "error querying current user count")
	}

	var prevUsers int
	if err := h.db.Raw(`
		SELECT count(distinct coalesce(s.identifier, s.client_id)) 
		FROM sessions s
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
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

	var curActivity int64
	if err := h.db.Raw(`
		SELECT sum(coalesce(s.active_length, 0))
		FROM sessions s
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
	`, input.ProjectId, input.Start, input.End).Scan(&curActivity).Error; err != nil {
		return nil, errors.Wrap(err, "error querying current activity")
	}

	var prevActivity int64
	if err := h.db.Raw(`
		SELECT sum(coalesce(s.active_length, 0))
		FROM sessions s
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
	`, input.ProjectId, input.Prior, input.Start).Scan(&prevActivity).Error; err != nil {
		return nil, errors.Wrap(err, "error querying previous activity")
	}

	var activeSessions []utils.ActiveSession
	if err := h.db.Raw(`
		SELECT s.identifier, s.city, s.state, s.country, s.active_length, s.secure_id
		FROM sessions s
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
		ORDER BY s.active_length desc
		LIMIT 5
	`, input.ProjectId, input.Start, input.End).Scan(&activeSessions).Error; err != nil {
		return nil, errors.Wrap(err, "error querying active sessions")
	}

	var errorSessions []utils.ErrorSession
	if err := h.db.Raw(`
		SELECT s.identifier, count(*) as error_count, s.active_length, s.secure_id
		FROM sessions s
		INNER JOIN error_objects eo
		ON s.id = eo.session_id
		WHERE s.project_id = ?
		AND s.created_at >= ?
		AND s.created_at < ?
		AND NOT s.excluded
		GROUP BY s.id
		ORDER BY count(*) desc
		LIMIT 5
	`, input.ProjectId, input.Start, input.End).Scan(&errorSessions).Error; err != nil {
		return nil, errors.Wrap(err, "error querying error sessions")
	}

	var newErrors []utils.NewError
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
	`, input.ProjectId, input.Start, input.End).Scan(&newErrors).Error; err != nil {
		return nil, errors.Wrap(err, "error querying new errors")
	}

	var frequentErrors []utils.FrequentError
	if err := h.db.Raw(`
		SELECT eg.event as message, sum(case when eo.created_at >= ? then 1 else 0 end) as count, sum(case when eo.created_at < ? then 1 else 0 end) as priorCount, eg.secure_id
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
	`, input.Start, input.Start, input.ProjectId, input.Prior, input.End, input.Start).Scan(&frequentErrors).Error; err != nil {
		return nil, errors.Wrap(err, "error querying frequent errors")
	}

	return &utils.DigestDataResponse{
		ProjectId:      input.ProjectId,
		UserCount:      curUsers,
		UserDelta:      curUsers - prevUsers,
		SessionCount:   curSessions,
		SessionDelta:   curSessions - prevSessions,
		ErrorCount:     curErrors,
		ErrorDelta:     curErrors - prevErrors,
		ActivityTotal:  time.Duration(curActivity) * time.Millisecond,
		ActivityDelta:  time.Duration(curActivity-prevActivity) * time.Millisecond,
		ActiveSessions: activeSessions,
		ErrorSessions:  errorSessions,
		NewErrors:      newErrors,
		FrequentErrors: frequentErrors,
		DryRun:         input.DryRun,
	}, nil
}

func (h *handlers) SendDigestEmail(ctx context.Context, input utils.DigestDataResponse) error {
	return nil
}
