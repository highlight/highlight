package store

import (
	"context"
	"fmt"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/redis"
)

// Span configuration which disables evaluation events for the flag `evals-test-a`.
// spans: [{
//     "name": {
//       "matchValue": "evaluation"
//     },
//     "events": [
//       {
//         "attributes": [
//           {
//             "key": {
//               "matchValue": "feature_flag.key"
//             },
//             "attribute": {
//               "matchValue": "evals-test-a"
//             }
//           }
//         ]
//       }
//     ],
//     "samplingRatio": 0
// }]

// Implementation note: The rules require that all specified fields for any signal match. If new fields are added, then
// care should be taken to consider how those will interact with existing SDK implementations.
// For example imagine that support for span events was added after support for matching a span name. If you had a
// if the above example configuration had been sent to such an SDK, then it would have disabled all evaluation events.
// This is because the span name would have matched, and the SDK would have been unaware of the event criteria.
// Likely the correct thing to do in that scenario would be to not send configurations for which the SDK is unaware of
// part of the configuration.

func (store *Store) GetClientSideSamplingConfiguration(ctx context.Context, projectID int) (*model.ProjectClientSamplingSettings, error) {
	return redis.CachedEval(ctx, store.Redis, fmt.Sprintf("client-side-sampling-config-%d", projectID), 250*time.Millisecond, time.Minute, func() (*model.ProjectClientSamplingSettings, error) {
		config := model.ProjectClientSamplingSettings{
			ProjectID: projectID,
		}
		err := store.DB.WithContext(ctx).Where(&config).Take(&config).Error
		return &config, err
	})
}
