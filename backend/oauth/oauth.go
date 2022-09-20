package oauth

import (
	"context"
	"encoding/json"
	"fmt"
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

type Server struct {
	srv *server.Server
	db  *gorm.DB
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
				UserID: client.UserID,
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
		srv: srv,
		db:  db,
	}
	srv.SetClientInfoHandler(s.ClientInfoHandler)
	srv.SetUserAuthorizationHandler(s.UserAuthorizationHandler)
	return s, nil
}
func (s *Server) UserAuthorizationHandler(_ http.ResponseWriter, r *http.Request) (userID string, err error) {
	uid := fmt.Sprintf("%v", r.Context().Value(model.ContextKeys.UID))
	admin := &model.Admin{UID: &uid}
	if err := s.db.Where(&model.Admin{UID: &uid}).First(&admin).Error; err != nil {
		return "", errors.ErrUnauthorizedClient
	}
	return fmt.Sprintf("%s:%s", *admin.UID, *admin.Email), nil
}

func (s *Server) ClientInfoHandler(r *http.Request) (clientID, clientSecret string, err error) {
	if id, secret, err := server.ClientBasicHandler(r); err == nil {
		return id, secret, nil
	}
	// single-page auth flow, per https://www.oauth.com/oauth2-servers/single-page-apps/
	id := r.URL.Query().Get("client_id")
	if id == "" {
		return "", "", errors.ErrInvalidClient
	}

	client := &model.OAuthClientStore{}
	if err := s.db.Model(&client).Where(&model.OAuthClientStore{ID: id}).First(&client).Error; err != nil {
		return "", "", errors.ErrInvalidClient
	}

	if client.ID == "" || client.Secret == "" {
		return "", "", errors.ErrInvalidClient
	}

	return client.ID, client.Secret, nil
}

func (s *Server) HandleTokenRequest(w http.ResponseWriter, r *http.Request) {
	err := s.srv.HandleTokenRequest(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
}

func (s *Server) HandleAuthorizeRequest(w http.ResponseWriter, r *http.Request) {
	err := s.srv.HandleAuthorizeRequest(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
}

func (s *Server) HandleValidate(w http.ResponseWriter, r *http.Request) {
	token, err := s.srv.ValidationBearerToken(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	data := map[string]interface{}{
		"expires_in": int64(time.Until(token.GetAccessCreateAt().Add(token.GetAccessExpiresIn())).Seconds()),
		"client_id":  token.GetClientID(),
		"user_id":    token.GetUserID(),
		"validated":  true,
	}
	je := json.NewEncoder(w)
	je.SetIndent("", "  ")
	_ = je.Encode(data)
}

func (s *Server) AuthContext(ctx context.Context, r *http.Request) (context.Context, error) {
	token, err := s.srv.ValidationBearerToken(r)
	if err != nil {
		return nil, errors.ErrUnauthorizedClient
	}
	parts := strings.Split(token.GetUserID(), ":")
	ctx = context.WithValue(ctx, model.ContextKeys.UID, parts[0])
	ctx = context.WithValue(ctx, model.ContextKeys.Email, parts[1])
	return ctx, nil
}
