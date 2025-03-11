package graph

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/go-chi/chi"
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
)

const (
	oauthClientIDCookieName = "highlight_oauth_client_id"
)

type Client interface {
	updateContextWithAuthenticatedUser(ctx context.Context, w http.ResponseWriter, r *http.Request, token string) (context.Context, error)
	GetUser(ctx context.Context, uid string) (*auth.UserRecord, error)
	SetupListeners(r chi.Router)
}

type SimpleAuthClient struct{}

type PasswordAuthClient struct{}

type FirebaseAuthClient struct {
	authClient *auth.Client
}
type OAuthClient struct {
	clientID     string
	domain       string
	oidcProvider *oidc.Provider
	oauthConfig  *oauth2.Config
}

type OAuthAuthClient struct {
	store        *store.Store
	oauthClients map[string]*OAuthClient
}

type CloudAuthClient struct {
	firebaseClient *FirebaseAuthClient
	oauthClient    *OAuthAuthClient
}

func (c *CloudAuthClient) GetUser(ctx context.Context, uid string) (*auth.UserRecord, error) {
	// sso user
	clientID, ok := ctx.Value(model.ContextKeys.SSOClientID).(string)
	if ok && clientID != "" {
		return c.oauthClient.GetUser(ctx, uid)
	}
	return c.firebaseClient.GetUser(ctx, uid)
}

func (c *CloudAuthClient) SetupListeners(r chi.Router) {
	c.firebaseClient.SetupListeners(r)
	c.oauthClient.SetupListeners(r)
}

func (c *CloudAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, w http.ResponseWriter, r *http.Request, token string) (context.Context, error) {
	// sso user
	if extractClientID(r) != "" {
		return c.oauthClient.updateContextWithAuthenticatedUser(ctx, w, r, token)
	}
	return c.firebaseClient.updateContextWithAuthenticatedUser(ctx, w, r, token)
}

func NewCloudAuthClient(ctx context.Context, store *store.Store) (*CloudAuthClient, error) {
	log.WithContext(ctx).Info("configuring cloud auth client")
	oauthClient, err := NewOAuthClient(ctx, store)
	if err != nil {
		return nil, err
	}
	return &CloudAuthClient{
		firebaseClient: NewFirebaseClient(ctx),
		oauthClient:    oauthClient,
	}, nil
}

func (c *PasswordAuthClient) GetUser(_ context.Context, uid string) (*auth.UserRecord, error) {
	return &auth.UserRecord{
		UserInfo:      GetPasswordAuthUser(uid),
		EmailVerified: true,
	}, nil
}

func (c *PasswordAuthClient) validateToken(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()

	email := ctx.Value(model.ContextKeys.Email)
	uid := ctx.Value(model.ContextKeys.UID)

	if email == nil || uid == nil {
		log.WithContext(ctx).Error(e.New(loginError))
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

func (c *PasswordAuthClient) SetupListeners(r chi.Router) {
	log.WithContext(context.Background()).Info("configuring password server listeners")
	r.Post("/login", c.handleLogin)
	r.Get("/validate-token", c.validateToken)
}

func (c *PasswordAuthClient) handleLogin(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()

	var credentials LoginCredentials
	err := json.NewDecoder(req.Body).Decode(&credentials)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to unmarshal login details")
		http.Error(w, loginError, http.StatusInternalServerError)
	}

	response, err := c.performLogin(ctx, credentials)
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

func (c *PasswordAuthClient) performLogin(_ context.Context, credentials LoginCredentials) (map[string]interface{}, error) {
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
	atClaims["exp"] = time.Now().Add(loginExpiry).Unix()
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

func (c *PasswordAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, w http.ResponseWriter, r *http.Request, token string) (context.Context, error) {
	return updateContextWithJWTToken(ctx, token)
}

func (c *SimpleAuthClient) GetUser(_ context.Context, uid string) (*auth.UserRecord, error) {
	return &auth.UserRecord{
		UserInfo:      GetPasswordAuthUser(uid),
		EmailVerified: true,
	}, nil
}

func (c *SimpleAuthClient) SetupListeners(_ chi.Router) {}

func (c *SimpleAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, w http.ResponseWriter, r *http.Request, token string) (context.Context, error) {
	ctx = context.WithValue(ctx, model.ContextKeys.UID, "demo@example.com")
	ctx = context.WithValue(ctx, model.ContextKeys.Email, "demo@example.com")
	return ctx, nil
}

func (c *FirebaseAuthClient) GetUser(ctx context.Context, uid string) (*auth.UserRecord, error) {
	return c.authClient.GetUser(ctx, uid)
}

func (c *FirebaseAuthClient) SetupListeners(_ chi.Router) {}

func (c *FirebaseAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, w http.ResponseWriter, r *http.Request, token string) (context.Context, error) {
	var uid string
	email := ""
	if token != "" {
		t, err := c.authClient.VerifyIDToken(r.Context(), token)
		if err != nil {
			return ctx, e.Wrap(err, "invalid id token")
		}
		uid = t.UID
		if userRecord, err := c.authClient.GetUser(r.Context(), uid); err == nil {
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

func (c *OAuthAuthClient) getOAuthConfig(r *http.Request) *oauth2.Config {
	clientID := extractClientID(r)
	return c.oauthClients[clientID].oauthConfig
}

func (c *OAuthAuthClient) getOIDCProvider(r *http.Request) *oidc.Provider {
	clientID := extractClientID(r)
	return c.oauthClients[clientID].oidcProvider
}

func (c *OAuthAuthClient) getClientID(r *http.Request) string {
	clientID := extractClientID(r)
	return c.oauthClients[clientID].clientID
}

func (c *OAuthAuthClient) GetUser(ctx context.Context, uid string) (*auth.UserRecord, error) {
	userInfo, err := c.getUser(ctx, uid)
	if err != nil {
		return nil, err
	}

	return userInfo, nil
}

func (c *OAuthAuthClient) SetupListeners(r chi.Router) {
	log.WithContext(context.Background()).Info("configuring oauth server listeners")
	r.Get("/oauth/login", c.handleRedirect)
	r.Post("/oauth/logout", c.handleLogout)
	r.Get("/oauth/callback", c.handleOAuth2Callback)
	r.Get("/validate-token", c.validateToken)
}

func (c *OAuthAuthClient) setCallbackCookie(w http.ResponseWriter, r *http.Request, name, value string) {
	domain, err := env.GetFrontendDomain()
	if err != nil {
		log.WithContext(r.Context()).WithError(err).Error("error getting frontend domain")
	}
	cookie := &http.Cookie{
		Domain:   domain,
		Path:     "/",
		Name:     name,
		Value:    value,
		MaxAge:   int(loginExpiry.Seconds()),
		Expires:  time.Now().Add(loginExpiry),
		Secure:   r.TLS != nil,
		HttpOnly: name != oauthClientIDCookieName,
	}
	if value == "" {
		cookie.Expires = time.Unix(0, 0)
		cookie.MaxAge = -1
	}
	http.SetCookie(w, cookie)
}

func (c *OAuthAuthClient) validateToken(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()

	t, err := req.Cookie(tokenCookieName)
	if err != nil || t.Value == "" {
		log.WithContext(ctx).Error(e.New(loginError))
		http.Error(w, "", http.StatusUnauthorized)
		return
	}

	ctx, err = c.updateContextWithAuthenticatedUser(ctx, w, req, t.Value)
	if err != nil {
		log.WithContext(ctx).Error(e.New(loginError))
		http.Error(w, "", http.StatusUnauthorized)
		return
	}

	user, err := c.getUser(ctx, ctx.Value(model.ContextKeys.UID).(string))
	if err != nil {
		log.WithContext(ctx).Error(e.New(loginError))
		http.Error(w, "", http.StatusUnauthorized)
		return
	}

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

func (c *OAuthAuthClient) handleRedirect(w http.ResponseWriter, r *http.Request) {
	state := util.GenerateRandomString(32)
	c.setCallbackCookie(w, r, stateCookieName, state)

	clientID := extractClientID(r)
	c.setCallbackCookie(w, r, oauthClientIDCookieName, clientID)

	http.Redirect(w, r, c.getOAuthConfig(r).AuthCodeURL(state), http.StatusFound)
}

func (c *OAuthAuthClient) handleLogout(w http.ResponseWriter, req *http.Request) {
	if w != nil && req != nil {
		c.setCallbackCookie(w, req, stateCookieName, "")
		c.setCallbackCookie(w, req, tokenCookieName, "")
		c.setCallbackCookie(w, req, oauthClientIDCookieName, "")
		w.WriteHeader(http.StatusOK)
	}
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
	oauth2Token, err := c.getOAuthConfig(r).Exchange(ctx, r.URL.Query().Get("code"))
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to exchange oauth code")
		http.Error(w, oauthCallbackError, http.StatusBadRequest)
		return
	}

	userInfo, err := c.getOIDCProvider(r).UserInfo(ctx, oauth2.StaticTokenSource(oauth2Token))
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to get user info")
		http.Error(w, oauthCallbackError, http.StatusBadRequest)
		return
	}

	if err := c.storeUser(ctx, userInfo, r); err != nil {
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

	c.setCallbackCookie(w, r, tokenCookieName, rawIDToken)
	http.Redirect(w, r, fmt.Sprintf("%s/sign_in", env.Config.FrontendUri), http.StatusFound)

}

func (c *OAuthAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, w http.ResponseWriter, req *http.Request, token string) (context.Context, error) {
	// Parse and verify ID Token payload.
	clientID := c.getClientID(req)
	verifier := c.getOIDCProvider(req).Verifier(&oidc.Config{ClientID: clientID})
	idToken, err := verifier.Verify(ctx, token)
	if err != nil {
		log.WithContext(ctx).WithField("token", token).WithError(err).Info("invalid user token")
		c.handleLogout(w, req)
		return ctx, nil
	}

	// Extract claims
	var claims oidc.UserInfo
	if err := idToken.Claims(&claims); err != nil {
		log.WithContext(ctx).WithField("token", token).WithError(err).Info("invalid user claim")
		c.handleLogout(w, req)
		return ctx, nil
	}

	// check that the oidc email domain matches allowed domains
	_, err = mail.ParseEmail(claims.Email)
	if err != nil {
		return nil, err
	}
	parts := strings.Split(claims.Email, "@")
	domain := parts[1]

	var validated bool
	var domains = lo.Map(lo.Values(c.oauthClients), func(item *OAuthClient, _ int) string {
		return item.domain
	})
	for _, dom := range domains {
		if dom == domain {
			validated = true
			break
		}
		if patt, err := regexp.Compile(dom); err == nil && patt.MatchString(domain) {
			validated = true
			break
		}
	}
	if !validated {
		msg := fmt.Sprintf("user email %s does not match allowed domains", claims.Email)
		log.WithContext(ctx).WithField("allowed_domains", domains).Error(msg)
		return nil, e.New(msg)
	}

	ctx = context.WithValue(ctx, model.ContextKeys.UID, claims.Subject)
	ctx = context.WithValue(ctx, model.ContextKeys.Email, claims.Email)
	ctx = context.WithValue(ctx, model.ContextKeys.SSOClientID, clientID)
	return ctx, nil
}

func (c *OAuthAuthClient) storeUser(ctx context.Context, userInfo *oidc.UserInfo, r *http.Request) error {
	user := auth.UserRecord{
		UserInfo: &auth.UserInfo{
			UID:         userInfo.Subject,
			DisplayName: userInfo.Email,
			Email:       userInfo.Email,
			ProviderID:  c.getOIDCProvider(r).UserInfoEndpoint(),
		},
		EmailVerified: userInfo.EmailVerified,
	}
	if err := userInfo.Claims(&user); err != nil {
		return err
	}
	if err := userInfo.Claims(&user.CustomClaims); err != nil {
		return err
	}

	if user.UserInfo.PhotoURL == "" {
		if picture, ok := user.CustomClaims["picture"]; ok {
			user.UserInfo.PhotoURL, _ = picture.(string)
		}
	}

	if err := c.store.Redis.Cache.Set(&cache.Item{
		Ctx:   ctx,
		Key:   fmt.Sprintf(`user-%s`, user.UID),
		Value: &user,
		TTL:   loginExpiry,
	}); err != nil {
		return err
	}
	return nil
}

func (c *OAuthAuthClient) getUser(ctx context.Context, uid string) (*auth.UserRecord, error) {
	var userInfo auth.UserRecord
	if err := c.store.Redis.Cache.Get(ctx, fmt.Sprintf(`user-%s`, uid), &userInfo); err != nil {
		return nil, err
	}
	return &userInfo, nil
}

func NewFirebaseClient(ctx context.Context) *FirebaseAuthClient {
	secret := env.Config.AuthFirebaseSecret
	creds, err := google.CredentialsFromJSON(ctx, []byte(secret),
		"https://www.googleapis.com/auth/firebase",
		"https://www.googleapis.com/auth/identitytoolkit",
		"https://www.googleapis.com/auth/userinfo.email")
	if err != nil {
		log.WithContext(ctx).Errorf("error converting credentials from json: %v", err)
		return nil
	}
	app, err := firebase.NewApp(ctx, nil, option.WithCredentials(creds))
	if err != nil {
		log.WithContext(ctx).Errorf("error initializing firebase app: %v", err)
		return nil
	}
	// create a client to communicate with firebase project
	var client *auth.Client
	if client, err = app.Auth(ctx); err != nil {
		log.WithContext(ctx).Errorf("error creating firebase client: %v", err)
		return nil
	}
	return &FirebaseAuthClient{authClient: client}
}

func NewOAuthClient(ctx context.Context, store *store.Store) (*OAuthAuthClient, error) {
	// load sso clients. private graph must be reloaded when new clients are added
	ssoClients, err := store.GetSSOClients(ctx)
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("failed to load sso clients")
		return nil, err
	}

	oauthClients := make(map[string]*OAuthClient)
	for _, ssoClient := range ssoClients {
		log.WithContext(ctx).WithField("clientID", ssoClient.ClientID).Info("setting up oauth client")
		provider, err := oidc.NewProvider(ctx, ssoClient.ProviderURL)
		if err != nil {
			log.WithContext(ctx).WithError(err).Fatalf("failed to connect to oauth oidc provider")
		}

		// Configure an OpenID Connect aware OAuth2 client.
		oauth2Config := oauth2.Config{
			ClientID:     ssoClient.ClientID,
			ClientSecret: ssoClient.ClientSecret,
			RedirectURL:  env.Config.OAuthRedirectUrl,

			// Discovery returns the OAuth2 endpoints.
			Endpoint: provider.Endpoint(),

			// "openid" is a required scope for OpenID Connect flows.
			Scopes: []string{oidc.ScopeOpenID, "profile", "email"},
		}

		oauthClients[ssoClient.ClientID] = &OAuthClient{
			clientID:     ssoClient.ClientID,
			domain:       ssoClient.Domain,
			oidcProvider: provider,
			oauthConfig:  &oauth2Config,
		}
	}

	return &OAuthAuthClient{store, oauthClients}, nil
}

func authenticateToken(ctx context.Context, tokenString string) (jwt.MapClaims, error) {
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
		log.WithContext(ctx).WithField("token", tokenString).Info("expired user token")
		return nil, nil
	}

	return claims, nil
}

func updateContextWithJWTToken(ctx context.Context, token string) (context.Context, error) {
	var uid string
	email := ""

	if token != "" {
		claims, err := authenticateToken(ctx, token)
		if err != nil {
			return ctx, err
		}
		if claims == nil {
			return ctx, nil
		}

		email = claims["email"].(string)
		uid = claims["uid"].(string)
	}

	ctx = context.WithValue(ctx, model.ContextKeys.UID, uid)
	ctx = context.WithValue(ctx, model.ContextKeys.Email, email)
	return ctx, nil
}

func extractClientID(r *http.Request) string {
	if cookie, err := r.Cookie(oauthClientIDCookieName); err == nil && cookie.Value != "" {
		return cookie.Value
	}

	return ""
}
