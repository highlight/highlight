package worker

import (
	"context"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type ErrorScorer struct {
	store *store.Store
	db    *gorm.DB
}

func NewErrorScorer(store *store.Store, db *gorm.DB) *ErrorScorer {
	return &ErrorScorer{
		store: store,
		db:    db,
	}
}

func (errorScorer *ErrorScorer) ScoreImpactfulErrors(ctx context.Context) error {
	var errorGroups []model.ErrorGroup

	// TODO(spenny): should we cache the last processed error object id to prevent duplicates
	if err := errorScorer.db.Raw(`
		SELECT DISTINCT(grp.id), grp.created_at, grp.project_id, MAX(obj.id)
		FROM error_objects obj
		INNER JOIN error_groups grp
			ON grp.id = obj.error_group_id
		WHERE obj.created_at >= now() - INTERVAL '10 minutes'
		GROUP BY grp.id
		ORDER BY MAX(obj.id) ASC`).
		Scan(&errorGroups).Error; err != nil {
		return errors.Wrap(err, "error querying for error objects")
	}

	if len(errorGroups) == 0 {
		return nil
	}

	// TODO(spenny): currently N+1 query
	for _, errorGroup := range errorGroups {
		log.WithContext(ctx).WithFields(
			log.Fields{
				"error_group_id": errorGroup.ID,
				"worker":         "errorscorer",
			}).Info("Scoring error group")

		err := errorScorer.scoreErrorGroup(ctx, &errorGroup)

		if err != nil {
			log.WithContext(ctx).WithField("error_group_id", errorGroup.ID).Error(err)
			continue
		}
	}

	return nil
}

func (ErrorScorer *ErrorScorer) scoreErrorGroup(ctx context.Context, errorGroup *model.ErrorGroup) error {
	newLimitedDataError := errorGroup.CreatedAt.After(time.Now().Add(-time.Hour * 24 * 7))

	// number of occurances
	if newLimitedDataError {
		// convert to raw sql with project id
		// SELECT STDDEV_POP(count), avg(count)
		// FROM (
		// 	SELECT error_group_id, COUNT(*)
		// 	FROM error_objects
		// 	WHERE project_id = 1
		// 		AND created_at > now() - Interval '2 day'
		// 		AND created_at < now() - INTERVAL '1 day'
		// 	GROUP BY 1
		// 	ORDER BY 2 DESC
		// 	LIMIT 5
		// ) e
	} else {
		// SELECT STDDEV_POP(count), avg(count)
		// FROM (
		// 	SELECT extract(hour from created_at), extract(day from created_at), COUNT(*)
		// 	FROM error_objects
		// 	WHERE error_group_id = [error_id]
		// 		AND created_at > now() - Interval '169 hours'
		// 	GROUP BY 2,1
		// 	ORDER BY 2,1
		// ) e

		// with trailing_vals as (
		// 	SELECT extract(day from created_at) as day, extract(hour from created_at) as hour, COUNT(*)
		// 	FROM error_objects
		// 	WHERE error_group_id = ‘35490166’
		// 		AND created_at > now() - Interval ‘7 days’
		// 	GROUP BY 1,2
		// 	ORDER BY 1,2
		// ),
		// stddev as (
		// 	SELECT STDDEV_POP(count) from trailing_vals
		// ),
		// avg as (
		// 	SELECT avg(count) from trailing_vals
		// )
		// SELECT day, hour, count - avg / stddev from trailing_vals
	}

	// number of users affected
	return nil
}
