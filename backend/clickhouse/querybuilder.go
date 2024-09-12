package clickhouse

import (
	"fmt"
	"time"

	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

func getClickhouseHistogramSettings(options modelInputs.DateHistogramOptions) (string, string, *time.Location, error) {
	var aggFn string
	var addFn string
	switch options.BucketSize.CalendarInterval {
	case modelInputs.OpenSearchCalendarIntervalMinute:
		aggFn = "toRelativeMinuteNum"
		addFn = "addMinutes"
	case modelInputs.OpenSearchCalendarIntervalHour:
		aggFn = "toRelativeHourNum"
		addFn = "addHours"
	case modelInputs.OpenSearchCalendarIntervalDay:
		aggFn = "toRelativeDayNum"
		addFn = "addDays"
	case modelInputs.OpenSearchCalendarIntervalWeek:
		aggFn = "toRelativeWeekNum"
		addFn = "addWeeks"
	case modelInputs.OpenSearchCalendarIntervalMonth:
		aggFn = "toRelativeMonthNum"
		addFn = "addMonths"
	case modelInputs.OpenSearchCalendarIntervalQuarter:
		aggFn = "toRelativeQuarterNum"
		addFn = "addQuarters"
	case modelInputs.OpenSearchCalendarIntervalYear:
		aggFn = "toRelativeYearNum"
		addFn = "addYears"
	default:
		return "", "", nil, fmt.Errorf("invalid calendar interval: %s", options.BucketSize.CalendarInterval)
	}

	location, err := time.LoadLocation(options.TimeZone)
	if err != nil {
		return "", "", nil, err
	}

	return aggFn, addFn, location, nil
}
