package discord

import (
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

func GQLInputToGo(discordChannels []*modelInputs.DiscordChannelInput) []*model.DiscordChannel {
	ret := []*model.DiscordChannel{}
	for _, channel := range discordChannels {
		ret = append(ret, &model.DiscordChannel{
			ID:   channel.ID,
			Name: channel.Name,
		})
	}

	return ret

}
