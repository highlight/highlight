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

var adminPassword = env.Config.AuthAdminPassword
var adminPasswordTokenDuration = time.Hour * 24
var loginError = "invalid email/password provided"
var passwordLoginConfigurationError = "password auth mode not properly configured"
var oauthCallbackError = "oauth2 callback failed"

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
