package webhook

import (
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

func GQLInputToGo(webhooks []*modelInputs.WebhookDestinationInput) []*model.WebhookDestination {
	var ret []*model.WebhookDestination
	for _, wh := range webhooks {
		ret = append(ret, &model.WebhookDestination{
			URL:           wh.URL,
			Authorization: wh.Authorization,
		})
	}

	return ret
}
