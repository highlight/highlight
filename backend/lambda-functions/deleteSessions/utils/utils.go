package utils

import (
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type QuerySessionsInput struct {
	ProjectId    int                    `json:"projectId"`
	Params       modelInputs.QueryInput `json:"params"`
	Email        string                 `json:"email"`
	FirstName    string                 `json:"firstName"`
	SessionCount int                    `json:"sessionCount"`
	DryRun       bool                   `json:"dryRun"`
}

type BatchIdResponse struct {
	ProjectId int    `json:"projectId"`
	TaskId    string `json:"taskId"`
	BatchId   string `json:"batchId"`
	DryRun    bool   `json:"dryRun"`
}

func GetSessionIdsInBatch(db *gorm.DB, taskId string, batchId string) ([]int, error) {
	var sessionIds []int
	if err := db.Model(&model.DeleteSessionsTask{}).Select("session_id").
		Where(&model.DeleteSessionsTask{TaskID: taskId, BatchID: batchId}).
		Find(&sessionIds).Error; err != nil {
		return nil, errors.Wrap(err, "error querying session ids to delete")
	}
	return sessionIds, nil
}
