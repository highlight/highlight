package enterprise

import (
	"context"
	"crypto"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rsa"
	"crypto/sha512"
	"crypto/x509"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"github.com/hashicorp/go-retryablehttp"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/projectpath"
	"github.com/mitchellh/mapstructure"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/pbkdf2"
	"golang.org/x/mod/semver"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const UpdateInterval = time.Minute
const UpdateErrorsAbort = 10

func Start(ctx context.Context) error {
	environ, err := GetEnvironment(GetEncryptedEnvironmentFilePath(), GetEncryptedEnvironmentDigestFilePath())
	if err != nil {
		log.WithContext(ctx).WithError(err).Info("enterprise service not configured")
		if env.IsEnterpriseDeploy() {
			return e.Wrap(err, "highlight enterprise mode configured but failed to start license checker")
		}
	} else {
		log.WithContext(ctx).
			WithField("environment_valid_until", environ.EnterpriseEnvExpiration).
			Info("welcome to highlight.io enterprise")
		if env.IsEnterpriseDeploy() {
			environ.CopyTo(&env.Config)
			log.WithContext(ctx).
				Info("applied enterprise environment file")
		}
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
	currentVersion := strings.TrimPrefix(env.Config.Release, "docker-v")

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
	client.Logger = nil

	timer := time.NewTicker(UpdateInterval)
	defer timer.Stop()

	var errors int
	for range timer.C {
		if errors > UpdateErrorsAbort {
			log.WithContext(ctx).Warn("shutting down enterprise upgrade checker")
			return
		}
		// in the future, we should trigger an automated update if one exists
		if _, err := HasUpdates(client); err != nil {
			log.WithContext(ctx).WithError(err).Warn("failed to check for upgrades")
			errors++
		} else {
			errors = 0
		}
	}
}

func GetEncryptedEnvironmentFilePath() string {
	root := projectpath.GetRoot()
	return filepath.Join(root, "env.enc")
}

func GetEncryptedEnvironmentDigestFilePath() string {
	root := projectpath.GetRoot()
	return filepath.Join(root, "env.enc.dgst")
}

func GetEnvironment(file, digest string) (*env.Configuration, error) {
	if env.Config.LicenseKey == "" {
		return nil, e.New("no license key set")
	}

	key := pbkdf2.Key([]byte(env.Config.LicenseKey), nil, 1000000, 32, sha512.New)

	_, err := os.Stat(file)
	if err != nil {
		return nil, err
	}
	_, err = os.Stat(digest)
	if err != nil {
		return nil, err
	}

	digestData, err := os.ReadFile(digest)
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

	spkiBlock, _ := pem.Decode([]byte(env.GetEnterpriseEnvPublicKey()))
	if spkiBlock == nil {
		return nil, e.New("failed to read environment public key")
	}
	var spkiKey *rsa.PublicKey
	pubInterface, err := x509.ParsePKIXPublicKey(spkiBlock.Bytes)
	if err != nil {
		return nil, e.Wrap(err, "failed to parse environment public key")
	}
	spkiKey = pubInterface.(*rsa.PublicKey)

	hashed := sha512.Sum512(data)
	if err := rsa.VerifyPKCS1v15(spkiKey, crypto.SHA512, hashed[:], digestData); err != nil {
		return nil, err
	}

	// CBC mode always works in whole blocks.
	if len(ciphertext)%aes.BlockSize != 0 {
		return nil, e.New("ciphertext is not a multiple of the block size")
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
	envExpireStr := lines[0]
	if envExpireStr[0] != '2' {
		return nil, e.New("failed to decrypt environment file - is the LICENSE_KEY valid?")
	}

	envExpire, err := time.Parse(time.RFC3339, envExpireStr)
	if err != nil {
		return nil, err
	}

	if time.Now().After(envExpire) {
		return nil, e.New(fmt.Sprintf("environment expired as of %s", envExpireStr))
	}

	cfg := map[string]string{}
	for _, line := range lines[1:] {
		if !strings.Contains(line, "=") {
			continue
		}
		data := strings.SplitN(line, "=", 2)
		dec := base64.NewDecoder(base64.StdEncoding, strings.NewReader(data[1]))
		envValue, err := io.ReadAll(dec)
		if err != nil {
			return nil, err
		}
		cfg[data[0]] = string(envValue)
	}

	config := env.Configuration{EnterpriseEnvExpiration: envExpire}
	if err = mapstructure.Decode(cfg, &config); err != nil {
		return nil, err
	}

	return &config, err
}
