package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	log "github.com/sirupsen/logrus"
)

var (
	confirm = flag.Bool("confirm", false, "confirm migration or run in dry run mode")
)

func init() {
	flag.Parse()
	if confirm == nil {
		confirm = ptr.Bool(false)
	}
}

func main() {
	highlight.SetProjectID("1jdkoe52")
	highlight.Start(
		highlight.WithServiceName("task--migrate-error-segments"),
		highlight.WithServiceVersion(os.Getenv("REACT_APP_COMMIT_SHA")),
		highlight.WithEnvironment(util.EnvironmentName()),
	)
	defer highlight.Stop()
	hlog.Init()

	ctx := context.TODO()
	dryRun := !*confirm

	if dryRun {
		log.WithContext(ctx).Info("Running in dry run mode")
	} else {
		log.WithContext(ctx).Info("Running in migration mode")
	}

	db, err := model.SetupDB(ctx, os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatalf("error setting up DB: %v", err)
	}

	segments := []*model.ErrorSegment{}
	if err := db.WithContext(ctx).Model(model.ErrorSegment{}).Find(&segments).Error; err != nil {
		log.WithContext(ctx).Fatalf("error querying error segments: %v", err)
	}

	log.WithContext(ctx).Infof("migrating %d error segments", len(segments))

	migratedCount := 0
	skipCount := 0
	errorCount := 0

	for _, segment := range segments {
		name := segment.Name
		if name == nil {
			name = ptr.String("Untitled Segment")
		}

		params, err := translateParams(segment.Params)
		if err != nil {
			log.WithContext(ctx).Errorf("error translating params for segment %d, %v", segment.ID, err)
			errorCount++
			continue
		}
		if params == nil || *params == "" {
			log.WithContext(ctx).Infof("skipping segment %d, empty query", segment.ID)
			skipCount++
			continue
		}

		savedSegment := model.SavedSegment{
			Name:       *name,
			EntityType: modelInputs.SavedSegmentEntityTypeError,
			ProjectID:  segment.ProjectID,
			Params:     *params,
		}

		// check if segment already exists
		// NOTE: n+1 query here, but this is a one-off migration with <100 segments
		var exists bool
		if err := db.WithContext(ctx).Model(model.SavedSegment{}).Select("COUNT(*) > 0").Where(savedSegment).Find(&exists).Error; err != nil {
			log.WithContext(ctx).Errorf("error checking for existing saved segment %v", err)
			errorCount++
			continue
		}
		if exists {
			log.WithContext(ctx).Infof("skipping segment %d, already exists", segment.ID)
			skipCount++
			continue
		}

		// create new saved segment
		if dryRun {
			log.WithContext(ctx).Infof("would migrate segment %d: %s", segment.ID, savedSegment.Params)
		} else {
			if err := db.WithContext(ctx).Create(&savedSegment).Error; err != nil {
				log.WithContext(ctx).Errorf("error migrating error segment %d, %v", segment.ID, err)
				errorCount++
				continue
			}
		}

		migratedCount++
	}

	if dryRun {
		log.WithContext(ctx).Infof("Dry run complete: %d TO BE migrated, %d skipped, %d errored", migratedCount, skipCount, errorCount)
	} else {
		log.WithContext(ctx).Infof("Migration complete: %d migrated, %d skipped, %d errored", migratedCount, skipCount, errorCount)
	}
}

func translateParams(params *string) (*string, error) {
	if params == nil {
		return nil, nil
	}

	var paramsObject map[string]*string
	if err := json.Unmarshal([]byte(*params), &paramsObject); err != nil {
		return nil, fmt.Errorf("error unmarshalling params: %v", err)
	}

	queryString := paramsObject["Query"]
	if queryString == nil || *queryString == "" {
		queryString = paramsObject["query"]
		if queryString == nil || *queryString == "" {
			return nil, nil
		}
	}

	var clickhouseQuery modelInputs.ClickhouseQuery
	if err := json.Unmarshal([]byte(*queryString), &clickhouseQuery); err != nil {
		return nil, fmt.Errorf("error unmarshalling query: %v", err)
	}
	if clickhouseQuery.Rules == nil || len(clickhouseQuery.Rules) == 0 {
		return nil, nil
	}

	isAnd := clickhouseQuery.IsAnd

	// parse params
	rules, err := deserializeRules(clickhouseQuery.Rules)
	if err != nil {
		return nil, err
	}
	if len(rules) == 0 {
		return nil, nil
	}

	queryParts := []string{}
	for _, rule := range rules {
		_, field, found := strings.Cut(rule.Field, "_")
		if !found {
			continue
		}

		// translate field
		fieldName, valid := validFieldMap[field]
		if !valid {
			continue
		}

		_, valid = validOpMap[rule.Op]
		if !valid {
			continue
		}

		queryPart := buildStringQuery(fieldName, rule.Op, rule.Val)

		queryParts = append(queryParts, queryPart)
	}

	var query *string
	if isAnd {
		query = ptr.String(strings.Join(queryParts, " "))
	} else {
		query = ptr.String(strings.Join(queryParts, " OR "))
	}

	if query != nil && *query != "" {
		*query = fmt.Sprintf(`{"Query":"%s"}`, *query)
	}

	return query, nil
}

type Rule struct {
	Field string
	Op    string
	Val   []string
}

func deserializeRules(rules [][]string) ([]Rule, error) {
	ret := []Rule{}
	for _, r := range rules {
		if len(r) < 2 {
			return nil, fmt.Errorf("expecting >= 2 fields in rule %#v", r)
		}
		ret = append(ret, Rule{
			Field: r[0],
			Op:    r[1],
			Val:   r[2:],
		})
	}
	return ret, nil
}

func buildStringQuery(fieldName modelInputs.ReservedErrorsJoinedKey, op string, val []string) string {
	queryArray := []string{}
	switch op {
	case "is":
		value := strings.Join(val, " OR ")
		if len(val) > 1 {
			value = fmt.Sprintf("(%s)", value)
		}
		queryArray = append(queryArray, fmt.Sprintf("%s=%s", fieldName, value))
	case "is_not":
		value := strings.Join(val, " OR ")
		if len(val) > 1 {
			value = fmt.Sprintf("(%s)", value)
		}
		queryArray = append(queryArray, fmt.Sprintf("%s!=%s", fieldName, value))
	case "contains":
		containsValues := []string{}
		for _, v := range val {
			containsValues = append(containsValues, fmt.Sprintf("*%s*", v))
		}

		value := strings.Join(containsValues, " OR ")
		if len(val) > 1 {
			value = fmt.Sprintf("(%s)", value)
		}
		queryArray = append(queryArray, fmt.Sprintf("%s=%s", fieldName, value))
	case "not_contains":
		containsValues := []string{}
		for _, v := range val {
			containsValues = append(containsValues, fmt.Sprintf("*%s*", v))
		}

		value := strings.Join(containsValues, " OR ")
		if len(val) > 1 {
			value = fmt.Sprintf("(%s)", value)
		}
		queryArray = append(queryArray, fmt.Sprintf("%s!=%s", fieldName, value))
	case "matches":
		for _, v := range val {
			value := fmt.Sprintf("/%s/", v)
			queryArray = append(queryArray, fmt.Sprintf("%s=%s", fieldName, value))
		}
	case "not_matches":
		for _, v := range val {
			value := fmt.Sprintf("/%s/", v)
			queryArray = append(queryArray, fmt.Sprintf("%s!=%s", fieldName, value))
		}
	}

	queryString := strings.Join(queryArray, " OR ")
	if len(queryArray) > 1 {
		queryString = fmt.Sprintf("(%s)", queryString)
	}

	return queryString
}

var validFieldMap = map[string]modelInputs.ReservedErrorsJoinedKey{
	"os_name":           modelInputs.ReservedErrorsJoinedKeyOsName,
	"has_session":       modelInputs.ReservedErrorsJoinedKeyHasSession,
	"environment":       modelInputs.ReservedErrorsJoinedKeyEnvironment,
	"Type":              modelInputs.ReservedErrorsJoinedKeyType,
	"Event":             modelInputs.ReservedErrorsJoinedKeyEvent,
	"state":             modelInputs.ReservedErrorsJoinedKeyStatus,
	"browser":           modelInputs.ReservedErrorsJoinedKeyBrowser,
	"visited_url":       modelInputs.ReservedErrorsJoinedKeyVisitedURL,
	"service_name":      modelInputs.ReservedErrorsJoinedKeyServiceName,
	"service_version":   modelInputs.ReservedErrorsJoinedKeyServiceVersion,
	"Tag":               modelInputs.ReservedErrorsJoinedKeyTag,
	"secure_session_id": modelInputs.ReservedErrorsJoinedKeySecureSessionID,
	"trace_id":          modelInputs.ReservedErrorsJoinedKeyTraceID,
}

var validOpMap = map[string]string{
	"is":           "=",
	"is_not":       "!=",
	"contains":     "=",
	"not_contains": "!=",
	"matches":      "=",
	"not_matches":  "!=",
}
