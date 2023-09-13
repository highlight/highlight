package graph

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"time"

	"firebase.google.com/go/auth"
	"github.com/golang-jwt/jwt/v4"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	log "github.com/sirupsen/logrus"
)

type LoginCredentials struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

var ADMIN_PASSWORD = os.Getenv("ADMIN_PASSWORD")
var ADMIN_PASSWORD_TOKEN_DURATION = time.Now().Add(time.Hour * 24).Unix()

func (r *Resolver) Login(w http.ResponseWriter, req *http.Request) {
	var credentials LoginCredentials

	ctx := req.Context()

	if ADMIN_PASSWORD == "" {
		http.Error(w, "", http.StatusInternalServerError)
		log.WithContext(ctx).Error(errors.New("No ADMIN_PASSWORD found"))
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

	if ADMIN_PASSWORD != credentials.Password {
		http.Error(w, "invalid password", http.StatusBadRequest)
		return
	}

	user := &auth.UserInfo{
		DisplayName: "Hobby Highlighter",
		Email:       credentials.Email,
		PhoneNumber: "+14081234567",
		PhotoURL:    "https://picsum.photos/200",
		ProviderID:  "",
		UID:         "12345abcdef09876a1b2c3d4e5f",
	}

	atClaims := jwt.MapClaims{}
	atClaims["authorized"] = true
	atClaims["exp"] = ADMIN_PASSWORD_TOKEN_DURATION
	atClaims["email"] = user.Email
	atClaims["uid"] = user.UID
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
	w.Write(jsonResponse)
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

	user := &auth.UserInfo{
		DisplayName: "Hobby Highlighter",
		Email:       email.(string),
		PhoneNumber: "+14081234567",
		PhotoURL:    "https://picsum.photos/200",
		ProviderID:  "",
		UID:         uid.(string),
	}

	response := make(map[string]interface{})
	response["user"] = user

	jsonResponse, err := json.Marshal((response))
	if err != nil {
		log.WithContext(ctx).Error(err)
		http.Error(w, "", http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)
}
