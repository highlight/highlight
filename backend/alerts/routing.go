package alerts

import (
	"fmt"
	"os"

	"github.com/highlight-run/highlight/backend/model"
)

func getErrorURL(errorAlert *model.ErrorAlert, errorGroup *model.ErrorGroup) string {
	projectId := errorAlert.ProjectID
	frontendURL := os.Getenv("FRONTEND_URI")

	return fmt.Sprintf("%s/%d/errors/%s", frontendURL, projectId, errorGroup.SecureID)
}

func getErrorResolveURL(errorAlert *model.ErrorAlert, errorGroup *model.ErrorGroup) string {
	projectId := errorAlert.ProjectID
	frontendURL := os.Getenv("FRONTEND_URI")

	return fmt.Sprintf("%s/%d/errors/%s?action=resolved", frontendURL, projectId, errorGroup.SecureID)
}

func getErrorIgnoreURL(errorAlert *model.ErrorAlert, errorGroup *model.ErrorGroup) string {
	projectId := errorAlert.ProjectID
	frontendURL := os.Getenv("FRONTEND_URI")

	return fmt.Sprintf("%s/%d/errors/%s?action=ignored", frontendURL, projectId, errorGroup.SecureID)
}

func getErrorSnoozeURL(errorAlert *model.ErrorAlert, errorGroup *model.ErrorGroup) string {
	projectId := errorAlert.ProjectID
	frontendURL := os.Getenv("FRONTEND_URI")

	return fmt.Sprintf("%s/%d/errors/%s?action=snooze", frontendURL, projectId, errorGroup.SecureID)
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
