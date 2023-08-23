package store

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"regexp"
	"strings"
	"time"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/integrations/github"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/stacktraces"
	log "github.com/sirupsen/logrus"
)

const GITHUB_ERROR_CONTEXT_LINES = 5
const MAX_ERROR_KILLSWITCH = 20
const MAX_ENHANCED_DEPTH = 5

func (store *Store) GitHubFilePath(ctx context.Context, fileName string, buildPrefix *string, gitHubPrefix *string) string {
	if buildPrefix != nil && gitHubPrefix != nil {
		return strings.Replace(fileName, *buildPrefix, *gitHubPrefix, 1)
	} else if buildPrefix != nil {
		return strings.Replace(fileName, *buildPrefix, "", 1)
	} else if gitHubPrefix != nil {
		return *gitHubPrefix + fileName
	}

	return fileName
}

func (store *Store) ExpandedStackTrace(ctx context.Context, lines []string, lineNumber int) (*string, *string, *string, error) {
	if lineNumber > len(lines) || lineNumber <= 0 {
		return nil, nil, nil, errors.New("Invalid line number")
	}

	minLine := int(math.Max(1, float64(lineNumber-GITHUB_ERROR_CONTEXT_LINES)))
	maxLine := int(math.Min(float64(len(lines)), float64(lineNumber+GITHUB_ERROR_CONTEXT_LINES)))
	renderedLines := lines[minLine-1 : maxLine]

	var lineContent, beforeContent, afterContent string
	for idx, line := range renderedLines {
		currentLine := idx + minLine

		if currentLine == lineNumber {
			lineContent = line
		} else if currentLine < lineNumber {
			beforeContent = beforeContent + "\n" + line
		} else if currentLine > lineNumber {
			afterContent = afterContent + "\n" + line
		}
	}

	return ptr.String(lineContent), ptr.String(strings.TrimPrefix(beforeContent, "\n")), ptr.String(strings.TrimPrefix(afterContent, "\n")), nil
}

func (store *Store) FetchFileFromGitHub(ctx context.Context, trace *privateModel.ErrorTrace, service *model.Service, fileName string, serviceVersion string, gitHubClient github.ClientInterface) (*string, error) {
	rateLimit, _ := store.redis.GetGithubRateLimitExceeded(ctx)
	if rateLimit {
		return nil, errors.New("Exceeded GitHub rate limit")
	}

	fileContent, _, resp, err := gitHubClient.GetRepoContent(ctx, *service.GithubRepoPath, fileName, serviceVersion)
	if resp != nil && resp.Rate.Remaining <= 0 {
		log.WithContext(ctx).Warn("GitHub rate limit hit")
		_ = store.redis.SetGithubRateLimitExceeded(ctx, resp.Rate.Reset.Time)
	}

	if err != nil {
		// put service in error state if too many errors occur within timeframe
		errorCount, _ := store.redis.IncrementServiceErrorCount(ctx, service.ID)
		if errorCount >= MAX_ERROR_KILLSWITCH {
			err = store.UpdateServiceErrorState(ctx, service.ID, []string{"Too many errors enhancing errors - Check service configuration."})
			if err != nil {
				return nil, err
			}
		}
		return nil, err
	}

	if fileContent == nil {
		return nil, fmt.Errorf("GitHub returned empty content for %s in %s", fileName, *service.GithubRepoPath)
	}

	encodedFileContent := fileContent.Content
	// some files are too large to fetch from the GitHub API so we fetch via a separate API request
	if *encodedFileContent == "" && fileContent.SHA != nil {
		blobContent, _, err := gitHubClient.GetRepoBlob(ctx, *service.GithubRepoPath, *fileContent.SHA)
		if err != nil {
			return nil, err
		}

		encodedFileContent = blobContent.Content
	}

	return encodedFileContent, nil
}

func (store *Store) GitHubGitSHA(ctx context.Context, gitHubRepoPath string, serviceVersion string, gitHubClient github.ClientInterface) (*string, error) {
	if regexp.MustCompile(`\b[0-9a-f]{5,40}\b`).MatchString(serviceVersion) {
		return &serviceVersion, nil
	}

	return redis.CachedEval(ctx, store.redis, fmt.Sprintf("git-main-hash-%s", gitHubRepoPath), 5*time.Second, 24*time.Hour, func() (*string, error) {
		commitSha, _, err := gitHubClient.GetLatestCommitHash(ctx, gitHubRepoPath)
		if err != nil {
			return nil, err
		}
		return &commitSha, nil
	})
}

func (store *Store) EnhanceTraceWithGitHub(ctx context.Context, trace *privateModel.ErrorTrace, service *model.Service, serviceVersion string, ignoredFiles []string, gitHubClient github.ClientInterface) (*privateModel.ErrorTrace, error) {
	if trace.FileName == nil || trace.LineNumber == nil {
		return trace, fmt.Errorf("Cannot enhance trace with GitHub with invalid values: %+v", trace)
	}

	fileName := store.GitHubFilePath(ctx, *trace.FileName, service.BuildPrefix, service.GithubPrefix)
	lineNumber := trace.LineNumber

	for _, fileExpr := range ignoredFiles {
		if regexp.MustCompile(fileExpr).MatchString(fileName) {
			return trace, nil
		}
	}

	gitHubFileBytes, err := store.storageClient.ReadGitHubFile(ctx, *service.GithubRepoPath, fileName, serviceVersion)

	if err != nil || gitHubFileBytes == nil {
		encodedFileContent, err := store.FetchFileFromGitHub(ctx, trace, service, fileName, serviceVersion, gitHubClient)
		if err != nil {
			return trace, err
		}

		gitHubFileBytes = []byte(*encodedFileContent)

		_, err = store.storageClient.PushGitHubFile(ctx, *service.GithubRepoPath, fileName, serviceVersion, gitHubFileBytes)
		if err != nil {
			log.WithContext(ctx).Error(err)
		}
	}

	gitHubFileString := string(gitHubFileBytes)
	rawDecodedText, err := base64.StdEncoding.DecodeString(gitHubFileString)
	if err != nil || len(rawDecodedText) == 0 {
		return trace, err
	}

	lines := strings.Split(string(rawDecodedText), "\n")
	lineContent, beforeContent, afterContent, err := store.ExpandedStackTrace(ctx, lines, *lineNumber)
	if err != nil {
		return trace, err
	}

	newStackTraceInput := privateModel.ErrorTrace{
		FileName:                   trace.FileName,
		LineNumber:                 trace.LineNumber,
		FunctionName:               trace.FunctionName,
		Error:                      trace.Error,
		SourceMappingErrorMetadata: trace.SourceMappingErrorMetadata,
		LineContent:                lineContent,
		LinesBefore:                beforeContent,
		LinesAfter:                 afterContent,
	}
	return &newStackTraceInput, nil
}

func (store *Store) GitHubEnhancedStakeTrace(ctx context.Context, stackTrace []*privateModel.ErrorTrace, workspace *model.Workspace, project *model.Project, errorObj *model.ErrorObject, serviceName string, serviceVersion string) ([]*privateModel.ErrorTrace, error) {
	if serviceName == "" {
		return nil, nil
	}

	service, err := store.FindService(ctx, project.ID, serviceName)
	if err != nil || service == nil || service.GithubRepoPath == nil || service.Status != "healthy" {
		return nil, err
	}

	gitHubAccessToken, err := store.integrationsClient.GetWorkspaceAccessToken(ctx, workspace, privateModel.IntegrationTypeGitHub)
	if err != nil || gitHubAccessToken == nil {
		return nil, err
	}

	client, err := github.NewClient(ctx, *gitHubAccessToken)
	if err != nil {
		return nil, err
	}

	validServiceVersion, err := store.GitHubGitSHA(ctx, *service.GithubRepoPath, serviceVersion, client)
	if err != nil {
		return nil, err
	}

	cfg, err := store.GetSystemConfiguration(ctx)
	if err != nil {
		return nil, err
	}

	newMappedStackTrace := []*privateModel.ErrorTrace{}
	for idx, trace := range stackTrace {
		if idx >= MAX_ENHANCED_DEPTH {
			newMappedStackTrace = append(newMappedStackTrace, trace)
			continue
		}

		enhancedTrace, err := store.EnhanceTraceWithGitHub(ctx, trace, service, *validServiceVersion, cfg.IgnoredFiles, client)
		if err != nil {
			log.WithContext(ctx).Error(err)
		}
		newMappedStackTrace = append(newMappedStackTrace, enhancedTrace)
	}

	return newMappedStackTrace, nil
}

func (store *Store) StructuredStackTrace(ctx context.Context, stackTrace string) ([]*privateModel.ErrorTrace, error) {
	var structuredStackTrace []*privateModel.ErrorTrace

	err := json.Unmarshal([]byte(stackTrace), &structuredStackTrace)
	if err != nil {
		return stacktraces.StructureOTELStackTrace(stackTrace)
	}

	return structuredStackTrace, err
}

func (store *Store) EnhancedStackTrace(ctx context.Context, stackTrace string, workspace *model.Workspace, project *model.Project, errorObj *model.ErrorObject, serviceName string, serviceVersion string) (*string, []*privateModel.ErrorTrace, error) {
	structuredStackTrace, err := store.StructuredStackTrace(ctx, stackTrace)
	if err != nil {
		return nil, structuredStackTrace, err
	}

	var newMappedStackTraceString *string
	mappedStackTrace, err := store.GitHubEnhancedStakeTrace(ctx, structuredStackTrace, workspace, project, errorObj, serviceName, serviceVersion)
	if err != nil || mappedStackTrace == nil {
		return nil, structuredStackTrace, err
	}

	mappedStackTraceBytes, err := json.Marshal(mappedStackTrace)
	if err != nil {
		return nil, structuredStackTrace, err
	}

	mappedStackTraceString := string(mappedStackTraceBytes)
	newMappedStackTraceString = &mappedStackTraceString
	return newMappedStackTraceString, mappedStackTrace, nil
}
