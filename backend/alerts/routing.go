package alerts

import (
	"fmt"
	"os"

	"github.com/highlight-run/highlight/backend/model"
)

func getErrorsURL(errorAlert *model.ErrorAlert, errorGroup *model.ErrorGroup) string {
	projectId := errorAlert.ProjectID
	frontendURL := os.Getenv("FRONTEND_URI")

	return fmt.Sprintf("%s/%d/errors/%s", frontendURL, projectId, errorGroup.SecureID)
}

func getSessionsURL(sessionAlert *model.SessionAlert, session *model.Session) string {
	projectId := sessionAlert.ProjectID
	frontendURL := os.Getenv("FRONTEND_URI")

	return fmt.Sprintf("%s/%d/sessions/%s", frontendURL, projectId, session.SecureID)
}
