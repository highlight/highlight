package errors

import (
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

type Buckets struct {
	Key      string `json:"key"`
	DocCount int    `json:"doc_count"`
}

type TagsAggregations struct {
	Aggregations struct {
		Browser struct {
			Buckets []Buckets `json:"buckets"`
		} `json:"browser"`
		Environment struct {
			Buckets []Buckets `json:"buckets"`
		} `json:"environment"`

		OsName struct {
			Buckets []Buckets `json:"buckets"`
		} `json:"os_name"`
	} `json:"aggregations"`
}

func BuildAggregations(json TagsAggregations) []*modelInputs.ErrorGroupTagAggregation {
	aggregations := []*modelInputs.ErrorGroupTagAggregation{}

	aggregations = append(aggregations, buildAggregation("browser", json.Aggregations.Browser.Buckets))
	aggregations = append(aggregations, buildAggregation("environment", json.Aggregations.Environment.Buckets))
	aggregations = append(aggregations, buildAggregation("os_name", json.Aggregations.OsName.Buckets))

	return aggregations
}

func buildAggregation(key string, jsonBuckets []Buckets) *modelInputs.ErrorGroupTagAggregation {
	buckets := []*modelInputs.ErrorGroupTagAggregationBucket{}
	totalCount := int64(0)

	for _, bucket := range jsonBuckets {
		totalCount = totalCount + int64(bucket.DocCount)
	}

	for _, bucket := range jsonBuckets {
		percent := float64(bucket.DocCount) / float64(totalCount) * 100
		truncatedPercent := float64(int(percent*100)) / 100 // truncates to 2 decimal places

		buckets = append(buckets, &modelInputs.ErrorGroupTagAggregationBucket{
			Key:      bucket.Key,
			DocCount: int64(bucket.DocCount),
			Percent:  truncatedPercent,
		})
	}
	return &modelInputs.ErrorGroupTagAggregation{
		Key:        key,
		TotalCount: totalCount,
		Buckets:    buckets,
	}
}
