package graph

import (
	"encoding/json"
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/stretchr/testify/assert"
)

func Test_canUnmarshalEmptyConfig(t *testing.T) {
	dbConfig := model.ProjectClientSamplingSettings{
		ProjectID: 1,
	}

	config := customModels.SamplingConfig{}
	err := UnmarshalClientSamplingConfig(dbConfig, &config)
	assert.Nil(t, err)
	assert.Nil(t, config.Logs)
	assert.Nil(t, config.Spans)
}

func Test_canUnmarshalConfigWithAllFields(t *testing.T) {
	spanRegexVal := "span-attr-.*"
	logRegexVal := "log-value-.*"
	// Define test span configs
	spanConfigs := []*customModels.SpanSamplingConfig{
		{
			Name: &customModels.MatchConfig{
				MatchValue: "test-span",
			},
			Attributes: []*customModels.AttributeMatchConfig{
				{
					Key: &customModels.MatchConfig{
						RegexValue: &spanRegexVal,
					},
					Attribute: &customModels.MatchConfig{
						MatchValue: "span-value",
					},
				},
			},
			SamplingRatio: 5,
		},
		{
			Name: &customModels.MatchConfig{
				MatchValue: "second-span",
			},
			SamplingRatio: 2,
		},
		{
			Attributes: []*customModels.AttributeMatchConfig{
				{
					Key: &customModels.MatchConfig{
						MatchValue: "span-key",
					},
					Attribute: &customModels.MatchConfig{
						MatchValue: true,
					},
				},
			},
			SamplingRatio: 8,
		},
	}

	// Define test log configs
	logConfigs := []*customModels.LogSamplingConfig{
		{
			Message: &customModels.MatchConfig{
				MatchValue: "test-log",
			},
			SeverityText: &customModels.MatchConfig{
				MatchValue: "ERROR",
			},
			Attributes: []*customModels.AttributeMatchConfig{
				{
					Key: &customModels.MatchConfig{
						MatchValue: "log-attr-str",
					},
					Attribute: &customModels.MatchConfig{
						RegexValue: &logRegexVal,
					},
				},
				{
					Key: &customModels.MatchConfig{
						MatchValue: "log-attr-num",
					},
					Attribute: &customModels.MatchConfig{
						// Will always be a double in JSON.
						MatchValue: 42.0,
					},
				},
			},
			SamplingRatio: 10,
		},
		{
			Message: &customModels.MatchConfig{
				MatchValue: "second-log",
			},
			SamplingRatio: 3,
		},
		{
			SeverityText: &customModels.MatchConfig{
				MatchValue: "WARNING",
			},
			SamplingRatio: 7,
		},
	}

	jsonSpanConfigs, err := json.Marshal(spanConfigs)
	assert.Nil(t, err)
	jsonLogConfigs, err := json.Marshal(logConfigs)
	assert.Nil(t, err)

	stringSpanConfigs := string(jsonSpanConfigs)
	stringLogConfigs := string(jsonLogConfigs)

	// Create DB config
	dbConfig := model.ProjectClientSamplingSettings{
		ProjectID:           1,
		SpanSamplingConfigs: &stringSpanConfigs,
		LogSamplingConfigs:  &stringLogConfigs,
	}

	// Unmarshal and verify
	config := customModels.SamplingConfig{}
	err = UnmarshalClientSamplingConfig(dbConfig, &config)
	assert.Nil(t, err)

	// Verify spans
	assert.Equal(t, 3, len(config.Spans))
	assert.Equal(t, spanConfigs, config.Spans)

	// Verify logs
	assert.Equal(t, 3, len(config.Logs))
	assert.Equal(t, logConfigs, config.Logs)
}
