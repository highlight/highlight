package graph

import (
	"encoding/json"

	"github.com/highlight-run/highlight/backend/model"
	customModels "github.com/highlight-run/highlight/backend/public-graph/graph/model"
)

func UnmarshalClientSamplingConfig(dbConfig model.ProjectClientSamplingSettings, outConfig *customModels.SamplingConfig) error {
	var spans []*customModels.SpanSamplingConfig
	var logs []*customModels.LogSamplingConfig

	if dbConfig.SpanSamplingConfigs != nil {
		var tmpSpans []*customModels.SpanSamplingConfig
		err := json.Unmarshal([]byte(*dbConfig.SpanSamplingConfigs), &tmpSpans)
		if err != nil {
			return err
		}
		spans = tmpSpans
	}

	if dbConfig.LogSamplingConfigs != nil {
		var tmpLogs []*customModels.LogSamplingConfig
		err := json.Unmarshal([]byte(*dbConfig.LogSamplingConfigs), &tmpLogs)
		if err != nil {
			return err
		}
		logs = tmpLogs
	}

	// Only assign values to outConfig after both unmarshaling operations succeeded
	outConfig.Spans = spans
	outConfig.Logs = logs

	return nil
}
