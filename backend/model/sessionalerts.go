package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"

	"github.com/pkg/errors"
)

type DiscordChannel struct {
	Name string
	ID   string
}

type DiscordChannels []*DiscordChannel

// Scan scan value into Jsonb, implements sql.Scanner interface
func (dc *DiscordChannels) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("Failed to unmarshal JSONB value:", value))
	}
	return json.Unmarshal(bytes, &dc)
}

// Value return json value, implement driver.Valuer interface
func (dc DiscordChannels) Value() (driver.Value, error) {
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
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("Failed to unmarshal JSONB value:", value))
	}
	return json.Unmarshal(bytes, &dc)
}

// Value return json value, implement driver.Valuer interface
func (dc WebhookDestinations) Value() (driver.Value, error) {
	bytes, err := json.Marshal(dc)
	return string(bytes), err
}

type AlertIntegrations struct {
	DiscordChannelsToNotify DiscordChannels     `gorm:"type:jsonb;default:'[]'" json:"discord_channels_to_notify"`
	WebhookDestinations     WebhookDestinations `gorm:"type:jsonb;default:'[]'" json:"webhook_destinations"`
}
