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

func getSessionsURL(projectID int, session *model.Session) string {
	frontendURL := os.Getenv("FRONTEND_URI")
	return fmt.Sprintf("%s/%d/sessions/%s", frontendURL, projectID, session.SecureID)
}

func getSessionCommentURL(projectID int, session *model.Session, sessionComment *model.SessionComment) string {
	sessionURL := getSessionsURL(projectID, session)

	return fmt.Sprintf("%s/commentId=%d", sessionURL, sessionComment.ID)
}
