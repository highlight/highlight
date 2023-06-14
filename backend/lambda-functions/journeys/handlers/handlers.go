package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
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

var separatorRegex = regexp.MustCompile(`[._~\-]+`)

func normalize(input string) string {
	noQuery := strings.Split(strings.Split(input, "?")[0], "#")[0]

	idIdx := 1
	var sb strings.Builder
	parts := strings.Split(noQuery, "/")
	for idx, p := range parts {
		if idx != 0 {
			sb.WriteString("/")
		}
		innerParts := separatorRegex.Split(p, -1)
		for idx2, p2 := range innerParts {
			if idx2 != 0 {
				sb.WriteString(".")
			}
			if strings.ContainsAny(p2, ".") {
				sb.WriteString(p2)
			} else if strings.ContainsAny(p2, "0123456789") {
				sb.WriteString(fmt.Sprintf("{id-%d}", idIdx))
				idIdx++
			} else {
				sb.WriteString(p2)
			}
		}
	}

	return sb.String()
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
	var curUrl string
	var curTimestamp int64
	var curDelta int64
	var idx int
	for _, e := range events {
		curDelta = e.Timestamp - curTimestamp
		if e.Data.Tag == "Navigate" {
			var unmarshalled string
			if err := json.Unmarshal(e.Data.Payload, &unmarshalled); err != nil {
				return nil, err
			}
			normalizedUrl := normalize(string(unmarshalled))
			if curUrl != normalizedUrl {
				if curUrl != "" {
					steps = append(steps, model.UserJourneyStep{
						SessionID: sessionId,
						Url:       curUrl,
						Delta:     curDelta,
						Index:     idx,
					})
					idx++
				}
				curUrl = normalizedUrl
				curTimestamp = e.Timestamp
				curDelta = 0
			}
		}
	}
	if curUrl != "" {
		steps = append(steps, model.UserJourneyStep{
			SessionID: sessionId,
			Url:       curUrl,
			Delta:     curDelta,
			Index:     idx,
		})
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
