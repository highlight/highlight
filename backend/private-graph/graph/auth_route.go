package graph

import (
	"encoding/json"
	"errors"
	"firebase.google.com/go/auth"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"net/http"
	"time"
)

type LoginCredentials struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

var adminPassword = env.Config.AuthAdminPassword
var adminPasswordTokenDuration = time.Hour * 24
var loginError = "invalid email/password provided"
var loginFlowError = "login flow not supported"
var passwordLoginConfigurationError = "password auth mode not properly configured"
var oauthCallbackError = "oauth2 callback failed"

func (r *Resolver) Login(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()

	var credentials LoginCredentials
	err := json.NewDecoder(req.Body).Decode(&credentials)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to unmarshal login details")
		http.Error(w, loginError, http.StatusInternalServerError)
	}

	response, err := AuthClient.PerformLogin(ctx, credentials)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to validate login")
		http.Error(w, loginError, http.StatusInternalServerError)
	}

	jsonResponse, err := json.Marshal(response)
	if err != nil {
		log.WithContext(ctx).Error(err)
		http.Error(w, loginError, http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, err = w.Write(jsonResponse)
	if err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error writing password-auth login response"))
	}
}

func (r *Resolver) ValidateAuthToken(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()

	email := ctx.Value(model.ContextKeys.Email)
	uid := ctx.Value(model.ContextKeys.UID)

	if email == nil || uid == nil {
		log.WithContext(ctx).Error(errors.New("forbidden"))
		http.Error(w, "", http.StatusUnauthorized)
		return
	}

	user := GetPasswordAuthUser(email.(string))

	response := make(map[string]interface{})
	response["user"] = user

	jsonResponse, err := json.Marshal(response)
	if err != nil {
		log.WithContext(ctx).Error(err)
		http.Error(w, "", http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, err = w.Write(jsonResponse)

	if err != nil {
		log.WithContext(ctx).Error(e.Wrap(err, "error writing validate-auth-token response"))
	}
}

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
