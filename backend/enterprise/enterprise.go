package enterprise

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/hex"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/mitchellh/mapstructure"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"os"
	"strings"
	"time"
)

const UpdateInterval = time.Minute

var EarliestAllowedEnvironment = time.Now().AddDate(-1, 0, 0)

// TODO(vkorolik)
// const EnvironmentFile = "/.env"
const EnvironmentFile = "/home/vkorolik/work/highlight/docker/env.enc"

func Start(ctx context.Context) {
	env, err := GetEnvironment()
	if err != nil {
		log.WithContext(ctx).WithError(err).Info("enterprise service not configured")
		return
	} else {
		log.WithContext(ctx).Infof("welcome %s", env.LicenseKey)
	}

	go CheckForUpdates(context.Background())
}

func CheckForUpdates(ctx context.Context) {
	for range time.Tick(UpdateInterval) {
		// TODO(vkorolik) check for updates
	}
}

func GetEnvironment() (*util.Configuration, error) {
	if util.Config.LicenseKey == "" {
		return nil, e.New("no license key set")
	}

	key := sha256.Sum256([]byte(util.Config.LicenseKey))

	_, err := os.Stat(EnvironmentFile)
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(EnvironmentFile)
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
