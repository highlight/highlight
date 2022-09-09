package utils

type QuerySessionsInput struct {
	ProjectId int    `json:"projectId"`
	Query     string `json:"query"`
}

type BatchIdResponse struct {
	TaskId  string `json:"taskId"`
	BatchId string `json:"batchId"`
}
