package clickhouse

import (
	"context"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/samber/lo"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

const UsersTableName = "session_users_vw"
const UsersKeysTable = SessionKeysTable

// These keys show up as recommendations, not in fields table due to high cardinality or post processing booleans
var defaultUsersKeys = []*modelInputs.QueryKey{
	{Name: string(modelInputs.ReservedUserKeyActiveLength), Type: modelInputs.KeyTypeNumeric},
	{Name: string(modelInputs.ReservedUserKeyCompleted), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedUserKeyFirstTime), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedUserKeyHasComments), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedUserKeyHasErrors), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedUserKeyHasRageClicks), Type: modelInputs.KeyTypeBoolean},
	{Name: string(modelInputs.ReservedUserKeyLength), Type: modelInputs.KeyTypeNumeric},
	{Name: string(modelInputs.ReservedUserKeyPagesVisited), Type: modelInputs.KeyTypeNumeric},
}

var userKeysToColumns = map[string]string{
	string(modelInputs.ReservedUserKeyActiveLength):   "ActiveLength",
	string(modelInputs.ReservedUserKeyBrowserName):    "BrowserName",
	string(modelInputs.ReservedUserKeyBrowserVersion): "BrowserVersion",
	string(modelInputs.ReservedUserKeyCity):           "City",
	string(modelInputs.ReservedUserKeyCompleted):      "Processed",
	string(modelInputs.ReservedUserKeyCountry):        "Country",
	string(modelInputs.ReservedUserKeyEnvironment):    "Environment",
	string(modelInputs.ReservedUserKeyFirstTime):      "FirstTime",
	string(modelInputs.ReservedUserKeyHasComments):    "HasComments",
	string(modelInputs.ReservedUserKeyHasErrors):      "HasErrors",
	string(modelInputs.ReservedUserKeyHasRageClicks):  "HasRageClicks",
	string(modelInputs.ReservedUserKeyIdentifier):     "Identifier",
	string(modelInputs.ReservedUserKeyIP):             "IP",
	string(modelInputs.ReservedUserKeyLength):         "Length",
	string(modelInputs.ReservedUserKeyOsName):         "OSName",
	string(modelInputs.ReservedUserKeyOsVersion):      "OSVersion",
	string(modelInputs.ReservedUserKeyPagesVisited):   "PagesVisited",
	string(modelInputs.ReservedUserKeyState):          "State",
}

var reservedUserKeys = lo.Map(modelInputs.AllReservedUserKey, func(key modelInputs.ReservedUserKey, _ int) string {
	return string(key)
})

var usersTableConfig = model.TableConfig{
	TableName:        UsersTableName,
	AttributesColumn: "SessionAttributePairs",
	AttributesList:   true,
	BodyColumn:       "Identifier",
	KeysToColumns:    userKeysToColumns,
	ReservedKeys:     reservedUserKeys,
}

var UsersSampleableTableConfig = SampleableTableConfig{
	tableConfig: usersTableConfig,
	useSampling: func(time.Duration) bool {
		return false
	},
}

func (client *Client) ReadUsersMetrics(ctx context.Context, projectID int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, nBuckets *int, bucketBy string, bucketWindow *int, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
	userGroupBy := append(groupBy, "Identifier")

	return client.ReadMetrics(ctx, ReadMetricsInput{
		SampleableConfig: UsersSampleableTableConfig,
		ProjectIDs:       []int{projectID},
		Params:           params,
		Column:           column,
		MetricTypes:      metricTypes,
		GroupBy:          userGroupBy,
		BucketCount:      nBuckets,
		BucketWindow:     bucketWindow,
		BucketBy:         bucketBy,
		Limit:            limit,
		LimitAggregator:  limitAggregator,
		LimitColumn:      limitColumn,
	})
}

// get keys from sessions but with different default values
func (client *Client) UsersKeys(ctx context.Context, projectID int, startDate time.Time, endDate time.Time, query *string, typeArg *modelInputs.KeyType) ([]*modelInputs.QueryKey, error) {
	userKeys, err := KeysAggregated(ctx, client, UsersKeysTable, projectID, startDate, endDate, query, typeArg)
	if err != nil {
		return nil, err
	}

	if query == nil || *query == "" {
		userKeys = append(userKeys, defaultUsersKeys...)
	} else {
		queryLower := strings.ToLower(*query)
		for _, key := range defaultUsersKeys {
			if strings.Contains(key.Name, queryLower) {
				userKeys = append(userKeys, key)
			}
		}
	}

	return userKeys, nil
}

// get values from sessions
func (client *Client) UsersKeyValues(ctx context.Context, projectID int, keyName string, startDate time.Time, endDate time.Time, limit *int) ([]string, error) {
	return client.SessionsKeyValues(ctx, projectID, keyName, startDate, endDate, limit)
}

func (client *Client) UsersLogLines(ctx context.Context, projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	return logLines(ctx, client, usersTableConfig, projectID, params)
}
