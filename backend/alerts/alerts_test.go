package alerts

import (
	"reflect"
	"testing"
)

func TestGetUserPropertiesAndAvatar(t *testing.T) {
	userProperties := map[string]string{
		"Key":             "value",
		"":                "ValueWIthoutKey",
		"KeyWithoutvalue": "",
		"Camelkey":        "value",
		"Avatar":          "https://avatars.githubusercontent.com/u/58678?s=400&u=7c36caa1c654bb31406de7bd33e710fa7ddee9e6&v=4",
	}

	gotUserProperties, gotAvatarUrl := getUserPropertiesAndAvatar(userProperties)
	wantUserProperties := map[string]string{
		"Key":             "value",
		"Keywithoutvalue": "_empty_",
		"Camelkey":        "value",
	}
	wantAvatarUrl := "https://avatars.githubusercontent.com/u/58678?s=400&u=7c36caa1c654bb31406de7bd33e710fa7ddee9e6&v=4"

	if !reflect.DeepEqual(gotUserProperties, wantUserProperties) {
		t.Errorf("got %v want %v", gotUserProperties, wantUserProperties)
	}

	if *gotAvatarUrl != wantAvatarUrl {
		t.Errorf("got %v want %v", *gotAvatarUrl, wantAvatarUrl)
	}
}

func TestGetUserPropertiesAndAvatarInvalidAvatarURL(t *testing.T) {
	userProperties := map[string]string{
		"Avatar": "invalid_url",
	}

	_, got := getUserPropertiesAndAvatar(userProperties)

	if got != nil {
		t.Errorf("got %v want %v", got, nil)
	}
}
