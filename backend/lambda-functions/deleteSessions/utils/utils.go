package utils

import (
	"github.com/highlight-run/highlight/backend/model"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type QuerySessionsInput struct {
	ProjectId    int    `json:"projectId"`
	Query        string `json:"query"`
	Email        string `json:"email"`
	FirstName    string `json:"firstName"`
	SessionCount int    `json:"sessionCount"`
}

type BatchIdResponse struct {
	ProjectId int    `json:"projectId"`
	TaskId    string `json:"taskId"`
	BatchId   string `json:"batchId"`
}

func GetSessionIdsInBatch(db *gorm.DB, taskId string, batchId string) ([]int, error) {
	var sessionIds []int
	if err := db.Select("session_id").Where(&model.DeleteSessionsTask{TaskID: taskId, BatchID: batchId}).
		Find(&sessionIds).Error; err != nil {
		return nil, errors.Wrap(err, "error querying session ids to delete")
	}
	return sessionIds, nil
}
