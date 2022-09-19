package oauth

import (
	"encoding/json"
	"github.com/go-oauth2/oauth2/v4"
	"github.com/go-oauth2/oauth2/v4/errors"
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
	"time"
)

type Server struct {
	srv *server.Server
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

	srv := server.NewDefaultServer(manager)
	srv.SetAllowGetAccessRequest(true)
	srv.SetAllowedGrantType(oauth2.AuthorizationCode)
	srv.SetAllowedResponseType(oauth2.Code)
	srv.SetClientInfoHandler(server.ClientBasicHandler)

	srv.SetInternalErrorHandler(func(err error) (re *errors.Response) {
		log.Errorf("Internal Error: %s", err.Error())
		return
	})

	srv.SetResponseErrorHandler(func(re *errors.Response) {
		log.Errorf("Response Error: %s", re.Error.Error())
	})

	srv.SetUserAuthorizationHandler(func(w http.ResponseWriter, r *http.Request) (userID string, err error) {
		return "oauth-client", nil
	})

	return &Server{
		srv: srv,
	}, nil
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
		"expires_in": int64(token.GetAccessCreateAt().Add(token.GetAccessExpiresIn()).Sub(time.Now()).Seconds()),
		"client_id":  token.GetClientID(),
		"user_id":    token.GetUserID(),
		"validated":  true,
	}
	je := json.NewEncoder(w)
	je.SetIndent("", "  ")
	_ = je.Encode(data)
}
