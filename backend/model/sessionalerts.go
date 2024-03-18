package model

import (
	"database/sql/driver"
	"encoding/json"
)

type DiscordChannel struct {
	Name string
	ID   string
}

type DiscordChannels []*DiscordChannel

// Scan scan value into Jsonb, implements sql.Scanner interface
func (dc *DiscordChannels) Scan(value interface{}) error {
	switch v := value.(type) {
	case string:
		if err := json.Unmarshal([]byte(v), &dc); err != nil {
			return err
		}
	case []byte:
		if err := json.Unmarshal(v, &dc); err != nil {
			return err
		}
	}
	return nil
}

// Value return json value, implement driver.Valuer interface
func (dc DiscordChannels) Value() (driver.Value, error) {
	bytes, err := json.Marshal(dc)
	return string(bytes), err
}

type MicrosoftTeamsTeam struct {
	ID string `json:"id"`
}

type MicrosoftTeamsChannel struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type MicrosoftTeamsChannels []*MicrosoftTeamsChannel

// Scan scan value into Jsonb, implements sql.Scanner interface
func (dc *MicrosoftTeamsChannels) Scan(value interface{}) error {
	switch v := value.(type) {
	case string:
		if err := json.Unmarshal([]byte(v), &dc); err != nil {
			return err
		}
	case []byte:
		if err := json.Unmarshal(v, &dc); err != nil {
			return err
		}
	}
	return nil
}

// Value return json value, implement driver.Valuer interface
func (dc MicrosoftTeamsChannels) Value() (driver.Value, error) {
	bytes, err := json.Marshal(dc)
	return string(bytes), err
}

type WebhookDestination struct {
	URL           string
	Authorization *string
}

type WebhookDestinations []*WebhookDestination

// Scan scan value into Jsonb, implements sql.Scanner interface
func (dc *WebhookDestinations) Scan(value interface{}) error {
	switch v := value.(type) {
	case string:
		if err := json.Unmarshal([]byte(v), &dc); err != nil {
			return err
		}
	case []byte:
		if err := json.Unmarshal(v, &dc); err != nil {
			return err
		}
	}
	return nil
}

// Value return json value, implement driver.Valuer interface
func (dc WebhookDestinations) Value() (driver.Value, error) {
	bytes, err := json.Marshal(dc)
	return string(bytes), err
}

type AlertIntegrations struct {
	DiscordChannelsToNotify        DiscordChannels        `gorm:"type:jsonb;default:'[]'" json:"discord_channels_to_notify"`
	MicrosoftTeamsChannelsToNotify MicrosoftTeamsChannels `gorm:"type:jsonb;default:'[]'" json:"microsoft_teams_channels_to_notify"`
	WebhookDestinations            WebhookDestinations    `gorm:"type:jsonb;default:'[]'" json:"webhook_destinations"`
}
