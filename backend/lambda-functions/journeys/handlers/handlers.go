package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"github.com/andybalholm/brotli"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/lambda-functions/journeys/utils"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/openlyinc/pointy"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const normalnessTimeout = 10 * 60 * 1000

var nonAlphanumericRegex = regexp.MustCompile(`[^a-zA-Z]+`)
var capitalsRegex = regexp.MustCompile(`[A-Z]+`)

type Handlers interface {
	UpdateNormalnessScores(ctx context.Context) error
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
	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
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
	// Assume a string is an id if it contains a number
	if strings.ContainsAny(input, "0123456789") {
		return true
	}

	// Replace any non-alphanumeric character with a comma
	input = nonAlphanumericRegex.ReplaceAllString(input, ",")
	// Add a comma in front of any capital
	input = capitalsRegex.ReplaceAllString(input, ",$1")
	input = strings.ToLower(input)
	// Split on comma boundaries
	parts := strings.Split(input, ",")

	for _, p := range parts {
		// If there are no vowels in the word part, assume it's an id
		if !strings.ContainsAny(p, "aeiouy") {
			return true
		}

		// If there are 5 or more consonants in a row, assume it's an id
		consonantCount := 0
		for _, c := range p {
			if strings.ContainsRune("bcdfghjklmnpqrstvwxz", c) {
				consonantCount++
				if consonantCount >= 5 {
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
	for _, p := range parts {
		// Skip if part is empty (this also removes trailing slashes)
		if p == "" {
			continue
		}

		sb.WriteString("/")
		// If the path part is an id, replace it with {id-N}
		if isId(p) {
			sb.WriteString(fmt.Sprintf("{id-%d}", idIdx))
			idIdx++
		} else {
			sb.WriteString(p)
		}
	}

	return sb.String(), nil
}

// Returns a list of all sessions for a given project id with `timeline-indicator-events` files in S3
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

		if resp.IsTruncated == nil || !*resp.IsTruncated {
			break
		}
		continuationToken = resp.NextContinuationToken
		log.WithContext(ctx).Info(len(sessions))
	}

	return sessions, nil
}

// Returns a list of user journey steps from a `timeline-indicator-events` file
func GetUserJourneySteps(projectId int, sessionId int, data []byte) ([]model.UserJourneyStep, error) {
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
					ProjectID: projectId,
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
			ProjectID: projectId,
			SessionID: sessionId,
			Url:       curUrl,
			NextUrl:   "END",
			Index:     idx,
		})
	}
	for idx := range steps {
		if idx == len(steps)-1 {
			continue
		}
		steps[idx].NextUrl = steps[idx+1].Url
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

	steps, err := GetUserJourneySteps(input.ProjectID, input.SessionID, out.Bytes())
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

func (h *handlers) UpdateNormalnessScores(ctx context.Context) error {
	err := h.db.Transaction(func(tx *gorm.DB) error {
		err := tx.Exec(fmt.Sprintf("SET LOCAL statement_timeout TO %d", normalnessTimeout)).Error
		if err != nil {
			return err
		}

		return tx.Exec(`
			with frequencies as (
				select project_id, url, next_url, count(*)
				from user_journey_steps
				where created_at > now() - interval '30 days'
				group by 1, 2, 3),
			unscored_sessions as (
				select id
				from sessions
				where created_at > now() - interval '1 day'
				and (normalness is null or normalness = 0)
				and processed
				and not excluded
			),
			new_normals as (
				select session_id, exp(sum(ln(normalness))) as normalness
				from (select session_id,
					index,
					sum(case when f.url = u.url and f.next_url = u.next_url then count else 0 end)
						* (sum(case when f.url = u.url then count else 0 end))
						/ sum((case when f.url = u.url then count else 0 end) ^ 2) as normalness
				from unscored_sessions s
					inner join user_journey_steps u
						on s.id = u.session_id
					inner join frequencies f
						on f.url = u.url and f.project_id = u.project_id
				group by session_id, index
				order by session_id, index) a
				group by a.session_id
			)
			update sessions s
			set normalness = n.normalness
			from new_normals n
			where s.id = n.session_id
		`).Error
	})

	return err
}
