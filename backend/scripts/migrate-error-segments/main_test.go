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

// Note: no between or matches cases for errors
var testCases = []struct {
	input          *string
	expectedOutput *string
}{
	{
		nil,
		nil,
	},
	{
		ptr.String(`{"date_range":null,"browser":null,"os":null,"visited_url":null,"event":null,"state":"OPEN"}`),
		nil,
	},
	{
		ptr.String(`{"Query":"{\"isAnd\":true,\"rules\":[[\"error_state\",\"is\",\"OPEN\"]],\"dateRange\":{\"start_date\":\"2023-12-30T03:49:22.475Z\",\"end_date\":\"2024-01-29T03:49:22.475Z\"}}"}`),
		ptr.String("status=OPEN"),
	},
	{
		ptr.String(`{"date_range":null,"browser":null,"os":null,"visited_url":null,"event":null,"state":null,"query":"{\"isAnd\":true,\"rules\":[[\"error_state\",\"is\",\"OPEN\"],[\"error-field_timestamp\",\"between_date\",\"30 days\"],[\"error_state\",\"is\",\"RESOLVED\"]]}"}`),
		ptr.String("status=OPEN status=RESOLVED"),
	},
	{
		ptr.String(`{"date_range":null,"browser":null,"os":null,"visited_url":null,"event":null,"state":"OPEN","query":"{\"isAnd\":true,\"rules\":[[\"error_state\",\"is\",\"OPEN\"],[\"error-field_timestamp\",\"between_date\",\"30 days\"],[\"error-field_browser\",\"is\",\"Chrome\"],[\"error-field_browser\",\"is\",\"Chrome\"],[\"error-field_environment\",\"is_not\",\"production\"]]}"}`),
		ptr.String("status=OPEN browser=Chrome browser=Chrome environment!=production"),
	},
	{
		ptr.String(`{"date_range":null,"browser":null,"os":null,"visited_url":null,"event":null,"state":null,"query":"{\"isAnd\":true,\"rules\":[[\"error_state\",\"is\",\"OPEN\"],[\"error-field_visited_url\",\"not_contains\",\"localhost\"]]}"}`),
		ptr.String("status=OPEN visited_url!=*localhost*"),
	},
	{
		ptr.String(`{"date_range":null,"browser":null,"os":null,"visited_url":null,"event":null,"state":null,"query":"{\"isAnd\":false,\"rules\":[[\"error_state\",\"is\",\"OPEN\"],[\"error-field_visited_url\",\"not_contains\",\"localhost\"],[\"error-field_browser\",\"matches\",\".+\\\\d\"]]}"}`),
		ptr.String("status=OPEN OR visited_url!=*localhost* OR browser=\\.+\\d\\"),
	},
	{
		ptr.String(`{"Query":"{\"isAnd\":true,\"rules\":[[\"error_state\",\"is\",\"OPEN\"],[\"error-field_browser\",\"is\",\"Chrome\"],[\"error-field_browser\",\"is\",\"Chrome\"],[\"error-field_environment\",\"is\",\"production\",\"prod\"]],\"dateRange\":{\"start_date\":\"2024-03-11T17:28:20.610Z\",\"end_date\":\"2024-04-10T17:28:20.610Z\"}}"}`),
		ptr.String("status=OPEN browser=Chrome browser=Chrome environment=(production OR prod)"),
	},
	{
		ptr.String(`{"Query":"{\"isAnd\":true,\"rules\":[[\"error_state\",\"is\",\"OPEN\"],[\"error-field_browser\",\"matches\",\".+\\\\d\"],[\"error-field_browser\",\"matches\",\".+\\\\s\"],[\"error-field_environment\",\"is\",\"production\",\"prod\"]],\"dateRange\":{\"start_date\":\"2024-03-11T20:04:35.411Z\",\"end_date\":\"2024-04-10T20:04:35.411Z\"}}"}`),
		ptr.String("status=OPEN browser=\\.+\\d\\ browser=\\.+\\s\\ environment=(production OR prod)"),
	},
	{
		ptr.String(`{"Query":"{\"isAnd\":true,\"rules\":[[\"error_state\",\"is\",\"OPEN\"],[\"error-field_browser\",\"matches\",\".+\\\\d\",\".+\\\\s\"],[\"error-field_environment\",\"is\",\"production\",\"prod\"]],\"dateRange\":{\"start_date\":\"2024-03-11T20:12:54.219Z\",\"end_date\":\"2024-04-10T20:12:54.219Z\"}}"}`),
		ptr.String("status=OPEN (browser=\\.+\\d\\ OR browser=\\.+\\s\\) environment=(production OR prod)"),
	},
	{
		ptr.String(`{"Query":"{\"isAnd\":true,\"rules\":[[\"error_state\",\"is\",\"OPEN\"],[\"error-field_browser\",\"is\",\"Chrome\"],[\"error-field_environment\",\"is\",\"dev\",\"cameron-localhost\"],[\"error-field_secure_session_id\",\"contains\",\"a\",\"b\"],[\"error-field_os_name\",\"matches\",\".+\\\\d.+\",\".+\\\\s.+\"]],\"dateRange\":{\"start_date\":\"2024-03-11T20:56:06.523Z\",\"end_date\":\"2024-04-10T20:56:06.523Z\"}}"}`),
		ptr.String("status=OPEN browser=Chrome environment=(dev OR cameron-localhost) secure_session_id=(*a* OR *b*) (os_name=\\.+\\d.+\\ OR os_name=\\.+\\s.+\\)"),
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
