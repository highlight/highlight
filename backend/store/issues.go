package store

import (
	"fmt"

	"github.com/aws/smithy-go/ptr"
)

const MAX_ISSUE_TITLE_LENGTH = 200

func (store *Store) BuildIssueTitleAndDescription(title string, description *string) (string, string) {
	var workingTitle, workingDescription string

	if len(title) > MAX_ISSUE_TITLE_LENGTH {
		workingTitle = fmt.Sprintf("%s...", (title)[:MAX_ISSUE_TITLE_LENGTH])
		workingDescription = fmt.Sprintf("...%s\n\n", (title)[MAX_ISSUE_TITLE_LENGTH:])
	} else {
		workingTitle = title
		workingDescription = ""
	}

	if ptr.ToString(description) != "" {
		workingDescription += fmt.Sprintf("%s\n\n", *description)
	}

	return workingTitle, workingDescription
}
