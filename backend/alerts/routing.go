package alerts

import (
	"context"
	"fmt"
	"net/url"
	"os"

	"github.com/highlight-run/highlight/backend/model"
	log "github.com/sirupsen/logrus"
)

type Referrer string

const (
	Discord Referrer = "discord"
	Webhook Referrer = "webhook"
)

func getErrorURL(errorAlert *model.ErrorAlert, errorGroup *model.ErrorGroup, errorObject *model.ErrorObject) string {
	projectId := errorAlert.ProjectID
	frontendURL := os.Getenv("FRONTEND_URI")

	return fmt.Sprintf("%s/%d/errors/%s/instances/%d", frontendURL, projectId, errorGroup.SecureID, errorObject.ID)
}

func getErrorResolveURL(errorAlert *model.ErrorAlert, errorGroup *model.ErrorGroup, errorObject *model.ErrorObject) string {
	projectId := errorAlert.ProjectID
	frontendURL := os.Getenv("FRONTEND_URI")

	return fmt.Sprintf("%s/%d/errors/%s/instances/%d?action=resolved", frontendURL, projectId, errorGroup.SecureID, errorObject.ID)
}

func getErrorIgnoreURL(errorAlert *model.ErrorAlert, errorGroup *model.ErrorGroup, errorObject *model.ErrorObject) string {
	projectId := errorAlert.ProjectID
	frontendURL := os.Getenv("FRONTEND_URI")

	return fmt.Sprintf("%s/%d/errors/%s/instances/%d?action=ignored", frontendURL, projectId, errorGroup.SecureID, errorObject.ID)
}

func getErrorSnoozeURL(errorAlert *model.ErrorAlert, errorGroup *model.ErrorGroup, errorObject *model.ErrorObject) string {
	projectId := errorAlert.ProjectID
	frontendURL := os.Getenv("FRONTEND_URI")

	return fmt.Sprintf("%s/%d/errors/%s/instances/%d?action=snooze", frontendURL, projectId, errorGroup.SecureID, errorObject.ID)
}

func getSessionURL(projectID int, session *model.Session) string {
	frontendURL := os.Getenv("FRONTEND_URI")
	return fmt.Sprintf("%s/%d/sessions/%s", frontendURL, projectID, session.SecureID)
}

func getSessionCommentURL(projectID int, session *model.Session, sessionComment *model.SessionComment) string {
	sessionURL := getSessionURL(projectID, session)

	return fmt.Sprintf("%s/commentId=%d", sessionURL, sessionComment.ID)
}

func getMonitorURL(metricMonitor *model.MetricMonitor) string {
	frontendURL := os.Getenv("FRONTEND_URI")
	return fmt.Sprintf("%s/%d/alerts/monitors/%d", frontendURL, metricMonitor.ProjectID, metricMonitor.ID)
}

func attachReferrer(ctx context.Context, u string, referrer Referrer) string {
	url, err := url.Parse(u)
	if err != nil {
		log.WithContext(ctx).Errorf("Failed to parse url: %s", u)
		log.WithContext(ctx).Error(err)
		return u
	}

	values := url.Query()
	values.Add("referrer", string(referrer))
	url.RawQuery = values.Encode()

	return url.String()
}
