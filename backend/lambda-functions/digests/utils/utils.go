package utils

import "time"

type DigestsInput struct {
	AsOf   time.Time `json:"asOf"`
	DryRun bool      `json:"dryRun"`
}

type ProjectIdResponse struct {
	ProjectId int       `json:"projectId"`
	DryRun    bool      `json:"dryRun"`
	End       time.Time `json:"end"`
	Start     time.Time `json:"start"`
	Prior     time.Time `json:"prior"`
}

type ActiveSession struct {
	Identifier   string        `json:"identifier"`
	City         string        `json:"city"`
	State        string        `json:"state"`
	Country      string        `json:"country"`
	ActiveLength time.Duration `json:"activeLength"`
	SecureId     string        `json:"secureId"`
}

type ErrorSession struct {
	Identifier   string        `json:"identifier"`
	ErrorCount   int           `json:"errorCount"`
	ActiveLength time.Duration `json:"activeLength"`
	SecureId     string        `json:"secureId"`
}

type NewError struct {
	Message           string `json:"message"`
	AffectedUserCount int    `json:"affectedUserCount"`
	SecureId          string `json:"secureId"`
}

type FrequentError struct {
	Message    string `json:"message"`
	Count      int    `json:"count"`
	PriorCount int    `json:"priorCount"`
	SecureId   string `json:"secureId"`
}

type DigestDataResponse struct {
	ProjectId      int             `json:"projectId"`
	UserCount      int             `json:"userCount"`
	UserDelta      int             `json:"userDelta"`
	SessionCount   int             `json:"sessionCount"`
	SessionDelta   int             `json:"sessionDelta"`
	ErrorCount     int             `json:"errorCount"`
	ErrorDelta     int             `json:"errorDelta"`
	ActivityTotal  time.Duration   `json:"activityTotal"`
	ActivityDelta  time.Duration   `json:"activityDelta"`
	ActiveSessions []ActiveSession `json:"activeSessions"`
	ErrorSessions  []ErrorSession  `json:"errorSessions"`
	NewErrors      []NewError      `json:"newErrors"`
	FrequentErrors []FrequentError `json:"frequentErrors"`
	DryRun         bool            `json:"dryRun"`
}
