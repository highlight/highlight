package main

import (
	"testing"

	"github.com/aws/smithy-go/ptr"
	"github.com/stretchr/testify/assert"
)

// workaround for setting flag
var _ = func() bool {
	testing.Init()
	return true
}()

var testCases = []struct {
	input          *string
	expectedOutput *string
}{
	{
		nil,
		nil,
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":true}`),
		nil,
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":true,\"rules\":[[\"user_email\",\"not_contains\",\"batman\"],[\"custom_processed\",\"is\",\"true\"],[\"track_event\",\"is\",\"hl-search-query\"],[\"session_country\",\"is\",\"united states\"]]}"}`),
		ptr.String(`{"Query":"email!=*batman* processed=true event=hl-search-query country=\"united states\""}`),
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":true,\"rules\":[[\"user_email\",\"not_contains\",\"batman\"],[\"custom_processed\",\"is\",\"true\"],[\"track_event\",\"is\",\"hl-search-query\"],[\"session_country\",\"is\",\"costa rica\",\"united states\"]]}"}`),
		ptr.String(`{"Query":"email!=*batman* processed=true event=hl-search-query country=(\"costa rica\" OR \"united states\")"}`),
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":true,\"rules\":[[\"user_email\",\"not_contains\",\"batman\"],[\"custom_processed\",\"is\",\"true\"],[\"track_event\",\"is\",\"hl-search-query\"],[\"session_country\",\"is_not\",\"united states\"]]}"}`),
		ptr.String(`{"Query":"email!=*batman* processed=true event=hl-search-query country!=\"united states\""}`),
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":false,\"rules\":[[\"session_visited-url\",\"contains\",\"gyg.com.sg\"],[\"session_visited-url\",\"contains\",\"google\"],[\"session_country\",\"is_not\",\"costa rica\",\"united states\"]]}"}`),
		ptr.String(`{"Query":"visited-url=*gyg.com.sg* OR visited-url=*google* OR country!=(\"costa rica\" OR \"united states\")"}`),
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":true,\"rules\":[[\"custom_processed\",\"is\",\"true\"],[\"custom_created_at\",\"between_date\",\"30 days\"],[\"session_country\",\"not_contains\",\"spain\"],[\"session_country\",\"not_contains\",\"united states\"],[\"session_country\",\"not_contains\",\"japan\"]]}"}`),
		ptr.String(`{"Query":"processed=true country!=*spain* country!=\"*united states*\" country!=*japan*"}`),
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":true,\"rules\":[[\"custom_processed\",\"is\",\"true\"],[\"custom_created_at\",\"between_date\",\"30 days\"],[\"custom_active_length\",\"between_time\",\"3_59\"],[\"session_country\",\"not_contains\",\"spain\"],[\"session_country\",\"not_contains\",\"united states\"],[\"session_country\",\"not_contains\",\"japan\"]]}"}`),
		ptr.String(`{"Query":"processed=true (active_length>=180000 AND active_length<=3540000) country!=*spain* country!=\"*united states*\" country!=*japan*"}`),
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":true,\"rules\":[[\"custom_processed\",\"is\",\"true\"],[\"custom_created_at\",\"between_date\",\"30 days\"],[\"custom_active_length\",\"not_between_time\",\"3_59\"],[\"session_country\",\"not_contains\",\"spain\"],[\"session_country\",\"not_contains\",\"united states\"],[\"session_country\",\"not_contains\",\"japan\"]]}"}`),
		ptr.String(`{"Query":"processed=true (active_length<=180000 OR active_length>=3540000) country!=*spain* country!=\"*united states*\" country!=*japan*"}`),
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":true,\"rules\":[[\"custom_processed\",\"is\",\"true\"],[\"custom_created_at\",\"between_date\",\"30 days\"],[\"custom_active_length\",\"between_time\",\"0.3333333333333333_166.66666666666666\"]]}"}`),
		ptr.String(`{"Query":"processed=true active_length>=20000"}`),
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":true,\"rules\":[[\"custom_processed\",\"is\",\"true\"],[\"session_visited-url\",\"is\",\"https://www.google.com\"],[\"custom_created_at\",\"between_date\",\"2022-03-06T19:07:02.000Z_2022-03-07T07:07:02.000Z\"],[\"custom_active_length\",\"between\",\"0.5_60\"],[\"session_visited-url\",\"contains\",\"google.com/checkout\"],[\"session_visited-url\",\"not_contains\",\"confirmation\"]]}"}`),
		ptr.String(`{"Query":"processed=true visited-url=\"https://www.google.com\" (active_length>=0.5 AND active_length<=60) visited-url=*google.com/checkout* visited-url!=*confirmation*"}`),
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":true,\"rules\":[[\"custom_processed\",\"is\",\"true\"],[\"session_visited-url\",\"is\",\"https://www.google.com\"],[\"custom_created_at\",\"between_date\",\"2022-03-06T19:07:02.000Z_2022-03-07T07:07:02.000Z\"],[\"custom_active_length\",\"not_between\",\"0.5_60\"],[\"session_visited-url\",\"contains\",\"google.com/checkout\"],[\"session_visited-url\",\"not_contains\",\"confirmation\"]]}"}`),
		ptr.String(`{"Query":"processed=true visited-url=\"https://www.google.com\" (active_length<=0.5 OR active_length>=60) visited-url=*google.com/checkout* visited-url!=*confirmation*"}`),
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":true,\"rules\":[[\"custom_processed\",\"is\",\"true\"],[\"custom_created_at\",\"between_date\",\"30 days\"],[\"track_userId\",\"not_exists\"],[\"track_event\",\"is\",\"signup-begin\"],[\"session_browser_name\",\"is_not\",\"Safari\"],[\"user_identifier\",\"not_exists\"],[\"track_event\",\"is_not\",\"signup\"]]}"}`),
		ptr.String(`{"Query":"processed=true userId NOT EXISTS event=signup-begin browser_name!=Safari identifier NOT EXISTS event!=signup"}`),
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":true,\"rules\":[[\"custom_processed\",\"is\",\"true\"],[\"custom_created_at\",\"between_date\",\"30 days\"],[\"track_userId\",\"exists\"],[\"track_event\",\"is\",\"signup-begin\"],[\"session_browser_name\",\"is_not\",\"Safari\"],[\"user_identifier\",\"exists\"],[\"track_event\",\"is_not\",\"signup\"]]}"}`),
		ptr.String(`{"Query":"processed=true userId EXISTS event=signup-begin browser_name!=Safari identifier EXISTS event!=signup"}`),
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":true,\"rules\":[[\"session_visited-url\",\"matches\",\"/projects/*\"],[\"custom_created_at\",\"between_date\",\"30 days\"]]}"}`),
		ptr.String(`{"Query":"visited-url=//projects/*/"}`),
	},
	{
		ptr.String(`{"user_properties":null,"excluded_properties":null,"track_properties":null,"excluded_track_properties":null,"date_range":null,"length_range":null,"browser":null,"os":null,"environments":null,"app_versions":null,"device_id":null,"visited_url":null,"referrer":null,"identified":false,"hide_viewed":false,"first_time":false,"show_live_sessions":false,"query":"{\"isAnd\":true,\"rules\":[[\"session_visited-url\",\"not_matches\",\"/projects/*\"],[\"custom_created_at\",\"between_date\",\"30 days\"]]}"}`),
		ptr.String(`{"Query":"visited-url!=//projects/*/"}`),
	},
	{
		ptr.String(`{"Query":"{\"isAnd\":true,\"rules\":[[\"user_email\",\"not_contains\",\"spencer\",\"julian\",\"zane\",\"bmw\",\"chris\"]],\"dateRange\":{\"start_date\":\"2024-04-09T22:17:09.402Z\",\"end_date\":\"2024-04-10T22:17:09.402Z\"}}"}`),
		ptr.String(`{"Query":"email!=(*spencer* OR *julian* OR *zane* OR *bmw* OR *chris*)"}`),
	},
}

func TestTranslateParams(t *testing.T) {
	for _, tc := range testCases {
		// Call the function with the test case
		output, err := translateParams(tc.input)
		assert.Nil(t, err)

		if tc.expectedOutput == nil {
			assert.Nil(t, output)
		} else {
			assert.Equal(t, *tc.expectedOutput, *output)
		}
	}
}
