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

type ActiveSessionSql struct {
	UserProperties string        `json:"userProperties"`
	Identifier     string        `json:"identifier"`
	Fingerprint    string        `json:"fingerprint"`
	City           string        `json:"city"`
	State          string        `json:"state"`
	Country        string        `json:"country"`
	ActiveLength   time.Duration `json:"activeLength"`
	SecureId       string        `json:"secureId"`
}

type ErrorSessionSql struct {
	UserProperties string        `json:"userProperties"`
	Identifier     string        `json:"identifier"`
	Fingerprint    string        `json:"fingerprint"`
	ErrorCount     int           `json:"errorCount"`
	ActiveLength   time.Duration `json:"activeLength"`
	SecureId       string        `json:"secureId"`
}

type NewErrorSql struct {
	Message           string `json:"message"`
	AffectedUserCount int    `json:"affectedUserCount"`
	SecureId          string `json:"secureId"`
}

type FrequentErrorSql struct {
	Message    string `json:"message"`
	Count      int    `json:"count"`
	PriorCount int    `json:"priorCount"`
	SecureId   string `json:"secureId"`
}

type ActiveSession struct {
	Identifier   string `json:"identifier"`
	Location     string `json:"location"`
	ActiveLength string `json:"activeLength"`
	URL          string `json:"url"`
}

type ErrorSession struct {
	Identifier   string `json:"identifier"`
	ErrorCount   string `json:"errorCount"`
	ActiveLength string `json:"activeLength"`
	URL          string `json:"url"`
}

type NewError struct {
	Message           string `json:"message"`
	AffectedUserCount string `json:"affectedUserCount"`
	URL               string `json:"url"`
}

type FrequentError struct {
	Message string `json:"message"`
	Count   string `json:"count"`
	Delta   string `json:"delta"`
	URL     string `json:"url"`
}

type DigestDataResponse struct {
	ProjectId      int             `json:"projectId"`
	EndFmt         string          `json:"endFmt"`
	StartFmt       string          `json:"startFmt"`
	ProjectName    string          `json:"projectName"`
	UserCount      string          `json:"userCount"`
	UserDelta      string          `json:"userDelta"`
	SessionCount   string          `json:"sessionCount"`
	SessionDelta   string          `json:"sessionDelta"`
	ErrorCount     string          `json:"errorCount"`
	ErrorDelta     string          `json:"errorDelta"`
	ActivityTotal  string          `json:"activityTotal"`
	ActivityDelta  string          `json:"activityDelta"`
	ActiveSessions []ActiveSession `json:"activeSessions"`
	ErrorSessions  []ErrorSession  `json:"errorSessions"`
	NewErrors      []NewError      `json:"newErrors"`
	FrequentErrors []FrequentError `json:"frequentErrors"`
	DryRun         bool            `json:"dryRun"`
}
