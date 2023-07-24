package utils

type JourneyInput struct {
	ProjectID int `json:"projectId"`
	SessionID int `json:"sessionId"`
}

type JourneyResponse struct {
	ProjectID int `json:"projectId"`
	SessionID int `json:"sessionId"`
	Count     int `json:"count"`
}
