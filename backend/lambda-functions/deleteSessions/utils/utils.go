package utils

type QuerySessionsInput struct {
	ProjectId int    `json:"projectId"`
	Query     string `json:"query"`
}

type BatchIdResponse struct {
	BatchId int `json:"batchId"`
}
