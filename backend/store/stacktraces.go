package store

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math"
	"regexp"
	"strings"
	"time"

	"github.com/pkg/errors"

	"github.com/aws/smithy-go/ptr"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/integrations/github"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/stacktraces"
	"github.com/highlight-run/highlight/backend/util"
)

const GITHUB_ERROR_CONTEXT_LINES = 5
const MAX_ERROR_KILLSWITCH = 5

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
	rateLimit, _ := store.Redis.GetGithubRateLimitExceeded(ctx, *service.GithubRepoPath)
	if rateLimit {
		return nil, errors.New("Exceeded GitHub rate limit")
	}

	fileContent, _, resp, err := gitHubClient.GetRepoContent(ctx, *service.GithubRepoPath, fileName, serviceVersion)
	if resp != nil && resp.Rate.Remaining <= 0 {
		log.WithContext(ctx).WithField("GitHub Repo", *service.GithubRepoPath).Warn("GitHub rate limit hit")
		_ = store.Redis.SetGithubRateLimitExceeded(ctx, *service.GithubRepoPath, resp.Rate.Reset.Time)
	}
	if err != nil {
		return nil, err
	}

	var encodedFileContent *string
	if fileContent != nil {
		encodedFileContent = fileContent.Content
		// some files are too large to fetch from the GitHub API so we fetch via a separate API request
		if *encodedFileContent == "" && fileContent.SHA != nil {
			blobContent, _, err := gitHubClient.GetRepoBlob(ctx, *service.GithubRepoPath, *fileContent.SHA)
			if err != nil {
				return nil, err
			}

			encodedFileContent = blobContent.Content
		}
	}

	return encodedFileContent, nil
}

func (store *Store) GitHubGitSHA(ctx context.Context, gitHubRepoPath string, serviceVersion string, gitHubClient github.ClientInterface) (*string, error) {
	if regexp.MustCompile(`^[0-9a-f]{5,40}$`).MatchString(serviceVersion) {
		return &serviceVersion, nil
	}

	return redis.CachedEval(ctx, store.Redis, fmt.Sprintf("git-main-hash-%s", gitHubRepoPath), 5*time.Second, 24*time.Hour, func() (*string, error) {
		commitSha, _, err := gitHubClient.GetLatestCommitHash(ctx, gitHubRepoPath)
		if err != nil {
			return nil, err
		}
		return &commitSha, nil
	})
}

func (store *Store) EnhanceTraceWithGitHub(ctx context.Context, trace *privateModel.ErrorTrace, service *model.Service, serviceVersion string, fileName string, gitHubClient github.ClientInterface) (*privateModel.ErrorTrace, error) {
	lineNumber := trace.LineNumber
	gitHubFileBytes, err := store.StorageClient.ReadGitHubFile(ctx, *service.GithubRepoPath, fileName, serviceVersion)

	if err != nil || gitHubFileBytes == nil {
		encodedFileContent, err := store.FetchFileFromGitHub(ctx, trace, service, fileName, serviceVersion, gitHubClient)
		if err != nil {
			return nil, err
		} else if encodedFileContent == nil {
			return nil, errors.New("Unable to fetch valid content from GitHub")
		}

		gitHubFileBytes = []byte(*encodedFileContent)

		_, err = store.StorageClient.PushGitHubFile(ctx, *service.GithubRepoPath, fileName, serviceVersion, gitHubFileBytes)
		if err != nil {
			log.WithContext(ctx).Error(errors.Wrap(err, "Error uploading to storage"))
		}
	}

	gitHubFileString := string(gitHubFileBytes)
	rawDecodedText, err := base64.StdEncoding.DecodeString(gitHubFileString)
	if err != nil {
		return nil, err
	}
	if len(rawDecodedText) == 0 {
		return nil, errors.New("Empty content decoded from base64")
	}

	lines := strings.Split(string(rawDecodedText), "\n")
	lineContent, beforeContent, afterContent, err := store.ExpandedStackTrace(ctx, lines, *lineNumber)
	if err != nil {
		return nil, err
	}

	gitHubLink := fmt.Sprintf("https://github.com/%s/blob/%s%s#L%d", *service.GithubRepoPath, serviceVersion, fileName, *lineNumber)
	enhancementSource := privateModel.EnhancementSourceGithub
	newStackTraceInput := privateModel.ErrorTrace{
		FileName:                   trace.FileName,
		LineNumber:                 trace.LineNumber,
		FunctionName:               trace.FunctionName,
		Error:                      trace.Error,
		SourceMappingErrorMetadata: trace.SourceMappingErrorMetadata,
		EnhancementSource:          &enhancementSource,
		EnhancementVersion:         &serviceVersion,
		ExternalLink:               &gitHubLink,
		LineContent:                lineContent,
		LinesBefore:                beforeContent,
		LinesAfter:                 afterContent,
	}
	return &newStackTraceInput, nil
}

// returns (1) trace to be use, (2) if the trace was attempted to be enhanced, and (3) if the trace was successfully enhanced
func (store *Store) EnhanceTrace(ctx context.Context, trace *privateModel.ErrorTrace, service *model.Service, serviceVersion string, ignoredFiles []string, gitHubClient github.ClientInterface) (*privateModel.ErrorTrace, bool, bool) {
	if trace.FileName == nil || trace.LineNumber == nil {
		log.WithContext(ctx).WithField("frame", trace).Info(fmt.Errorf("Cannot enhance trace frame with GitHub with invalid values"))
		return trace, false, false
	}

	fileName := store.GitHubFilePath(ctx, *trace.FileName, service.BuildPrefix, service.GithubPrefix)
	for _, fileExpr := range ignoredFiles {
		if regexp.MustCompile(fileExpr).MatchString(fileName) {
			return trace, false, false
		}
	}

	// check if we've previously errored on this file
	previousError, _ := store.Redis.GetGitHubFileError(ctx, *service.GithubRepoPath, serviceVersion, fileName)
	if previousError {
		return trace, false, false
	}

	enhancedTrace, err := store.EnhanceTraceWithGitHub(ctx, trace, service, serviceVersion, fileName, gitHubClient)
	if err != nil {
		log.WithContext(ctx).WithField("frame", trace).Error(errors.Wrap(err, "Error enhancing stacktrace frame from GitHub"))
		_ = store.Redis.SetGitHubFileError(ctx, *service.GithubRepoPath, serviceVersion, fileName)
	}

	if enhancedTrace == nil {
		return trace, true, false
	}

	return enhancedTrace, true, true
}

func (store *Store) GitHubEnhancedStackTrace(ctx context.Context, stackTrace []*privateModel.ErrorTrace, workspace *model.Workspace, project *model.Project, errorObj *model.ErrorObject, validateService *model.Service) ([]*privateModel.ErrorTrace, error) {
	span, ctx := util.StartSpanFromContext(ctx, "GitHubEnhancedStackTrace")
	defer span.Finish()

	if errorObj.ServiceName == "" {
		return nil, nil
	}

	var service *model.Service
	var err error
	if validateService == nil {
		service, err = store.FindService(ctx, project.ID, errorObj.ServiceName)
		if err != nil || service == nil || service.GithubRepoPath == nil || service.Status != "healthy" {
			return nil, err
		}
	} else {
		service = validateService
	}

	gitHubAccessToken, err := store.IntegrationsClient.GetWorkspaceAccessToken(ctx, workspace, privateModel.IntegrationTypeGitHub)
	if err != nil || gitHubAccessToken == nil {
		return nil, err
	}

	client, err := github.NewClient(ctx, *gitHubAccessToken, store.Redis)
	if err != nil {
		return nil, err
	}

	validServiceVersion, err := store.GitHubGitSHA(ctx, *service.GithubRepoPath, errorObj.ServiceVersion, client)
	if err != nil {
		return nil, err
	}

	cfg, err := store.GetSystemConfiguration(ctx)
	if err != nil {
		return nil, err
	}

	newMappedStackTrace := []*privateModel.ErrorTrace{}
	enhanceable := false
	failedAllEnhancements := true

	for _, trace := range stackTrace {
		enhancedTrace, fileEnhancable, fileEnhanced := store.EnhanceTrace(ctx, trace, service, *validServiceVersion, cfg.IgnoredFiles, client)

		newMappedStackTrace = append(newMappedStackTrace, enhancedTrace)
		enhanceable = enhanceable || fileEnhancable
		failedAllEnhancements = failedAllEnhancements && !fileEnhanced
	}

	if enhanceable && failedAllEnhancements {
		errorCount, _ := store.Redis.IncrementServiceErrorCount(ctx, service.ID)
		if errorCount >= MAX_ERROR_KILLSWITCH {
			_ = store.UpdateServiceErrorState(ctx, service.ID, []string{"Too many errors enhancing errors - Check service configuration."})
		} else {
			_, _ = store.Redis.ResetServiceErrorCount(ctx, service.ID)
		}
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

// should always return error stacktrace, returned error will be logged, return enhanced stacktrace string when successfully enhanced
func (store *Store) EnhancedStackTrace(ctx context.Context, stackTrace string, workspace *model.Workspace, project *model.Project, errorObj *model.ErrorObject, validateService *model.Service) (*string, []*privateModel.ErrorTrace, error) {
	span, ctx := util.StartSpanFromContext(ctx, "EnhancedStackTrace", util.Tag("projectID", project.ID))
	defer span.Finish()

	structuredStackTrace, err := store.StructuredStackTrace(ctx, stackTrace)
	if err != nil {
		return nil, structuredStackTrace, errors.Wrap(err, "Error parsing stacktrace to enhance")
	}

	var newMappedStackTraceString *string
	mappedStackTrace, err := store.GitHubEnhancedStackTrace(ctx, structuredStackTrace, workspace, project, errorObj, validateService)
	if err != nil {
		return nil, structuredStackTrace, errors.Wrap(err, "Error enhancing stacktrace")
	}
	if mappedStackTrace == nil {
		return nil, structuredStackTrace, nil
	}

	mappedStackTraceBytes, err := json.Marshal(mappedStackTrace)
	if err != nil {
		return nil, structuredStackTrace, errors.Wrap(err, "Error parsing enhanced stacktrace")
	}

	mappedStackTraceString := string(mappedStackTraceBytes)
	newMappedStackTraceString = &mappedStackTraceString
	return newMappedStackTraceString, mappedStackTrace, nil
}
