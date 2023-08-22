package store

import (
	"context"
	"testing"

	"github.com/aws/smithy-go/ptr"
	"github.com/stretchr/testify/assert"
)

func TestGitHubFilePath(t *testing.T) {
	defer teardown(t)
	var tests = []struct {
		FileName     string
		BuildPrefix  *string
		GitHubPrefix *string
		Expected     string
	}{
		{
			FileName:     "/build/backend/util/tracer.go",
			BuildPrefix:  ptr.String("/build"),
			GitHubPrefix: ptr.String("/src"),
			Expected:     "/src/backend/util/tracer.go",
		},
		{
			FileName:    "/build/backend/util/tracer.go",
			BuildPrefix: ptr.String("/build"),
			Expected:    "/backend/util/tracer.go",
		},
		{
			FileName:     "/build/backend/util/tracer.go",
			GitHubPrefix: ptr.String("/src"),
			Expected:     "/src/build/backend/util/tracer.go",
		},
		{
			FileName: "/build/backend/util/tracer.go",
			Expected: "/build/backend/util/tracer.go",
		},
		{
			FileName:     "/build/backend/util/tracer.go",
			BuildPrefix:  ptr.String("/foo"),
			GitHubPrefix: ptr.String("/bar"),
			Expected:     "/build/backend/util/tracer.go",
		},
		{
			FileName:    "/build/backend/util/tracer.go",
			BuildPrefix: ptr.String("/foo"),
			Expected:    "/build/backend/util/tracer.go",
		},
	}

	ctx := context.Background()
	for _, tt := range tests {
		newPath := store.GitHubFilePath(ctx, tt.FileName, tt.BuildPrefix, tt.GitHubPrefix)
		assert.Equal(t, tt.Expected, newPath)
	}
}

func TestExpandedStackTrace(t *testing.T) {
	defer teardown(t)
	lines := []string{"b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "s", "v", "w", "x", "y", "z"}
	var tests = []struct {
		LineNumber      int
		ExpectedContent string
		ExpectedBefore  string
		ExpectedAfter   string
		ExpectedError   bool
	}{
		{
			LineNumber:      7,
			ExpectedContent: "h",
			ExpectedBefore:  "c\nd\ne\nf\ng",
			ExpectedAfter:   "i\nj\nk\nl\nm",
			ExpectedError:   false,
		},
		{
			LineNumber:      2,
			ExpectedContent: "c",
			ExpectedBefore:  "b",
			ExpectedAfter:   "d\ne\nf\ng\nh",
			ExpectedError:   false,
		},
		{
			LineNumber:      21,
			ExpectedContent: "z",
			ExpectedBefore:  "s\nv\nw\nx\ny",
			ExpectedAfter:   "",
			ExpectedError:   false,
		},
	}

	ctx := context.Background()
	for _, tt := range tests {
		content, before, after, err := store.ExpandedStackTrace(ctx, lines, tt.LineNumber)
		assert.Equal(t, tt.ExpectedContent, *content)
		assert.Equal(t, tt.ExpectedBefore, *before)
		assert.Equal(t, tt.ExpectedAfter, *after)
		if tt.ExpectedError {
			assert.Error(t, err)
		} else {
			assert.NoError(t, err)
		}
	}
}

// func TestFetchFileFromGitHub(t *testing.T) {
// 	defer teardown(t)
// 	var tests = []struct {
// 		Trace              *privateModel.ErrorTrace
// 		Service            *model.Service
// 		FileName           string
// 		ServiceVersion     string
// 		GitHubClient       *github.Client
// 		ExpectedStackTrace string
// 		ExpectedError      bool
// 	}{
// 		{
// 			Trace: []modelInput.ErrorTrace{
// 				{
// 					FileName:     ptr.String("lodash.js"),
// 					LineNumber:   ptr.Int(634),
// 					ColumnNumber: ptr.Int(4),
// 					FunctionName: ptr.String(""),
// 				},
// 				{
// 					FileName:     ptr.String("lodash.js"),
// 					LineNumber:   ptr.Int(633),
// 					ColumnNumber: ptr.Int(11),
// 					FunctionName: ptr.String("arrayIncludesWith"),
// 				},
// 				{
// 					FileName:     ptr.String("pages/Buttons/Buttons.tsx"),
// 					LineNumber:   ptr.Int(13),
// 					ColumnNumber: ptr.Int(30),
// 					LineContent:  ptr.String("                        throw new Error('errors page');\n"),
// 					FunctionName: ptr.String(""),
// 					LinesBefore:  ptr.String("        <div className={styles.buttonBody}>\n            <div>\n                <button\n                    className={commonStyles.submitButton}\n                    onClick={() => {\n"),
// 					LinesAfter:   ptr.String("                    }}\n                >\n                    Throw an Error\n                </button>\n                <button\n"),
// 				},
// 			},
// 			Service: &model.Service{
// 				ID: 1,
// 				GithubRepoPath: "highlight/highlight",
// 			},
// 		}
// 	}

// 	ctx := context.Background()
// 	for _, tt := range tests {
// 		stackTrace, err := store.FetchFileFromGitHub(ctx, tt.Trace, tt.Service, tt.FileName, tt.ServiceVersion, tt.GitHubClient)
// 		assert.Equal(t, tt.ExpectedStackTrace, stackTrace)
// 		if tt.ExpectedError {
// 			assert.Error(t, err)
// 		} else {
// 			assert.NoError(t, err)
// 		}
// 	}
// }

// func TestEnhanceTraceWithGitHub(t *testing.T) {
// 	defer teardown(t)
// 	store.EnhanceTraceWithGitHub(context.Background())
// 	assert.NoError(t, err)
// }

// func TestGitHubGitSHA(t *testing.T) {
// 	defer teardown(t)
// 	store.GitHubGitSHA(context.Background())
// 	assert.NoError(t, err)
// }

// func TestGitHubEnhancedStakeTrace(t *testing.T) {
// 	defer teardown(t)
// 	store.GitHubEnhancedStakeTrace(context.Background())
// 	assert.NoError(t, err)
// }

// func TestStructuredStackTrace(t *testing.T) {
// 	defer teardown(t)
// 	store.StructuredStackTrace(context.Background())
// 	assert.NoError(t, err)
// }

// func TestEnhancedStackTrace(t *testing.T) {
// 	defer teardown(t)
// 	store.EnhancedStackTrace(context.Background())
// 	assert.NoError(t, err)
// }
