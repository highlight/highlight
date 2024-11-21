package graph

import (
	"firebase.google.com/go/auth"
	"github.com/highlight-run/highlight/backend/env"
	"time"
)

type LoginCredentials struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

const (
	stateCookieName                 = "state"
	tokenCookieName                 = "token"
	loginExpiry                     = 7 * 24 * time.Hour
	adminPasswordTokenDuration      = 7 * 24 * time.Hour
	loginError                      = "invalid email/password provided"
	passwordLoginConfigurationError = "password auth mode not properly configured"
	oauthCallbackError              = "oauth2 callback failed"
)

var adminPassword = env.Config.AuthAdminPassword

func GetPasswordAuthUser(email string) *auth.UserInfo {
	return &auth.UserInfo{
		DisplayName: email,
		UID:         email,
		Email:       email,
		PhoneNumber: "+14081234567",
		PhotoURL:    "https://picsum.photos/200",
		ProviderID:  "",
	}
}
