package enterprise

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"github.com/hashicorp/go-retryablehttp"
	"github.com/highlight-run/highlight/backend/projectpath"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/mitchellh/mapstructure"
	e "github.com/pkg/errors"
	"github.com/rogpeppe/go-internal/semver"
	log "github.com/sirupsen/logrus"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const UpdateInterval = time.Minute
const UpdateErrorsAbort = 10

var EarliestAllowedEnvironment = time.Now().AddDate(-1, 0, 0)

func Start(ctx context.Context) error {
	env, err := GetEnvironment(GetEncryptedEnvironmentFilePath())
	if err != nil {
		log.WithContext(ctx).WithError(err).Info("enterprise service not configured")
		if util.IsEnterpriseDeploy() {
			return err
		}
	} else {
		log.WithContext(ctx).Infof("welcome %s", env.LicenseKey)
	}

	go CheckForUpdatesLoop(context.Background())
	return nil
}

func HasUpdates(client *retryablehttp.Client) (bool, error) {
	resp, err := client.Get("https://api.github.com/repos/highlight/highlight/releases/latest")
	if err != nil {
		return false, err
	}

	if resp.StatusCode != 200 {
		return false, e.New("bad status code from releases api")
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, err
	}

	var response struct {
		Name string `json:"name"`
	}
	if err := json.Unmarshal(data, &response); err != nil {
		return false, e.New("failed to unmarshall json response from releases api")
	}

	latestVersion := strings.TrimPrefix(response.Name, "docker-v")
	currentVersion := strings.TrimPrefix(util.Config.Release, "docker-v")

	log.WithContext(context.Background()).
		WithField("latestVersion", latestVersion).
		WithField("currentVersion", currentVersion).
		Debug("checking highlight semvers")

	if semver.Compare(currentVersion, latestVersion) > 0 {
		log.WithContext(context.Background()).
			WithField("latestVersion", latestVersion).
			WithField("currentVersion", currentVersion).
			Info("current highlight version is out of date")
		return true, nil
	}

	return false, nil
}

func CheckForUpdatesLoop(ctx context.Context) {
	client := retryablehttp.NewClient()
	var errors int
	for range time.Tick(UpdateInterval) {
		if errors > UpdateErrorsAbort {
			log.WithContext(ctx).Warn("shutting down enterprise upgrade checker")
			return
		}
		// in the future, we should trigger an automated update if one exists
		if _, err := HasUpdates(client); err != nil {
			log.WithContext(ctx).WithError(err).Warn("failed to check for upgrades")
			errors++
		}
	}
}

func GetEncryptedEnvironmentFilePath() string {
	root := projectpath.GetRoot()
	return filepath.Join(root, "env.enc")
}

func GetEnvironment(file string) (*util.Configuration, error) {
	if util.Config.LicenseKey == "" {
		return nil, e.New("no license key set")
	}

	key := sha256.Sum256([]byte(util.Config.LicenseKey))

	_, err := os.Stat(file)
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(file)
	if err != nil {
		return nil, err
	}
	ciphertext := data[:len(data)-34]
	iv, err := hex.DecodeString(string(data[len(data)-34:][1:][:32]))
	if err != nil {
		return nil, err
	}

	// CBC mode always works in whole blocks.
	if len(ciphertext)%aes.BlockSize != 0 {
		panic("ciphertext is not a multiple of the block size")
	}

	// Creating block of algorithm
	block, err := aes.NewCipher(key[:])
	if err != nil {
		return nil, err
	}

	// Creating GCM mode
	cbc := cipher.NewCBCDecrypter(block, iv)
	cbc.CryptBlocks(ciphertext, ciphertext)
	lines := strings.Split(string(ciphertext), "\n")
	envCreateStr := lines[0]
	if envCreateStr[0] != '2' {
		return nil, e.New("failed to decrypt environment file - is the build and LICENSE_KEY valid?")
	}

	envCreate, err := time.Parse(time.RFC3339, envCreateStr)
	if err != nil {
		return nil, err
	}

	if EarliestAllowedEnvironment.After(envCreate) {
		return nil, e.New("environment expired")
	}

	cfg := map[string]string{}
	for _, line := range lines[1:] {
		if !strings.Contains(line, "=") {
			continue
		}
		data := strings.SplitN(line, "=", 2)
		cfg[data[0]] = data[1]
	}

	var config util.Configuration
	if err = mapstructure.Decode(cfg, &config); err != nil {
		return nil, err
	}

	return &config, err
}
