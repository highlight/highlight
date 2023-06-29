package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"

	"github.com/andybalholm/brotli"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/openlyinc/pointy"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/lambda-functions/journeys/utils"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

var nonAlphanumericRegex = regexp.MustCompile(`[^a-zA-Z]+`)
var capitalsRegex = regexp.MustCompile(`[A-Z]+`)

type Handlers interface {
	GetProjectIds(context.Context, utils.JourneyInput) ([]utils.JourneyResponse, error)
}

type handlers struct {
	db       *gorm.DB
	s3Client *s3.Client
}

func InitHandlers(db *gorm.DB, s3Client *s3.Client) *handlers {
	return &handlers{
		db:       db,
		s3Client: s3Client,
	}
}

func NewHandlers() *handlers {
	ctx := context.TODO()
	db, err := model.SetupDB(ctx, os.Getenv("PSQL_DB"))
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error setting up DB"))
	}

	cfgEast2, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-2"))
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error loading default from config"))
	}
	s3Client := s3.NewFromConfig(cfgEast2, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	return InitHandlers(db, s3Client)
}

type navigateData struct {
	Payload json.RawMessage `json:"payload"`
	Tag     string          `json:"tag"`
}

type navigateEvent struct {
	Timestamp int64        `json:"Timestamp"`
	Data      navigateData `json:"data"`
}

func isId(input string) bool {
	if strings.ContainsAny(input, "0123456789") {
		return true
	}

	input = nonAlphanumericRegex.ReplaceAllString(input, ",")
	input = capitalsRegex.ReplaceAllString(input, ",$1")
	input = strings.ToLower(input)
	parts := strings.Split(input, ",")

	for _, p := range parts {
		if !strings.ContainsAny(p, "aeiouy") {
			return true
		}

		consonantCount := 0
		for _, c := range p {
			if strings.ContainsRune("bcdfghjklmnpqrstvwxz", c) {
				consonantCount++
				if consonantCount > 4 {
					return true
				}
			} else {
				consonantCount = 0
			}
		}
	}

	return false
}

func normalize(input string) (string, error) {
	parsed, err := url.Parse(input)
	if err != nil {
		return "", nil
	}

	idIdx := 1
	var sb strings.Builder
	parts := strings.Split(parsed.Path, "/")
	for idx, p := range parts {
		// Skip if part is empty (this also removes trailing slashes)
		if p == "" {
			continue
		}

		if idx != 0 {
			sb.WriteString("/")
		}
		if isId(p) {
			sb.WriteString(fmt.Sprintf("{id-%d}", idIdx))
			idIdx++
		} else {
			sb.WriteString(p)
		}
	}

	return sb.String(), nil
}

func (h *handlers) GetSessions(ctx context.Context, projectId int) ([]int, error) {
	prefix := fmt.Sprintf("v2/%d/", projectId)
	regex := regexp.MustCompile(fmt.Sprintf(`v2\/%d\/(\d+)\/timeline-indicator-events`, projectId))
	sessions := []int{}
	var continuationToken *string
	for {
		resp, err := h.s3Client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
			Bucket:            pointy.String("highlight-session-data"),
			Prefix:            pointy.String(prefix),
			ContinuationToken: continuationToken,
		})
		if err != nil {
			return nil, err
		}
		for _, item := range resp.Contents {
			if item.Key != nil && strings.Contains(*item.Key, "timeline-indicator-events") {
				res := regex.FindAllStringSubmatch(*item.Key, 1)
				sessionId, err := strconv.Atoi(res[0][1])
				if err != nil {
					return nil, err
				}
				sessions = append(sessions, sessionId)
			}
		}

		if !resp.IsTruncated {
			break
		}
		continuationToken = resp.NextContinuationToken
		log.WithContext(ctx).Info(len(sessions))
	}

	return sessions, nil
}

func (h *handlers) GetJourneyImpl(sessionId int, data []byte) ([]model.UserJourneyStep, error) {
	var events []navigateEvent
	if err := json.Unmarshal(data, &events); err != nil {
		return nil, err
	}

	steps := []model.UserJourneyStep{}
	var curUrl string = "START"
	var curTimestamp int64
	var curDelta int64
	var idx int
	for _, e := range events {
		if e.Data.Tag == "Navigate" {
			curDelta = e.Timestamp - curTimestamp
			var unmarshalled string
			if err := json.Unmarshal(e.Data.Payload, &unmarshalled); err != nil {
				return nil, err
			}
			normalizedUrl, err := normalize(string(unmarshalled))
			if err != nil {
				return nil, err
			}
			if curUrl != normalizedUrl && curDelta >= 1000 {
				steps = append(steps, model.UserJourneyStep{
					SessionID: sessionId,
					Url:       curUrl,
					Index:     idx,
				})
				idx++
			}
			curUrl = normalizedUrl
			curTimestamp = e.Timestamp
		}
	}
	if curUrl != "" {
		steps = append(steps, model.UserJourneyStep{
			SessionID: sessionId,
			Url:       curUrl,
			NextUrl:   "END",
			Index:     idx,
		})
	}
	for idx, s := range steps {
		if idx == len(steps)-1 {
			continue
		}
		s.NextUrl = steps[idx+1].Url
	}

	return steps, nil
}

func (h *handlers) GetJourney(ctx context.Context, input utils.JourneyInput) (*utils.JourneyResponse, error) {
	output, err := h.s3Client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: pointy.String("highlight-session-data"),
		Key:    pointy.String(fmt.Sprintf("v2/%d/%d/timeline-indicator-events", input.ProjectID, input.SessionID)),
	})
	if err != nil {
		return nil, err
	}

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(output.Body)
	if err != nil {
		return nil, err
	}

	out := &bytes.Buffer{}
	if _, err := io.Copy(out, brotli.NewReader(buf)); err != nil {
		return nil, err
	}

	steps, err := h.GetJourneyImpl(input.SessionID, out.Bytes())
	if err != nil {
		return nil, err
	}

	h.db.Model(&model.UserJourneyStep{}).Save(&steps)

	return &utils.JourneyResponse{
		ProjectID: input.ProjectID,
		SessionID: input.SessionID,
		Count:     len(steps),
	}, nil
}
