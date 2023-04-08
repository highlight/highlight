package alerts

import (
	"fmt"
	"os"

	"github.com/highlight-run/highlight/backend/model"
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

func getLogAlertURL(alert *model.LogAlert) string {
	frontendURL := os.Getenv("FRONTEND_URI")
	return fmt.Sprintf("%s/%d/alerts/logs/%d", frontendURL, alert.ProjectID, alert.ID)
}
