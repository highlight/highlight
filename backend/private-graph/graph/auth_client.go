package graph

import (
	"context"
	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"fmt"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/go-redis/cache/v9"
	"github.com/golang-jwt/jwt/v4"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	log "github.com/sirupsen/logrus"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
	"net/http"
	"strings"
	"time"
)

const stateCookieName = "state"

type Client interface {
	updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error)
	GetUser(ctx context.Context, uid string) (*auth.UserRecord, error)
	PerformLogin(ctx context.Context, credentials LoginCredentials) (map[string]interface{}, error)
}

type SimpleAuthClient struct{}

type PasswordAuthClient struct{}

type FirebaseAuthClient struct {
	authClient *auth.Client
}

type OAuthAuthClient struct {
	store        *store.Store
	clientID     string
	oidcProvider *oidc.Provider
	oauthConfig  *oauth2.Config
}

func (c *PasswordAuthClient) GetUser(_ context.Context, uid string) (*auth.UserRecord, error) {
	return &auth.UserRecord{
		UserInfo:      GetPasswordAuthUser(uid),
		EmailVerified: true,
	}, nil
}

func (c *PasswordAuthClient) PerformLogin(_ context.Context, credentials LoginCredentials) (map[string]interface{}, error) {
	if adminPassword == "" {
		return nil, e.New(passwordLoginConfigurationError)
	}
	if adminPassword != credentials.Password {
		return nil, e.New(loginError)
	}

	_, err := mail.ParseEmail(credentials.Email)
	if err != nil {
		return nil, err
	}

	user := GetPasswordAuthUser(credentials.Email)

	atClaims := jwt.MapClaims{}
	atClaims["authorized"] = true
	atClaims["exp"] = time.Now().Add(adminPasswordTokenDuration).Unix()
	atClaims["email"] = user.Email
	atClaims["uid"] = user.Email
	at := jwt.NewWithClaims(jwt.SigningMethodHS256, atClaims)

	token, err := at.SignedString([]byte(JwtAccessSecret))
	if err != nil {
		return nil, err
	}

	response := make(map[string]interface{})
	response["token"] = token
	response["user"] = user
	return response, nil
}

func (c *PasswordAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error) {
	return updateContextWithJWTToken(ctx, token)
}

func (c *SimpleAuthClient) GetUser(_ context.Context, uid string) (*auth.UserRecord, error) {
	return &auth.UserRecord{
		UserInfo:      GetPasswordAuthUser(uid),
		EmailVerified: true,
	}, nil
}

func (c *SimpleAuthClient) PerformLogin(_ context.Context, _ LoginCredentials) (map[string]interface{}, error) {
	// SimpleAuthClient does not support login
	return nil, e.New(loginFlowError)
}

func (c *SimpleAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error) {
	ctx = context.WithValue(ctx, model.ContextKeys.UID, "demo@example.com")
	ctx = context.WithValue(ctx, model.ContextKeys.Email, "demo@example.com")
	return ctx, nil
}

func (c *FirebaseAuthClient) GetUser(ctx context.Context, uid string) (*auth.UserRecord, error) {
	return c.authClient.GetUser(ctx, uid)
}

func (c *FirebaseAuthClient) PerformLogin(_ context.Context, _ LoginCredentials) (map[string]interface{}, error) {
	// FirebaseAuthClient does not support login as the login flow happens client-side
	return nil, e.New(loginFlowError)
}

func (c *FirebaseAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error) {
	var uid string
	email := ""
	if token != "" {
		t, err := c.authClient.VerifyIDToken(context.Background(), token)
		if err != nil {
			return ctx, e.Wrap(err, "invalid id token")
		}
		uid = t.UID
		if userRecord, err := c.authClient.GetUser(context.Background(), uid); err == nil {
			email = userRecord.Email

			// This is to prevent attackers from impersonating Highlight staff.
			_, isAdmin := lo.Find(HighlightAdminEmailDomains, func(domain string) bool { return strings.Contains(email, domain) })
			if isAdmin && !userRecord.EmailVerified {
				email = ""
			}
		}
	}
	ctx = context.WithValue(ctx, model.ContextKeys.UID, uid)
	ctx = context.WithValue(ctx, model.ContextKeys.Email, email)
	return ctx, nil
}

func (c *OAuthAuthClient) GetUser(ctx context.Context, uid string) (*auth.UserRecord, error) {
	userInfo, err := c.getUser(ctx, uid)
	if err != nil {
		return nil, err
	}

	user := auth.UserInfo{
		DisplayName: userInfo.Email,
		UID:         userInfo.Email,
		Email:       userInfo.Email,
		PhoneNumber: "+14081234567",
		PhotoURL:    "https://picsum.photos/200",
		ProviderID:  c.oidcProvider.UserInfoEndpoint(),
	}
	if err := userInfo.Claims(&user); err != nil {
		return nil, err
	}

	return &auth.UserRecord{
		UserInfo:      &user,
		EmailVerified: userInfo.EmailVerified,
	}, nil
}

func (c *OAuthAuthClient) PerformLogin(_ context.Context, _ LoginCredentials) (map[string]interface{}, error) {
	return nil, e.New(loginFlowError)
}

func (c *OAuthAuthClient) setCallbackCookie(w http.ResponseWriter, r *http.Request, name, value string) {
	cookie := &http.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   int(time.Hour.Seconds()),
		Secure:   r.TLS != nil,
		HttpOnly: true,
	}
	http.SetCookie(w, cookie)
}

func (c *OAuthAuthClient) handleRedirect(w http.ResponseWriter, r *http.Request) {
	state := util.GenerateRandomString(32)
	c.setCallbackCookie(w, r, stateCookieName, state)
	http.Redirect(w, r, c.oauthConfig.AuthCodeURL(state), http.StatusFound)
}

func (c *OAuthAuthClient) handleOAuth2Callback(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	// validate state cookie
	state, err := r.Cookie(stateCookieName)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to retrieve state cookie")
		http.Error(w, "state not found", http.StatusBadRequest)
		return
	}
	if r.URL.Query().Get("state") != state.Value {
		log.WithContext(ctx).WithError(err).Error("failed to validate oauth state")
		http.Error(w, "state did not match", http.StatusBadRequest)
		return
	}

	// Verify state and errors.
	oauth2Token, err := c.oauthConfig.Exchange(ctx, r.URL.Query().Get("code"))
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to exchange oauth code")
		http.Error(w, oauthCallbackError, http.StatusBadRequest)
		return
	}

	userInfo, err := c.oidcProvider.UserInfo(ctx, oauth2.StaticTokenSource(oauth2Token))
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get user info")
		http.Error(w, oauthCallbackError, http.StatusBadRequest)
		return
	}

	if err := c.storeUser(ctx, userInfo); err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to store user")
		http.Error(w, oauthCallbackError, http.StatusBadRequest)
		return
	}

	// Extract the ID Token from OAuth2 token.
	rawIDToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		log.WithContext(ctx).WithError(err).Error("failed to extract id_token")
		http.Error(w, oauthCallbackError, http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	_, err = w.Write([]byte(rawIDToken))
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to write back token response")
	}

}

func (c *OAuthAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error) {
	// Parse and verify ID Token payload.
	verifier := c.oidcProvider.Verifier(&oidc.Config{ClientID: c.clientID})
	idToken, err := verifier.Verify(ctx, token)
	if err != nil {
		return nil, err
	}

	// Extract claims
	var claims oidc.UserInfo
	if err := idToken.Claims(&claims); err != nil {
		return nil, err
	}

	ctx = context.WithValue(ctx, model.ContextKeys.UID, claims.Email)
	ctx = context.WithValue(ctx, model.ContextKeys.Email, claims.Email)
	return ctx, nil
}

func (c *OAuthAuthClient) storeUser(ctx context.Context, userInfo *oidc.UserInfo) error {
	if err := c.store.Redis.Cache.Set(&cache.Item{
		Ctx:   ctx,
		Key:   fmt.Sprintf(`user-email-%s`, userInfo.Email),
		Value: userInfo,
		TTL:   time.Hour,
	}); err != nil {
		return err
	}
	return nil
}

func (c *OAuthAuthClient) getUser(ctx context.Context, email string) (*oidc.UserInfo, error) {
	var userInfo oidc.UserInfo
	if err := c.store.Redis.Cache.Get(ctx, email, userInfo); err != nil {
		return nil, err
	}
	return &userInfo, nil
}

func NewFirebaseClient(ctx context.Context) *FirebaseAuthClient {
	secret := env.Config.AuthFirebaseSecret
	creds, err := google.CredentialsFromJSON(context.Background(), []byte(secret),
		"https://www.googleapis.com/auth/firebase",
		"https://www.googleapis.com/auth/identitytoolkit",
		"https://www.googleapis.com/auth/userinfo.email")
	if err != nil {
		log.WithContext(ctx).Errorf("error converting credentials from json: %v", err)
		return nil
	}
	app, err := firebase.NewApp(context.Background(), nil, option.WithCredentials(creds))
	if err != nil {
		log.WithContext(ctx).Errorf("error initializing firebase app: %v", err)
		return nil
	}
	// create a client to communicate with firebase project
	var client *auth.Client
	if client, err = app.Auth(context.Background()); err != nil {
		log.WithContext(ctx).Errorf("error creating firebase client: %v", err)
		return nil
	}
	return &FirebaseAuthClient{authClient: client}
}

func NewOAuthClient(ctx context.Context, store *store.Store) *OAuthAuthClient {
	providerUrl := env.Config.OAuthProviderUrl
	clientID := env.Config.OAuthClientID
	clientSecret := env.Config.OAuthClientSecret
	redirectURL := env.Config.OAuthRedirectUrl

	provider, err := oidc.NewProvider(ctx, providerUrl)
	if err != nil {
		log.WithContext(ctx).WithError(err).Fatalf("failed to connect to oauth oidc provider")
	}

	// Configure an OpenID Connect aware OAuth2 client.
	oauth2Config := oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,

		// Discovery returns the OAuth2 endpoints.
		Endpoint: provider.Endpoint(),

		// "openid" is a required scope for OpenID Connect flows.
		Scopes: []string{oidc.ScopeOpenID, "profile", "email"},
	}

	return &OAuthAuthClient{store, clientID, provider, &oauth2Config}
}

func authenticateToken(tokenString string) (jwt.MapClaims, error) {
	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(JwtAccessSecret), nil
	})
	if err != nil {
		return claims, e.Wrap(err, "invalid id token")
	}

	exp, ok := claims["exp"]
	if !ok {
		return claims, e.Wrap(err, "invalid exp claim")
	}

	expClaim := int64(exp.(float64))
	if time.Now().After(time.Unix(expClaim, 0)) {
		return claims, e.Wrap(err, "token expired")
	}

	return claims, nil
}

func updateContextWithJWTToken(ctx context.Context, token string) (context.Context, error) {
	var uid string
	email := ""

	if token != "" {
		claims, err := authenticateToken(token)
		if err != nil {
			return ctx, err
		}

		email = claims["email"].(string)
		uid = claims["uid"].(string)
	}

	ctx = context.WithValue(ctx, model.ContextKeys.UID, uid)
	ctx = context.WithValue(ctx, model.ContextKeys.Email, email)
	return ctx, nil
}
