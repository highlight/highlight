package clickhouse

import (
	"fmt"
	"strings"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

func buildWhereClause(projectID int, params modelInputs.LogsParamsInput) string {
	projectCondition := fmt.Sprintf("WHERE ProjectId = %d", projectID)
	logAttributesCondition := buildLogAttributes(params.Query)
	timeCondition := buildTimeQuery(params.DateRange.StartDate, params.DateRange.EndDate)

	if len(logAttributesCondition) == 0 {
		return projectCondition + " AND " + timeCondition
	}

	return projectCondition + " AND " + timeCondition + " AND " + logAttributesCondition
}

func buildTimeQuery(startTime time.Time, endTime time.Time) string {
	return fmt.Sprintf("toUInt64(toDateTime(Timestamp)) >= %d AND toUInt64(toDateTime(Timestamp)) <= %d", uint64(startTime.Unix()), uint64(endTime.Unix()))
}

func buildLogAttributes(userQuery string) string {
	queries := strings.Split(userQuery, " ")

	logAttributes := []string{}

	for _, query := range queries {
		parts := strings.Split(query, ":")

		if len(parts) == 2 {
			key := parts[0]
			value := parts[1]
			logAttributes = append(logAttributes, fmt.Sprintf("LogAttributes['%s'] = '%s'", key, value))
		}
	}

	return strings.Join(logAttributes, " AND ")
}
