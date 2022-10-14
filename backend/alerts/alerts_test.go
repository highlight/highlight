package alerts

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetUserPropertiesAndAvatar(t *testing.T) {
	assert := assert.New(t)

	userProperties := map[string]string{
		"Key":             "value",
		"":                "ValueWithoutKey",
		"KeyWithoutvalue": "",
		"Camelkey":        "value",
		"spaces key":      "value",
		"Avatar":          "https://avatars.githubusercontent.com/u/58678?s=400&u=7c36caa1c654bb31406de7bd33e710fa7ddee9e6&v=4",
	}

	gotUserProperties, gotAvatarUrl := getUserPropertiesAndAvatar(userProperties)
	wantUserProperties := map[string]string{
		"Key":             "value",
		"Keywithoutvalue": "_empty_",
		"Camelkey":        "value",
		"Spaces Key":      "value",
	}

	assert.Equal(gotUserProperties, wantUserProperties)
	assert.Equal(*gotAvatarUrl, "https://avatars.githubusercontent.com/u/58678?s=400&u=7c36caa1c654bb31406de7bd33e710fa7ddee9e6&v=4")
}

func TestGetUserPropertiesAndAvatar_InvalidAvatarURL(t *testing.T) {
	assert := assert.New(t)
	userProperties := map[string]string{
		"Avatar": "invalid_url",
	}

	_, got := getUserPropertiesAndAvatar(userProperties)
	assert.Nil(got)
}
