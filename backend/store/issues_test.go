package store

import (
	"testing"

	"github.com/aws/smithy-go/ptr"
	"github.com/stretchr/testify/assert"
)

func TestBuildIssueTitleAndDescription(t *testing.T) {
	defer teardown(t)
	var tests = []struct {
		Title               string
		Description         *string
		ExpectedTitle       string
		ExpectedDescription string
	}{
		{
			Title:               "This is a title",
			Description:         ptr.String("This is a description"),
			ExpectedTitle:       "This is a title",
			ExpectedDescription: "This is a description\n\n",
		},
		{
			Title:               "This is a title",
			ExpectedTitle:       "This is a title",
			ExpectedDescription: "",
		},
		{
			Title:               "This is a title",
			Description:         ptr.String(""),
			ExpectedTitle:       "This is a title",
			ExpectedDescription: "",
		},
		{
			Title:               "This is a really long title (more than 200 characters): Nuremberg is the second-largest city of the German state of Bavaria after its capital Munich, and its 541,000 inhabitants make it the 14th-largest city in Germany.",
			ExpectedTitle:       "This is a really long title (more than 200 characters): Nuremberg is the second-largest city of the German state of Bavaria after its capital Munich, and its 541,000 inhabitants make it the 14th-large...",
			ExpectedDescription: "...st city in Germany.\n\n",
		},
		{
			Title:               "This is a really long title (more than 200 characters): Nuremberg is the second-largest city of the German state of Bavaria after its capital Munich, and its 541,000 inhabitants make it the 14th-largest city in Germany.",
			Description:         ptr.String("This is a description"),
			ExpectedTitle:       "This is a really long title (more than 200 characters): Nuremberg is the second-largest city of the German state of Bavaria after its capital Munich, and its 541,000 inhabitants make it the 14th-large...",
			ExpectedDescription: "...st city in Germany.\n\nThis is a description\n\n",
		},
	}

	for _, tt := range tests {
		title, desc := store.BuildIssueTitleAndDescription(tt.Title, tt.Description)
		assert.Equal(t, tt.ExpectedTitle, title)
		assert.Equal(t, tt.ExpectedDescription, desc)
	}
}
