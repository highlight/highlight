package zapier

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"net/http"
	"time"

	"gorm.io/gorm"

	"github.com/dchest/uniuri"
	"github.com/go-chi/chi"
	"github.com/golang-jwt/jwt"
	"github.com/highlight-run/go-resthooks"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
)

func getProjectForToken(parsedToken *ParsedZapierToken, db *gorm.DB) (*model.Project, error) {
	project := model.Project{}

	if err := db.Where(&model.Project{Model: model.Model{ID: parsedToken.ProjectID}}).Take(&project).Error; err != nil {
		return nil, e.Wrap(err, "error querying project")
	}

	return &project, nil
}

func SetupZapierAuthContextMiddleware(db *gorm.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authToken := r.Header.Get("Authorization")

			parsedToken, err := ParseZapierAccessToken(authToken)

			if err != nil {
				log.WithContext(context.TODO()).Error("Error parsing authorization jwt: ", err)
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			project, err := getProjectForToken(parsedToken, db)
			if err != nil {
				log.WithContext(context.TODO()).Error("Error getting project from authorization: ", err)
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), model.ContextKeys.ZapierToken, parsedToken)
			ctx = context.WithValue(ctx, model.ContextKeys.ZapierProject, project)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

type HookPayload struct {
	// UserIdentifier is a required parameter for New User, Error, and SessionFeedback alerts
	UserIdentifier string `json:"user_identifier"`
	// UserObject is a required parameter for alerts that relate to a session
	UserObject model.JSONB `json:"user_object"`
	// Group is a required parameter for Error alerts
	Group *model.ErrorGroup `json:"group"`
	// URL is an optional parameter for Error alerts
	URL *string `json:"url"`
	// ErrorsCount is a required parameter for Error alerts
	ErrorsCount *int64 `json:"errors_count"`
	// MatchedFields is a required parameter for Track Properties and User Properties alerts
	MatchedFields []*model.Field `json:"matched_fields"`
	// RelatedFields is an optional parameter for Track Properties and User Properties alerts
	RelatedFields []*model.Field `json:"related_fields"`
	// UserProperties is a required parameter for User Properties alerts
	UserProperties map[string]string `json:"user_properties"`
	// CommentID is a required parameter for SessionFeedback alerts
	CommentID *int `json:"comment_id"`
	// CommentText is a required parameter for SessionFeedback alerts
	CommentText string `json:"comment_text"`
	// RageClicksCount is a required parameter for Rage Click Alerts
	RageClicksCount *int64 `json:"rage_clicks_count"`
	// MetricValue is a required parameter for MetricMonitor alerts
	MetricValue *float64 `json:"metric_value"`
	// MetricValue is a required parameter for MetricMonitor alerts
	MetricThreshold *float64 `json:"metric_threshold"`
	// Timestamp is an optional value for all session alerts.
	Timestamp *time.Time `json:"timestamp"`
}

func RequireValidZapierAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		parsedToken := r.Context().Value(model.ContextKeys.ZapierToken).(*ParsedZapierToken)
		project := r.Context().Value(model.ContextKeys.ZapierProject).(*model.Project)

		if *project.ZapierAccessToken != parsedToken.Magic {
			log.WithContext(context.TODO()).Error("Access token magic does not match")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func CreateZapierRoutes(r chi.Router, db *gorm.DB, store *ZapierResthookStore, rh *resthooks.Resthook) {
	r.Use(SetupZapierAuthContextMiddleware(db))
	r.Get("/initialize", func(w http.ResponseWriter, r *http.Request) {
		parsedToken := r.Context().Value(model.ContextKeys.ZapierToken).(*ParsedZapierToken)
		project := r.Context().Value(model.ContextKeys.ZapierProject).(*model.Project)

		if project.ZapierAccessToken != nil && *project.ZapierAccessToken != "" && *project.ZapierAccessToken != parsedToken.Magic {
			log.WithContext(context.TODO()).Error("Access token magic does not match (and is not empty): ")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if project.ZapierAccessToken == nil || *project.ZapierAccessToken == "" {
			project.ZapierAccessToken = &parsedToken.Magic
			if err := db.Save(project).Error; err != nil {
				log.WithContext(context.TODO()).Error("Error saving project with new access token: ", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
		}

		type IntializeResponse struct {
			ProjectID   int    `json:"project_id"`
			ProjectName string `json:"project_name"`
		}

		res := IntializeResponse{
			ProjectID:   project.ID,
			ProjectName: *project.Name,
		}

		w.WriteHeader(http.StatusOK)
		w.Header().Add("Content-Type", "application/json")

		if err := json.NewEncoder(w).Encode(res); err != nil {
			log.WithContext(context.TODO()).Error("Error sending json response: ", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	})

	r.Route("/project-alerts", func(r chi.Router) {
		r.Use(RequireValidZapierAuth)
		r.Get("/", func(w http.ResponseWriter, r *http.Request) {
			project := r.Context().Value(model.ContextKeys.ZapierProject).(*model.Project)

			type AlertEntry struct {
				ID        int    `json:"id"`
				AlertType string `json:"alert_type"`
				Name      string `json:"name"`
				ProjectID int    `json:"project_id"`
			}

			alertEntries := []AlertEntry{}

			if err := db.Raw(`
				SELECT 'SessionAlert' AS alert_type, id, name, project_id FROM session_alerts WHERE project_id = ?
				UNION ALL SELECT 'ErrorAlert' AS alert_type, id, name, project_id FROM error_alerts WHERE project_id = ?
				UNION ALL select 'MetricMonitor' AS alert_type, id, name, project_id FROM metric_monitors WHERE project_id = ?;
			`, project.ID, project.ID, project.ID).Scan(&alertEntries).Error; err != nil {
				log.WithContext(context.TODO()).Error("Error querying alerts: ", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusOK)
			w.Header().Add("Content-Type", "application/json")

			if err := json.NewEncoder(w).Encode(alertEntries); err != nil {
				log.WithContext(context.TODO()).Error("Error sending json response: ", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

		})
	})

	r.Route("/hooks", func(r chi.Router) {
		r.Use(RequireValidZapierAuth)
		r.Handle("/*", rh.Handler())
	})
}

func GenerateZapierAccessToken(projectId int) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"project_id": projectId,
		"magic":      uniuri.New(), // this will be stored in the server to validate token and allow us to invalidate later
	})

	return token.SignedString([]byte(env.Config.ZapierIntegrationSigningKey))
}

type ParsedZapierToken struct {
	Magic     string `json:"magic"`
	ProjectID int    `json:"project_id"`
}

func ParseZapierAccessToken(token string) (*ParsedZapierToken, error) {
	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(env.Config.ZapierIntegrationSigningKey), nil
	})

	if err != nil {
		return nil, err
	}

	if !parsedToken.Valid {
		return nil, fmt.Errorf("Zapier access token is not valid")
	}

	claims := parsedToken.Claims.(jwt.MapClaims)

	magic := claims["magic"]
	project_id := claims["project_id"]

	payload := ParsedZapierToken{
		Magic:     magic.(string),
		ProjectID: int(project_id.(float64)),
	}

	return &payload, nil
}
