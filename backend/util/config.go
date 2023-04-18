package util

import (
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/projectpath"
	"os"
	"path/filepath"
)

const ConfigFile = "backend.json"

type Config struct {
	PhoneHomeOptOut       bool   `json:"phone_home_opt_out"`
	PhoneHomeDeploymentID string `json:"phone_home_session"`
}

func GetConfigDir() (string, error) {
	dir := fmt.Sprintf("%s/.config", projectpath.GetRoot())
	_, err := os.Stat(dir)
	if os.IsNotExist(err) {
		if err := os.Mkdir(dir, 0o644); err != nil {
			return "", err
		}
	} else if err != nil {
		return "", err
	}
	return dir, nil
}

func GetConfig() (*Config, error) {
	cfgDir, err := GetConfigDir()
	if err != nil {
		return nil, err
	}
	data, err := os.ReadFile(filepath.Join(cfgDir, ConfigFile))
	if err != nil {
		return nil, err
	}
	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}
	return &cfg, err
}

func SaveConfig(cfg *Config) (err error) {
	var data []byte
	if data, err = json.Marshal(cfg); err != nil {
		return err
	}

	cfgDir, err := GetConfigDir()
	if err != nil {
		return err
	}

	err = os.WriteFile(filepath.Join(cfgDir, ConfigFile), data, 0o644)
	return
}
