package projectpath

import (
	"encoding/json"
	"os"
	"path/filepath"
)

const ConfigFile = "v1.json"

type Config struct {
	PhoneHomeDeploymentID string `json:"phone_home_session"`
}

func GetConfigDir() (string, error) {
	root := GetPersistentRoot()
	dir := filepath.Join(root, ".config")
	_, err := os.Stat(dir)
	if os.IsNotExist(err) {
		if err := os.Mkdir(dir, 0o755); err != nil {
			return "", err
		}
	} else if err != nil {
		return "", err
	}
	return dir, nil
}

func GetConfig() (*Config, error) {
	var cfg Config
	cfgDir, err := GetConfigDir()
	if err != nil {
		return nil, err
	}
	cfgFile := filepath.Join(cfgDir, ConfigFile)

	_, err = os.Stat(cfgFile)
	if os.IsNotExist(err) {
		return &cfg, nil
	} else if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(cfgFile)
	if err != nil {
		return nil, err
	}
	// ignore the error here, which would mean the file is empty or invalid json.
	_ = json.Unmarshal(data, &cfg)
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
