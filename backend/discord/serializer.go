package discord

import (
	"github.com/highlight-run/highlight/backend/model"
)

func SerializeModelToGQL(channels model.DiscordChannels) []*model.DiscordChannel {
	ret := []*model.DiscordChannel{}

	for _, channel := range channels {
		ret = append(ret, &model.DiscordChannel{
			ID:   channel.ID,
			Name: channel.Name,
		})

	}

	return ret
}
