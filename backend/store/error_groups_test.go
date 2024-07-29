package store

import (
	"context"
	"testing"
	"time"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/stretchr/testify/assert"
)

func TestListErrorObjectsNoData(t *testing.T) {
	defer teardown(t)

	errorGroup := model.ErrorGroup{
		State: privateModel.ErrorStateOpen,
		Event: "something broke!",
	}
	store.DB.Create(&errorGroup)

	// No error objects
	results, err := store.ListErrorObjects(context.TODO(), make([]int64, 0), 0)
	assert.NoError(t, err)

	assert.Equal(t, privateModel.ErrorObjectResults{
		ErrorObjects: []*privateModel.ErrorObjectNode{},
		TotalCount:   0,
	}, results)
}

func TestListErrorObjectsOneObjectNoSession(t *testing.T) {
	defer teardown(t)
	errorGroup := model.ErrorGroup{
		State: privateModel.ErrorStateOpen,
		Event: "something broke!",
	}
	store.DB.Create(&errorGroup)

	// One error object, no session
	errorObject := model.ErrorObject{
		ErrorGroupID: errorGroup.ID,
	}
	store.DB.Create(&errorObject)
	ids := []int64{int64(errorObject.ID)}
	results, err := store.ListErrorObjects(context.TODO(), ids, 71)
	assert.NoError(t, err)

	assert.Len(t, results.ErrorObjects, 1)

	node := results.ErrorObjects[0]

	assert.Equal(t, errorObject.ID, node.ID)
	assert.WithinDuration(t, errorObject.CreatedAt, node.CreatedAt, 10*time.Second)
	assert.Equal(t, errorObject.Event, node.Event)
	assert.WithinDuration(t, errorObject.Timestamp, node.Timestamp, 10*time.Second)
	assert.Nil(t, node.Session)

	assert.Equal(t, int64(71), results.TotalCount)
}

func TestListErrorObjectsOneObjectWithSession(t *testing.T) {
	teardown(t)

	errorGroup := model.ErrorGroup{
		State: privateModel.ErrorStateOpen,
		Event: "something broke!",
	}
	store.DB.Create(&errorGroup)

	session := model.Session{
		AppVersion:  ptr.String("123"),
		Email:       ptr.String("chilly@mcwilly.com"),
		Fingerprint: 1234,
	}

	store.DB.Create(&session)

	errorObject := model.ErrorObject{
		ErrorGroupID:   errorGroup.ID,
		SessionID:      &session.ID,
		ServiceVersion: "1.0.0",
	}
	store.DB.Create(&errorObject)
	ids := []int64{int64(errorObject.ID)}
	results, err := store.ListErrorObjects(context.TODO(), ids, 1)
	assert.NoError(t, err)

	assert.Len(t, results.ErrorObjects, 1)

	node := results.ErrorObjects[0]

	assert.Equal(t, errorObject.ID, node.ID)
	assert.WithinDuration(t, errorObject.CreatedAt, node.CreatedAt, 10*time.Second)
	assert.Equal(t, errorObject.Event, node.Event)
	assert.Equal(t, errorObject.ServiceVersion, node.ServiceVersion)
	assert.Equal(t, &privateModel.ErrorObjectNodeSession{
		SecureID:    session.SecureID,
		Email:       session.Email,
		Fingerprint: &session.Fingerprint,
		Excluded:    session.Excluded,
	}, node.Session)

	assert.Equal(t, int64(1), results.TotalCount)
}

func TestUpdateErrorGroupStateByAdmin(t *testing.T) {
	defer teardown(t)

	errorGroup := model.ErrorGroup{
		State: privateModel.ErrorStateOpen,
	}

	admin := model.Admin{}
	store.DB.Create(&admin)

	now := time.Now()
	params := UpdateErrorGroupParams{
		ID:           -1,
		State:        privateModel.ErrorStateIgnored,
		SnoozedUntil: &now,
	}

	unchangedErrorGroup, err := store.UpdateErrorGroupStateByAdmin(context.TODO(), admin, params)
	assert.EqualError(t, err, "record not found")
	assert.Nil(t, unchangedErrorGroup)

	store.DB.Create(&errorGroup)

	params.ID = errorGroup.ID

	updatedErrorGroup, err := store.UpdateErrorGroupStateByAdmin(context.TODO(), admin, params)
	assert.NoError(t, err)

	assert.Equal(t, params.State, updatedErrorGroup.State)
	assert.Equal(t, params.SnoozedUntil.Format(time.RFC3339), updatedErrorGroup.SnoozedUntil.Format(time.RFC3339))

	activityLogs, err := store.GetErrorGroupActivityLogs(context.TODO(), errorGroup.ID)
	assert.NoError(t, err)

	assert.Len(t, activityLogs, 1)
	assert.Equal(t, admin.ID, activityLogs[0].AdminID)
	assert.Equal(t, errorGroup.ID, activityLogs[0].ErrorGroupID)
	assert.Equal(t, model.ErrorGroupIgnoredEvent, activityLogs[0].EventType)
	assert.NotNil(t, activityLogs[0].EventData)
}

func TestUpdateErrorGroupStateBySystem(t *testing.T) {
	defer teardown(t)
	errorGroup := model.ErrorGroup{
		State: privateModel.ErrorStateOpen,
	}

	now := time.Now()
	params := UpdateErrorGroupParams{
		ID:           -1,
		State:        privateModel.ErrorStateIgnored,
		SnoozedUntil: &now,
	}

	err := store.UpdateErrorGroupStateBySystem(context.TODO(), params)
	assert.EqualError(t, err, "record not found")

	store.DB.Create(&errorGroup)

	params.ID = errorGroup.ID

	err = store.UpdateErrorGroupStateBySystem(context.TODO(), params)
	assert.NoError(t, err)

	var updatedErrorGroup *model.ErrorGroup
	store.DB.Model(model.ErrorGroup{}).Where("id = ?", params.ID).First(&updatedErrorGroup)

	assert.Equal(t, params.State, updatedErrorGroup.State)
	assert.Equal(t, params.SnoozedUntil.Format(time.RFC3339), updatedErrorGroup.SnoozedUntil.Format(time.RFC3339))

	activityLogs, err := store.GetErrorGroupActivityLogs(context.TODO(), errorGroup.ID)
	assert.NoError(t, err)

	assert.Len(t, activityLogs, 1)
	assert.Equal(t, 0, activityLogs[0].AdminID) // 0 means the system generated this
	assert.Equal(t, errorGroup.ID, activityLogs[0].ErrorGroupID)
	assert.Equal(t, model.ErrorGroupIgnoredEvent, activityLogs[0].EventType)
	assert.NotNil(t, activityLogs[0].EventData)
}
