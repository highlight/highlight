package worker

import (
	"context"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type ErrorGroupWithLastObjectId struct {
	ID                int
	ProjectID         int
	CreatedAt         time.Time
	LastErrorObjectId int
}

type ErrorScorer struct {
	store *store.Store
	db    *gorm.DB
	redis *redis.Client
}

func NewErrorScorer(store *store.Store, db *gorm.DB, redis *redis.Client) *ErrorScorer {
	return &ErrorScorer{
		store: store,
		db:    db,
		redis: redis,
	}
}

func (errorScorer *ErrorScorer) ScoreImpactfulErrors(ctx context.Context) {
	var errorGroups []*ErrorGroupWithLastObjectId

	lastComputedErrorInstanceId, _ := errorScorer.redis.GetLastComputedImpactfulErrorObjectId(ctx)

	// TODO(spenny): should we cache the last processed error object id to prevent duplicates
	if err := errorScorer.db.Raw(`
		SELECT grp.id, grp.created_at, grp.project_id, MAX(obj.id) as last_error_object_id
		FROM error_objects obj
		INNER JOIN error_groups grp
			ON grp.id = obj.error_group_id
		WHERE obj.created_at >= now() - INTERVAL '10 minutes'
			AND obj.id > ?
		GROUP BY grp.id
		ORDER BY last_error_object_id ASC
	`, lastComputedErrorInstanceId).Scan(&errorGroups).Error; err != nil {
		log.WithContext(ctx).Error(errors.Wrap(err, "error querying for error objects"))
		return
	}

	if len(errorGroups) == 0 {
		log.WithContext(ctx).WithField("lastErrorObjectId", lastComputedErrorInstanceId).Info("No errors to score")
		return
	}

	// TODO(spenny): currently N+1 query
	for _, errorGroup := range errorGroups {
		occurranceScore, affectedUsersScore, err := errorScorer.scoreErrorGroup(ctx, errorGroup)
		_ = errorScorer.redis.SetLastComputedImpactfulErrorObjectId(ctx, errorGroup.LastErrorObjectId)
		if err != nil {
			log.WithContext(ctx).WithField("errorGroupId", errorGroup.ID).Error(err)
			continue
		}

		totalScore := occurranceScore + affectedUsersScore
		currentTime := time.Now()

		if err := errorScorer.db.Model(&model.ErrorGroup{Model: model.Model{ID: errorGroup.ID}}).Updates(&model.ErrorGroup{ImpactfulScore: &totalScore, ImpactfulScoreDate: &currentTime}).Error; err != nil {
			log.WithContext(ctx).WithField("errorGroupId", errorGroup.ID).Error(err)
			continue
		}

		log.WithContext(ctx).WithFields(log.Fields{"errorGroupId": errorGroup.ID, "occurranceScore": occurranceScore, "affectedUsersScore": affectedUsersScore}).Info("Scored error group")
	}
}

func (errorScorer *ErrorScorer) scoreErrorGroup(ctx context.Context, errorGroup *ErrorGroupWithLastObjectId) (float64, float64, error) {
	newLimitedDataError := errorGroup.CreatedAt.After(time.Now().Add(-time.Hour * 24 * 7))

	occuranceScore := 1.0
	affectedUsersScore := 1.0

	if newLimitedDataError {
		// number of occurances
		if err := errorScorer.db.Raw(`
			WITH most_occurring_errors AS (
				SELECT error_group_id, COUNT(*) as errorCount
				FROM error_objects
				WHERE project_id = ?
					AND created_at > NOW() - INTERVAL '7 day'
				GROUP BY error_group_id
				ORDER BY errorCount DESC
				LIMIT 5
			),
			current_error AS (
				SELECT COUNT(*) as current_error_count
				FROM error_objects
				WHERE error_group_id = ?
					AND created_at > NOW() - INTERVAL '1 hour'
			),
			trailing_vals AS (
				SELECT error_objects.error_group_id, extract(day from created_at) AS day, EXTRACT(hour from created_at) AS hour, COUNT(*) AS count
				FROM error_objects
				INNER JOIN most_occurring_errors
					ON most_occurring_errors.error_group_id = error_objects.error_group_id
				WHERE created_at > NOW() - INTERVAL '7 days'
				GROUP BY error_objects.error_group_id, day, hour
				ORDER BY day DESC, hour DESC
			),
			stddev AS (
				SELECT STDDEV_POP(count) FROM trailing_vals
			),
			avg AS (
				SELECT AVG(count) FROM trailing_vals
			)
			SELECT (current_error_count - avg) / stddev_pop AS score
			FROM trailing_vals, stddev, avg, current_error
			ORDER BY day DESC, hour DESC
			LIMIT 1
		`, errorGroup.ProjectID, errorGroup.ID).Find(&occuranceScore).Error; err != nil {
			return 0, 0, errors.Wrap(err, "error calculating occurance score")
		}

		// number of users affected
		if err := errorScorer.db.Raw(`
			WITH most_occurring_errors AS (
				SELECT error_group_id, COUNT(*) as errorCount
				FROM error_objects
				WHERE project_id = ?
					AND created_at > NOW() - INTERVAL '7 day'
				GROUP BY error_group_id
				ORDER BY errorCount DESC
				LIMIT 5
			),
			current_error AS (
				SELECT COUNT(DISTINCT(sessions.email)) as current_user_count
				FROM error_objects
				INNER JOIN sessions
					ON sessions.id = error_objects.session_id
				WHERE error_group_id = ?
					AND sessions.created_at > NOW() - INTERVAL '1 hour'
			),
			current_sessions AS (
				SELECT COUNT(DISTINCT(sessions.email)) as total_user_count 
				FROM sessions
				WHERE sessions.project_id = ?
					AND sessions.created_at > NOW() - INTERVAL '1 hour'
			),
			error_data AS (
				SELECT error_objects.error_group_id, extract(day from sessions.created_at) AS day, EXTRACT(hour from sessions.created_at) AS hour, COUNT(DISTINCT(sessions.email)) as total_user_count 
				FROM error_objects
				INNER JOIN sessions
					ON sessions.id = error_objects.session_id
				INNER JOIN most_occurring_errors
					ON most_occurring_errors.error_group_id = error_objects.error_group_id
				WHERE sessions.created_at > NOW() - INTERVAL '7 days'
				GROUP BY error_objects.error_group_id, day, hour
				ORDER BY day DESC, hour DESC
			),
			session_data AS (
				SELECT extract(day from created_at) AS day, EXTRACT(hour from created_at) AS hour, COUNT(DISTINCT(sessions.email)) as total_user_count 
				FROM sessions
				WHERE sessions.project_id = ?
					AND sessions.created_at > NOW() - INTERVAL '7 days'
				GROUP BY day, hour
				ORDER BY day DESC, hour DESC
			),
			trailing_vals AS (
				SELECT session_data.day, session_data.hour, CAST(error_data.total_user_count AS float) / session_data.total_user_count AS ratio
				FROM error_data
				INNER JOIN session_data ON error_data.day = session_data.day AND error_data.hour = session_data.hour
				ORDER BY session_data.day DESC, session_data.hour DESC
			),
			stddev AS (
				SELECT STDDEV_POP(ratio) FROM trailing_vals
			),
			avg AS (
				SELECT AVG(ratio) FROM trailing_vals
			)
			SELECT ((CAST(current_user_count / total_user_count AS float)) - avg) / stddev_pop AS score
			FROM trailing_vals, stddev, avg, current_error, current_sessions
			ORDER BY day DESC, hour DESC
			LIMIT 1
		`, errorGroup.ProjectID, errorGroup.ID, errorGroup.ProjectID, errorGroup.ProjectID).Find(&affectedUsersScore).Error; err != nil {
			return 0, 0, errors.Wrap(err, "error calculating affected user score")
		}
	} else {
		// number of occurances
		if err := errorScorer.db.Raw(`
			WITH current_error AS (
				SELECT COUNT(*) as current_error_count
				FROM error_objects
				WHERE error_group_id = ?
					AND created_at > NOW() - INTERVAL '1 hour'
			),
			trailing_vals AS (
				SELECT extract(day from created_at) AS day, EXTRACT(hour from created_at) AS hour, COUNT(*) AS count
				FROM error_objects
				WHERE error_group_id = ?
					AND created_at > NOW() - INTERVAL '7 days'
				GROUP BY day, hour
				ORDER BY day DESC, hour DESC
			),
			stddev AS (
				SELECT STDDEV_POP(count) FROM trailing_vals
			),
			avg AS (
				SELECT AVG(count) FROM trailing_vals
			)
			SELECT (current_error_count - avg) / stddev_pop AS score
			FROM trailing_vals, stddev, avg
			ORDER BY day DESC, hour DESC
			LIMIT 1
		`, errorGroup.ID).Find(&occuranceScore).Error; err != nil {
			return 0, 0, errors.Wrap(err, "error calculating occurrance score")
		}

		// number of users affected
		if err := errorScorer.db.Raw(`
			WITH current_error AS (
				SELECT COUNT(DISTINCT(sessions.email)) as current_user_count
				FROM error_objects
				INNER JOIN sessions
					ON sessions.id = error_objects.session_id
				WHERE error_group_id = ?
					AND sessions.created_at > NOW() - INTERVAL '1 hour'
			),
			current_sessions AS (
				SELECT COUNT(DISTINCT(sessions.email)) as total_user_count 
				FROM sessions
				WHERE sessions.project_id = ?
					AND sessions.created_at > NOW() - INTERVAL '1 hour'
			),
			error_data AS (
				SELECT extract(day from sessions.created_at) AS day, EXTRACT(hour from sessions.created_at) AS hour, COUNT(DISTINCT(sessions.email)) as total_user_count 
				FROM error_objects
				INNER JOIN sessions
					ON sessions.id = error_objects.session_id
				WHERE error_group_id = ?
					AND sessions.created_at > NOW() - INTERVAL '7 days'
				GROUP BY day, hour
				ORDER BY day DESC, hour DESC
			),
			session_data AS (
				SELECT extract(day from created_at) AS day, EXTRACT(hour from created_at) AS hour, COUNT(DISTINCT(sessions.email)) as total_user_count 
				FROM sessions
				WHERE sessions.project_id = ?
					AND sessions.created_at > NOW() - INTERVAL '7 days'
				GROUP BY day, hour
				ORDER BY day DESC, hour DESC
			),
			trailing_vals AS (
				SELECT session_data.day, session_data.hour, CAST(error_data.total_user_count AS float) / session_data.total_user_count AS ratio
				FROM error_data
				INNER JOIN session_data ON error_data.day = session_data.day AND error_data.hour = session_data.hour
				ORDER BY session_data.day DESC, session_data.hour DESC
			),
			stddev AS (
				SELECT STDDEV_POP(ratio) FROM trailing_vals
			),
			avg AS (
				SELECT AVG(ratio) FROM trailing_vals
			)
			SELECT ((CAST(current_user_count / total_user_count AS float)) - avg) / stddev_pop AS score
			FROM trailing_vals, stddev, avg, current_error, current_sessions
			ORDER BY day DESC, hour DESC
			LIMIT 1
		`, errorGroup.ID, errorGroup.ProjectID, errorGroup.ID, errorGroup.ProjectID).Find(&affectedUsersScore).Error; err != nil {
			return 0, 0, errors.Wrap(err, "error calculating affected user score")
		}
	}

	return occuranceScore, affectedUsersScore, nil
}
