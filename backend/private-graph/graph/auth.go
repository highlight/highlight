package graph

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"time"

	"firebase.google.com/go/auth"

	"github.com/golang-jwt/jwt/v4"
	e "github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

type LoginCredentials struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

var AdminPassword = os.Getenv("ADMIN_PASSWORD")
var AdminPasswordTokenDuration = time.Hour * 24

func (r *Resolver) Login(w http.ResponseWriter, req *http.Request) {
	var credentials LoginCredentials

	ctx := req.Context()

	if AdminPassword == "" {
		http.Error(w, "", http.StatusInternalServerError)
		log.WithContext(ctx).Error(errors.New("Password auth mode not properly configured."))
		return
	}

	err := json.NewDecoder(req.Body).Decode(&credentials)

	if err != nil || credentials.Password == "" || credentials.Email == "" {
		log.WithContext(ctx).Error(err)
		http.Error(w, "no email or password provided", http.StatusBadRequest)
		return
	}

	_, err = mail.ParseEmail(credentials.Email)

	if err != nil {
		log.WithContext(ctx).Error(err)
		http.Error(w, "Invalid email provided", http.StatusBadRequest)
		return
	}

	if AdminPassword != credentials.Password {
		http.Error(w, "invalid password", http.StatusBadRequest)
		return
	}

	user := GetPasswordAuthUser(credentials.Email)

	atClaims := jwt.MapClaims{}
	atClaims["authorized"] = true
	atClaims["exp"] = time.Now().Add(AdminPasswordTokenDuration).Unix()
	atClaims["email"] = user.Email
	atClaims["uid"] = user.Email
	at := jwt.NewWithClaims(jwt.SigningMethodHS256, atClaims)

	token, err := at.SignedString([]byte(JwtAccessSecret))
	if err != nil {
		log.WithContext(ctx).Error(err)
		http.Error(w, "", http.StatusInternalServerError)
	}

	response := make(map[string]interface{})
	response["token"] = token
	response["user"] = user

	jsonResponse, err := json.Marshal((response))
	if err != nil {
		log.WithContext(ctx).Error(err)
		http.Error(w, "", http.StatusInternalServerError)
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
		log.WithContext(ctx).Error(errors.New("Forbidden"))
		http.Error(w, "", http.StatusUnauthorized)
		return
	}

	user := GetPasswordAuthUser(email.(string))

	response := make(map[string]interface{})
	response["user"] = user

	jsonResponse, err := json.Marshal((response))
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
