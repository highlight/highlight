package microsoft_teams

import (
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

func GQLInputToGo(microsoftTeamsChannels []*modelInputs.MicrosoftTeamsChannelInput) []*model.MicrosoftTeamsChannel {
	ret := []*model.MicrosoftTeamsChannel{}
	for _, channel := range microsoftTeamsChannels {
		ret = append(ret, &model.MicrosoftTeamsChannel{
			ID:   channel.ID,
			Name: channel.Name,
		})
	}

	return ret
}
