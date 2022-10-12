package oauth

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/go-oauth2/oauth2/v4"
	"github.com/go-oauth2/oauth2/v4/errors"
	"github.com/go-oauth2/oauth2/v4/generates"
	"github.com/go-oauth2/oauth2/v4/manage"
	"github.com/go-oauth2/oauth2/v4/models"
	"github.com/go-oauth2/oauth2/v4/server"
	"github.com/go-oauth2/oauth2/v4/store"
	oredis "github.com/go-oauth2/redis/v4"
	"github.com/go-redis/redis/v8"
	"github.com/highlight-run/highlight/backend/model"
	hredis "github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
	"strings"
	"time"
)

const CookieName = "highlightOAuth"
const CookieRefreshThreshold = 15 * time.Minute

type Server struct {
	srv          *server.Server
	db           *gorm.DB
	tokenManager *manage.Manager
	clientStore  *store.ClientStore
}

type Token struct {
	AccessToken  string
	ExpiresIn    int64
	Scope        string
	RefreshToken string
}

func getTokenStore() *oredis.TokenStore {
	// use redis token store
	if util.IsDevOrTestEnv() {
		return oredis.NewRedisStore(&redis.Options{
			Addr: hredis.ServerAddr,
		})
	}

	// use redis cluster store
	return oredis.NewRedisClusterStore(&redis.ClusterOptions{
		Addrs: []string{hredis.ServerAddr},
	})
}

func (s *Server) getClientSecret(clientID string) (clientSecret string, err error) {
	client := &model.OAuthClientStore{}
	if err := s.db.Model(&client).Where(&model.OAuthClientStore{ID: clientID}).First(&client).Error; err != nil {
		return "", errors.ErrInvalidClient
	}

	if client.ID == "" || client.Secret == "" {
		return "", errors.ErrInvalidClient
	}

	return client.Secret, nil
}

func (s *Server) getTokenFromCookie(ctx context.Context, cookie *http.Cookie) (oauth2.TokenInfo, error) {
	data, err := base64.StdEncoding.DecodeString(cookie.Value)
	if err != nil {
		return nil, err
	}
	var token Token
	if err := json.Unmarshal(data, &token); err != nil {
		return nil, err
	}
	tokenInfo, err := s.tokenManager.LoadAccessToken(ctx, token.AccessToken)
	if err != nil {
		return nil, err
	}
	return tokenInfo, nil
}

func CreateServer(db *gorm.DB) (*Server, error) {
	manager := manage.NewDefaultManager()

	// token redis store
	manager.MapTokenStorage(getTokenStore())

	// client memory store
	clientStore := store.NewClientStore()
	var clients []*model.OAuthClientStore
	if err := db.Model(&model.OAuthClientStore{}).Scan(&clients).Error; err != nil {
		return nil, e.Wrap(err, "failed to get oauth client store from db")
	}
	for _, client := range clients {
		for _, uri := range client.Domains {
			log.Infof("adding oauth client %s", client.ID)
			err := clientStore.Set(client.ID, &models.Client{
				ID:     client.ID,
				Secret: client.Secret,
				Domain: uri,
			})
			if err != nil {
				return nil, e.Wrapf(err, "failed to set oauth client store entry %s", client.ID)
			}
		}
	}
	manager.MapClientStorage(clientStore)
	manager.MapAccessGenerate(generates.NewAccessGenerate())

	srv := server.NewDefaultServer(manager)
	srv.SetAllowGetAccessRequest(true)

	srv.SetInternalErrorHandler(func(err error) (re *errors.Response) {
		log.Errorf("Internal Error: %s", err.Error())
		return
	})

	srv.SetResponseErrorHandler(func(re *errors.Response) {
		log.Errorf("Response Error: %s", re.Error.Error())
	})

	s := &Server{
		tokenManager: manager,
		clientStore:  clientStore,
		srv:          srv,
		db:           db,
	}
	srv.SetClientInfoHandler(s.ClientInfoHandler)
	srv.SetUserAuthorizationHandler(s.UserAuthorizationHandler)
	return s, nil
}

// UserAuthorizationHandler provides the user ID for further `model.Admin` resolution based on
// the firebase session. This method is used during the OAuth token creation to associate
// a token with the firebase user.
func (s *Server) UserAuthorizationHandler(_ http.ResponseWriter, r *http.Request) (userID string, err error) {
	uid := fmt.Sprintf("%v", r.Context().Value(model.ContextKeys.UID))
	admin := &model.Admin{UID: &uid}
	if err := s.db.Where(&model.Admin{UID: &uid}).First(&admin).Error; err != nil {
		return "", errors.ErrUnauthorizedClient
	}
	return fmt.Sprintf("%s:%s", *admin.UID, *admin.Email), nil
}

// ClientInfoHandler provides the clientID and clientSecret based on the request. The data
// either exists in the `Authorization` header or in a query parameter for SPAs where the
// secret must be retrieved from our database.
func (s *Server) ClientInfoHandler(r *http.Request) (clientID, clientSecret string, err error) {
	if clientID, clientSecret, err = server.ClientBasicHandler(r); err == nil {
		return
	}
	// single-page auth flow, per https://www.oauth.com/oauth2-servers/single-page-apps/
	clientID = r.URL.Query().Get("client_id")
	if clientID == "" {
		return "", "", errors.ErrInvalidClient
	}

	clientSecret, err = s.getClientSecret(clientID)
	return
}

// HandleRevoke will revoke the oauth token for header or cookie authentication.
func (s *Server) HandleRevoke(w http.ResponseWriter, r *http.Request) {
	ctx, token, _, err := s.Validate(context.Background(), r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	err = s.tokenManager.RemoveAccessToken(ctx, token.GetAccess())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	err = s.tokenManager.RemoveRefreshToken(ctx, token.GetRefresh())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// HandleTokenRequest will process a request for oauth /token command per the RFC spec.
func (s *Server) HandleTokenRequest(w http.ResponseWriter, r *http.Request) {
	err := s.srv.HandleTokenRequest(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
}

// HandleAuthorizeRequest will process a request for oauth /authorize command per the RFC spec.
func (s *Server) HandleAuthorizeRequest(w http.ResponseWriter, r *http.Request) {
	err := s.srv.HandleAuthorizeRequest(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
}

// HandleValidate will ensure the request authorization is valid and return oauth session metadata.
func (s *Server) HandleValidate(w http.ResponseWriter, r *http.Request) {
	_, token, cookie, err := s.Validate(context.Background(), r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	http.SetCookie(w, cookie)

	data := map[string]interface{}{
		"expires_in": int64(token.GetAccessExpiresIn().Seconds()),
		"client_id":  token.GetClientID(),
		"user_id":    token.GetUserID(),
		"validated":  true,
	}
	je := json.NewEncoder(w)
	je.SetIndent("", "  ")
	_ = je.Encode(data)
}

func (s *Server) HasCookie(r *http.Request) bool {
	if cookie, err := r.Cookie(CookieName); err == nil {
		return cookie.Value != ""
	}
	return false
}

// Validate ensures the request is authenticated and configures the context to contain
// necessary authorization context variables. the function returns the auth token cookie,
// refreshed if applicable.
func (s *Server) Validate(ctx context.Context, r *http.Request) (context.Context, oauth2.TokenInfo, *http.Cookie, error) {
	var token oauth2.TokenInfo
	if cookie, err := r.Cookie(CookieName); err == nil {
		ctx, token, err = s.authCookieContext(ctx, cookie, r)
		if err != nil {
			return ctx, nil, nil, err
		}
	} else {
		ctx, token, err = s.authContext(ctx, r)
		if err != nil {
			return ctx, nil, nil, err
		}
	}
	expirySeconds := token.GetAccessExpiresIn().Seconds()
	cookieData, err := json.Marshal(&Token{
		AccessToken:  token.GetAccess(),
		ExpiresIn:    int64(expirySeconds),
		Scope:        token.GetScope(),
		RefreshToken: token.GetRefresh(),
	})
	if err != nil {
		return ctx, nil, nil, err
	}
	domain := ".highlight.run"
	if util.IsDevEnv() {
		domain = ".highlight.localhost"
	}
	cookie := http.Cookie{
		Name:     CookieName,
		Value:    base64.StdEncoding.EncodeToString(cookieData),
		MaxAge:   int(expirySeconds),
		Domain:   domain,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
	}
	return ctx, token, &cookie, nil
}

// AuthContext sets the context to the login session of the bearer Authorization token provided
func (s *Server) authContext(ctx context.Context, r *http.Request) (context.Context, oauth2.TokenInfo, error) {
	token, err := s.srv.ValidationBearerToken(r)
	if err != nil {
		return nil, nil, err
	}
	parts := strings.Split(token.GetUserID(), ":")
	ctx = context.WithValue(ctx, model.ContextKeys.UID, parts[0])
	ctx = context.WithValue(ctx, model.ContextKeys.Email, parts[1])
	return ctx, token, nil
}

// AuthCookieContext configures the context based on the login session of the oauth token provided.
func (s *Server) authCookieContext(ctx context.Context, tokenCookie *http.Cookie, r *http.Request) (context.Context, oauth2.TokenInfo, error) {
	tokenInfo, err := s.getTokenFromCookie(ctx, tokenCookie)
	if err != nil {
		return nil, nil, err
	}
	if tokenInfo.GetAccessExpiresIn() < CookieRefreshThreshold {
		clientID := tokenInfo.GetClientID()
		clientSecret, err := s.getClientSecret(clientID)
		if err != nil {
			return nil, nil, err
		}
		tgr := &oauth2.TokenGenerateRequest{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			Request:      r,
		}
		if tokenInfo, err = s.tokenManager.RefreshAccessToken(ctx, tgr); err != nil {
			return nil, nil, err
		}
	}

	parts := strings.Split(tokenInfo.GetUserID(), ":")
	ctx = context.WithValue(ctx, model.ContextKeys.UID, parts[0])
	ctx = context.WithValue(ctx, model.ContextKeys.Email, parts[1])
	return ctx, tokenInfo, nil
}
