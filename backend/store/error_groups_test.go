package store

import (
	"context"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/stretchr/testify/assert"
)

func TestUpdateErrorGroupStateByAdmin(t *testing.T) {
	util.RunTestWithDBWipe(t, "TestUpdateErrorGroupStateByAdmin", store.db, func(t *testing.T) {

		errorGroup := model.ErrorGroup{
			State: privateModel.ErrorStateOpen,
		}

		admin := model.Admin{}
		store.db.Create(&admin)

		now := time.Now()
		params := UpdateErrorGroupParams{
			ID:           -1,
			State:        privateModel.ErrorStateIgnored,
			SnoozedUntil: &now,
		}

		_, err := store.UpdateErrorGroupStateByAdmin(context.TODO(), admin, params)
		assert.EqualError(t, err, "record not found")

		store.db.Create(&errorGroup)

		params.ID = errorGroup.ID

		updatedErrorGroup, err := store.UpdateErrorGroupStateByAdmin(context.TODO(), admin, params)
		assert.NoError(t, err)

		assert.Equal(t, updatedErrorGroup.State, params.State)
		assert.Equal(t, updatedErrorGroup.SnoozedUntil, params.SnoozedUntil)

		activityLogs := []model.ErrorGroupActivityLog{}
		store.db.Where(model.ErrorGroupActivityLog{}).Find(&activityLogs)

		assert.Len(t, activityLogs, 1)
		assert.Equal(t, activityLogs[0].AdminID, admin.ID)
		assert.Equal(t, activityLogs[0].ErrorGroupID, errorGroup.ID)
		assert.Equal(t, activityLogs[0].EventType, model.ErrorGroupIgnoredEvent)
	})
}

func TestUpdateErrorGroupStateBySystem(t *testing.T) {
	util.RunTestWithDBWipe(t, "UpdateErrorGroupStateBySystem", store.db, func(t *testing.T) {
		errorGroup := model.ErrorGroup{
			State: privateModel.ErrorStateOpen,
		}

		now := time.Now()
		params := UpdateErrorGroupParams{
			ID:           -1,
			State:        privateModel.ErrorStateIgnored,
			SnoozedUntil: &now,
		}

		_, err := store.UpdateErrorGroupStateBySystem(context.TODO(), params)
		assert.EqualError(t, err, "record not found")

		store.db.Create(&errorGroup)

		params.ID = errorGroup.ID

		updatedErrorGroup, err := store.UpdateErrorGroupStateBySystem(context.TODO(), params)
		assert.NoError(t, err)

		assert.Equal(t, updatedErrorGroup.State, params.State)
		assert.Equal(t, updatedErrorGroup.SnoozedUntil, params.SnoozedUntil)

		activityLogs := []model.ErrorGroupActivityLog{}
		store.db.Where(model.ErrorGroupActivityLog{}).Find(&activityLogs)

		assert.Len(t, activityLogs, 1)
		assert.Equal(t, activityLogs[0].AdminID, 0) // 0 means the system generated this
		assert.Equal(t, activityLogs[0].ErrorGroupID, errorGroup.ID)
		assert.Equal(t, activityLogs[0].EventType, model.ErrorGroupIgnoredEvent)
	})
}
