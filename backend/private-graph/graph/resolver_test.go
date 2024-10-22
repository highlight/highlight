package graph

import (
	"context"
	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/env"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/integrations"
	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/openai_client"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/storage"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/lib/pq"
	"github.com/samber/lo"
	"github.com/sashabaranov/go-openai"
	"github.com/stretchr/testify/assert"

	pointy "github.com/openlyinc/pointy"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/workerpool"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
)

var DB *gorm.DB
var Store *store.Store

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO())
	var err error
	DB, err = util.CreateAndMigrateTestDB(dbName)
	Store = store.NewStore(DB, redis.NewClient(), integrations.NewIntegrationsClient(DB), &storage.FilesystemClient{}, &kafka_queue.MockMessageQueue{}, nil)
	SetupAuthClient(context.Background(), Store, Simple, nil, nil)
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}
	code := m.Run()
	os.Exit(code)
}

func TestResolver_GetSessionChunk(t *testing.T) {
	timestamps := []int64{
		1651073243208,
		1651073392851,
		1651073564534,
		1651073772378,
		1651074011838,
		1651074045741,
		1651074284153,
		1651074417161,
	}
	util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
		// inserting the data
		sessionsToInsert := []model.Session{
			{ActiveLength: 1000, ProjectID: 1, Viewed: nil},
		}
		if err := DB.Create(&sessionsToInsert).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting sessions"))
		}
		chunksToInsert := []model.EventChunk{}
		for idx, ts := range timestamps {
			chunksToInsert = append(chunksToInsert, model.EventChunk{
				SessionID:  sessionsToInsert[0].ID,
				ChunkIndex: idx,
				Timestamp:  ts,
			})
		}
		if err := DB.Create(&chunksToInsert).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting sessions"))
		}

		// test logic
		r := &queryResolver{Resolver: &Resolver{DB: DB}}
		chunkIdx, chunkTs := r.GetSessionChunk(context.TODO(), sessionsToInsert[0].ID, 792248)
		if chunkIdx != 4 {
			t.Fatalf("received incorrect chunk idx %d", chunkIdx)
		}
		if chunkTs != 23618 {
			t.Fatalf("received incorrect chunk ts %d", chunkTs)
		}
	})
}

// ensure that invite link email is checked case-insensitively with admin email
func TestMutationResolver_AddAdminToWorkspace(t *testing.T) {
	tests := map[string]struct {
		adminEmail    string
		inviteEmail   string
		errorExpected bool
	}{
		"same email same case": {
			adminEmail:    "foo@bar.com",
			inviteEmail:   "foo@bar.com",
			errorExpected: false,
		},
		"same email different case": {
			adminEmail:    "boo@bar.com",
			inviteEmail:   "bOO@Bar.com",
			errorExpected: false,
		},
		"different email": {
			adminEmail:    "zoo@bar.com",
			inviteEmail:   "z00@bar.com",
			errorExpected: true,
		},
	}
	for testName, v := range tests {
		util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
			// inserting the data
			admin := model.Admin{
				Model:         model.Model{ID: 1},
				UID:           ptr.String("a1b2c3"),
				Name:          ptr.String("adm1"),
				PhotoURL:      ptr.String("asdf"),
				EmailVerified: ptr.Bool(true),
				Email:         ptr.String(v.adminEmail),
			}
			if err := DB.Create(&admin).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting admin"))
			}
			workspace := model.Workspace{
				Name: ptr.String("test1"),
			}
			if err := DB.Create(&workspace).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting workspace"))
			}
			inviteLink := model.WorkspaceInviteLink{
				WorkspaceID:  &workspace.ID,
				InviteeEmail: ptr.String(v.inviteEmail),
				Secret:       ptr.String(testName),
			}
			if err := DB.Create(&inviteLink).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting invite link"))
			}

			// test logic
			ctx := context.Background()
			ctx = context.WithValue(ctx, model.ContextKeys.UID, *admin.UID)
			r := &mutationResolver{Resolver: &Resolver{DB: DB, PrivateWorkerPool: workerpool.New(1)}}

			t.Logf("workspace id: %v", workspace.ID)
			t.Logf("invite link: %v", *inviteLink.Secret)
			adminID, err := r.AddAdminToWorkspace(ctx, workspace.ID, *inviteLink.Secret)
			if v.errorExpected != (err != nil) {
				t.Fatalf("error result invalid, expected? %t but saw %s", v.errorExpected, err)
			}
			if err == nil && *adminID != 1 {
				t.Fatalf("received invalid admin ID %d", adminID)
			}
		})
	}
}

// ensure that admin role changes are completed by valid admins
func TestMutationResolver_ChangeAdminRole(t *testing.T) {
	tests := map[string]struct {
		currentAdminEmail string
		currentAdminRole  string
		updatingSelf      bool
		errorExpected     bool
	}{
		"member updating an admin role": {
			currentAdminEmail: "foo@bar.com",
			currentAdminRole:  "MEMBER",
			updatingSelf:      false,
			errorExpected:     true,
		},
		"admin updating their own role": {
			currentAdminEmail: "boo@bar.com",
			currentAdminRole:  "ADMIN",
			updatingSelf:      true,
			errorExpected:     true,
		},
		"admin updating an admin role": {
			currentAdminEmail: "zoo@bar.com",
			currentAdminRole:  "ADMIN",
			updatingSelf:      false,
			errorExpected:     false,
		},
	}
	for _, v := range tests {
		util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
			// inserting the data
			workspace := model.Workspace{
				Name: ptr.String("test1"),
			}

			if err := DB.Create(&workspace).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting workspace"))
			}

			currentAdmin := model.Admin{
				Model:         model.Model{ID: 1},
				UID:           ptr.String("a1b2c3"),
				Name:          ptr.String("adm1"),
				PhotoURL:      ptr.String("asdf"),
				EmailVerified: ptr.Bool(true),
				Email:         ptr.String(v.currentAdminEmail),
			}

			if err := DB.Create(&currentAdmin).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting admin"))
			}

			workspaceAdmin := model.WorkspaceAdmin{
				AdminID:     currentAdmin.ID,
				WorkspaceID: workspace.ID,
				Role:        ptr.String(v.currentAdminRole),
			}

			if err := DB.Create(&workspaceAdmin).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting workspace admin"))
			}

			var updatedAdmin model.Admin
			if v.updatingSelf {
				updatedAdmin = currentAdmin
			} else {
				updatedAdmin = model.Admin{
					Model:         model.Model{ID: 2},
					UID:           ptr.String("b2c3d4"),
					Name:          ptr.String("Amy"),
					PhotoURL:      ptr.String("hjkl"),
					EmailVerified: ptr.Bool(true),
					Email:         ptr.String("baz@bar.com"),
				}

				if err := DB.Create(&updatedAdmin).Error; err != nil {
					t.Fatal(e.Wrap(err, "error inserting admin"))
				}

				updatedWorkspaceAdmin := model.WorkspaceAdmin{
					AdminID:     updatedAdmin.ID,
					WorkspaceID: workspace.ID,
					Role:        ptr.String("ADMIN"),
				}

				if err := DB.Create(&updatedWorkspaceAdmin).Error; err != nil {
					t.Fatal(e.Wrap(err, "error inserting workspace admin"))
				}
			}

			// test logic
			ctx := context.Background()
			ctx = context.WithValue(ctx, model.ContextKeys.UID, *currentAdmin.UID)
			r := &mutationResolver{Resolver: &Resolver{DB: DB, PrivateWorkerPool: workerpool.New(1)}}

			_, err := r.ChangeAdminRole(ctx, workspace.ID, updatedAdmin.ID, "MEMBER")
			if v.errorExpected != (err != nil) {
				t.Fatalf("error result invalid, expected? %t but saw %s", v.errorExpected, err)
			}
		})
	}
}

// ensure that invites are only deleted by valid users
func TestMutationResolver_DeleteInviteLinkFromWorkspace(t *testing.T) {
	tests := map[string]struct {
		currentAdminEmail string
		currentAdminRole  string
		sameWorkspace     bool
		errorExpected     bool
		deletionExpected  bool
	}{
		"member deleting an invite": {
			currentAdminEmail: "foo@bar.com",
			currentAdminRole:  "MEMBER",
			sameWorkspace:     true,
			errorExpected:     true,
			deletionExpected:  false,
		},
		"admin deleting an invite in a different workspace": {
			currentAdminEmail: "boo@bar.com",
			currentAdminRole:  "ADMIN",
			sameWorkspace:     false,
			errorExpected:     false,
			deletionExpected:  false,
		},
		"admin deleting an invite in a their workspace": {
			currentAdminEmail: "zoo@bar.com",
			currentAdminRole:  "ADMIN",
			sameWorkspace:     true,
			errorExpected:     false,
			deletionExpected:  true,
		},
	}
	for _, v := range tests {
		util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
			// inserting the data
			workspace := model.Workspace{
				Name: ptr.String("test1"),
			}

			if err := DB.Create(&workspace).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting workspace"))
			}

			currentAdmin := model.Admin{
				Model:         model.Model{ID: 1},
				UID:           ptr.String("a1b2c3"),
				Name:          ptr.String("adm1"),
				PhotoURL:      ptr.String("asdf"),
				EmailVerified: ptr.Bool(true),
				Email:         ptr.String(v.currentAdminEmail),
			}

			if err := DB.Create(&currentAdmin).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting admin"))
			}

			workspaceAdmin := model.WorkspaceAdmin{
				AdminID:     currentAdmin.ID,
				WorkspaceID: workspace.ID,
				Role:        ptr.String(v.currentAdminRole),
			}

			if err := DB.Create(&workspaceAdmin).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting workspace admin"))
			}

			var updatedWorkspace model.Workspace
			if v.sameWorkspace {
				updatedWorkspace = workspace
			} else {
				updatedWorkspace = model.Workspace{
					Name: ptr.String("test2"),
				}

				if err := DB.Create(&updatedWorkspace).Error; err != nil {
					t.Fatal(e.Wrap(err, "error inserting workspace"))
				}
			}

			// create invite
			inviteLink := model.WorkspaceInviteLink{
				WorkspaceID:  ptr.Int(updatedWorkspace.ID),
				InviteeEmail: ptr.String("bam@bar.com"),
				InviteeRole:  ptr.String("Member"),
				Secret:       ptr.String("asdf"),
			}

			if err := DB.Create(&inviteLink).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting workspace invite link"))
			}

			// test logic
			ctx := context.Background()
			ctx = context.WithValue(ctx, model.ContextKeys.UID, *currentAdmin.UID)
			r := &mutationResolver{Resolver: &Resolver{DB: DB, PrivateWorkerPool: workerpool.New(1)}}

			response, err := r.DeleteInviteLinkFromWorkspace(ctx, workspace.ID, inviteLink.ID)
			if v.errorExpected != (err != nil) {
				t.Fatalf("error result invalid, expected? %t but saw %s", v.errorExpected, err)
			}
			if v.deletionExpected != response {
				t.Fatalf("deletion result invalid, expected? %t but saw %t", v.deletionExpected, response)
			}
		})
	}
}

const defaultQueryResponse = `{"query":"environment=production AND secure_session_id EXISTS","date_range":{"start_date":"","end_date":""}}`

type OpenAiTestImpl struct {
}

func (o *OpenAiTestImpl) InitClient(apiKey string) error {
	return nil
}

func (o *OpenAiTestImpl) CreateChatCompletion(ctx context.Context, request openai.ChatCompletionRequest) (openai.ChatCompletionResponse, error) {
	respMessage := openai.ChatCompletionResponse{
		Choices: []openai.ChatCompletionChoice{
			{
				Index: 0,
				Message: openai.ChatCompletionMessage{
					Content: defaultQueryResponse,
				},
			},
		},
	}

	// find the system prompt
	systemPrompt := ""
	for _, message := range request.Messages {
		if message.Role == "system" {
			systemPrompt = message.Content
			break
		}
	}

	// if an empty query is inputted, return an empty response in the 'query' field
	if request.Messages[len(request.Messages)-1].Content == "" {
		respMessage.Choices[0].Message.Content = `{"query":"","date_range":{"start_date":"","end_date":""}}`
	}

	// if a bad query is inputted, and the prompt handles these inputs, return an empty response in the 'query' field
	if request.Messages[len(request.Messages)-1].Content == openai_client.IrrelevantQuery && strings.Contains(systemPrompt, openai_client.IrrelevantQueryFunctionalityIndicator) {
		respMessage.Choices[0].Message.Content = `{"query":"","date_range":{"start_date":"","end_date":""}}`
	}

	return respMessage, nil
}

func TestResolver_GetAIQuerySuggestion(t *testing.T) {
	tests := map[string]struct {
		productType modelInputs.ProductType
		query       string
	}{
		"error logs with date range": {
			productType: modelInputs.ProductTypeLogs,
			query:       "all logs with level error, between 4pm yesterday and just now.",
		},
		"irrelevant query": {
			productType: modelInputs.ProductTypeLogs,
			query:       openai_client.IrrelevantQuery,
		},
		"empty query": {
			productType: modelInputs.ProductTypeLogs,
			query:       "",
		},
	}
	for _, v := range tests {
		util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
			clickhouseClient, err := clickhouse.NewClient(clickhouse.TestDatabase)
			if err != nil {
				t.Fatalf("error creating clickhouse client: %v", err)
			}
			r := &queryResolver{Resolver: &Resolver{
				DB:               DB,
				Redis:            redis.NewClient(),
				ClickhouseClient: clickhouseClient,
				OpenAiClient:     &OpenAiTestImpl{},
			},
			}
			ctx := context.WithValue(context.Background(), model.ContextKeys.UID, "abc")
			admin, err := r.getCurrentAdmin(ctx)
			if err != nil {
				t.Fatal(e.Wrap(err, "error creating admin"))
			}

			w := model.Workspace{
				Name: ptr.String("test1"),
			}
			if err := DB.Create(&w).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting workspace"))
			}

			if err := DB.Model(&w).Association("Admins").Append(admin); err != nil {
				t.Fatal(e.Wrap(err, "error inserting workspace"))
			}

			p := model.Project{WorkspaceID: w.ID}
			if err := DB.Create(&p).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting project"))
			}

			out, err := r.AiQuerySuggestion(ctx, "America/New_York", p.ID, v.productType, v.query)

			if err != nil {
				if (v.query == openai_client.IrrelevantQuery || v.query == "") && err.Error() == openai_client.MalformedPromptError.Error() {
					t.Logf("successful malformed handling of output \n %+v", err.Error())
				} else {
					t.Fatalf("error in query suggestion %+v", err)
				}
			} else {
				t.Logf("query output \n %+v", out.Query)
				t.Logf("date output \n %+v %+v", out.DateRange.StartDate, out.DateRange.EndDate)
			}
		})
	}
}

func TestResolver_GetSlackChannelsFromSlack(t *testing.T) {
	tests := map[string]struct {
		accessToken    *string
		expNumChannels int
		expError       bool
	}{
		"no token": {
			accessToken:    nil,
			expNumChannels: 0,
			expError:       false,
		},
		"fake token": {
			accessToken:    pointy.String("foo"),
			expNumChannels: 0,
			// not a real token - should get an error from slack
			expError: true,
		},
	}
	for _, v := range tests {
		util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
			workspace := model.Workspace{
				Name:             ptr.String("test1"),
				SlackAccessToken: v.accessToken,
			}
			if err := DB.Create(&workspace).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting workspace"))
			}

			ctx := context.Background()
			r := &queryResolver{Resolver: &Resolver{DB: DB, Redis: redis.NewClient()}}

			_, num, err := r.GetSlackChannelsFromSlack(ctx, workspace.ID)
			if v.expError != (err != nil) {
				t.Fatalf("error result invalid, expected? %t but saw %s", v.expError, err)
			}
			if err == nil && num != v.expNumChannels {
				t.Fatalf("received invalid num channels %d, expected %d", num, v.expNumChannels)
			}
		})
	}
}

func TestResolver_canAdminViewSession(t *testing.T) {
	tests := map[string]struct {
		secureID string
		expError bool
		public   bool
		demo     bool
	}{
		"valid session": {
			secureID: "abc123",
		},
		"public session": {
			secureID: "abc123",
			public:   true,
		},
		"demo session": {
			secureID: "abc123",
			demo:     true,
		},
		"invalid session": {
			secureID: "a1b2c3",
			expError: true,
		},
	}
	for _, v := range tests {
		util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
			redisClient := redis.NewClient()
			ctx := context.WithValue(context.Background(), model.ContextKeys.UID, "a1b2c3")
			if err := redisClient.Cache.Delete(ctx, "session-secure-abc123"); err != nil {
				t.Fatal(err)
			}
			r := &queryResolver{Resolver: &Resolver{DB: DB, Store: Store}}

			w := model.Workspace{}
			if err := DB.Create(&w).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting workspace"))
			}

			if !v.public {
				admin, _ := r.getCurrentAdmin(ctx)
				if err := DB.Model(&w).Association("Admins").Append(admin); err != nil {
					t.Fatal(e.Wrap(err, "error inserting workspace"))
				}
			}

			p := model.Project{WorkspaceID: w.ID}
			if err := DB.Create(&p).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting project"))
			}
			if v.demo {
				env.Config.DemoProjectID = strconv.Itoa(p.ID)
			} else {
				env.Config.DemoProjectID = "0"
			}

			session := model.Session{
				SecureID:  "abc123",
				ProjectID: p.ID,
				IsPublic:  v.public,
			}
			if err := DB.Create(&session).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting session"))
			}

			s, err := r.canAdminViewSession(ctx, v.secureID)
			if v.expError {
				if err == nil {
					t.Fatal("error result invalid, saw nil")
				}
			} else if err != nil {
				t.Fatalf("saw unexpected error %s", err)
			} else if s.SecureID != v.secureID {
				t.Fatalf("received invalid session %s, expected %s", s.SecureID, v.secureID)
			}
		})
	}
}

func TestResolver_isAdminInProjectOrDemoProject(t *testing.T) {
	tests := map[string]struct {
		expError bool
	}{
		"valid session": {
			expError: false,
		},
		"invalid session": {
			expError: true,
		},
	}
	for _, v := range tests {
		util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
			ctx := context.WithValue(context.Background(), model.ContextKeys.UID, "a1b2c3")
			r := &queryResolver{Resolver: &Resolver{DB: DB}}

			w := model.Workspace{}
			if err := DB.Create(&w).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting workspace"))
			}

			admin, _ := r.getCurrentAdmin(ctx)
			if err := DB.Model(&w).Association("Admins").Append(admin); err != nil {
				t.Fatal(e.Wrap(err, "error inserting workspace"))
			}

			p := model.Project{WorkspaceID: w.ID}
			if err := DB.Create(&p).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting project"))
			}

			id := p.ID
			if v.expError {
				id += 1
			}
			pr, err := r.isUserInProjectOrDemoProject(ctx, id)
			if v.expError {
				if err == nil {
					t.Fatalf("error result invalid, saw %s", err)
				}
			} else if err != nil {
				t.Fatalf("saw unexpected error %s", err)
			} else if pr.ID != id {
				t.Fatalf("received invalid project %d, expected %d", pr.ID, id)
			}
		})
	}
}

func TestResolver_AccessLevels(t *testing.T) {
	ctx := context.WithValue(context.Background(), model.ContextKeys.UID, "a1b2c3")
	r := &queryResolver{}

	tests := map[string]struct {
		role       string
		projectIds pq.Int32Array
		passing    [](func() error)
		erroring   [](func() error)
	}{
		"admin": {
			role:       "ADMIN",
			projectIds: nil,
			passing: []func() error{
				func() error {
					_, err := r.isUserInProjectOrDemoProject(ctx, 0)
					return err
				},
				func() error {
					_, err := r.isUserInProjectOrDemoProject(ctx, 1)
					return err
				},
				func() error {
					_, err := r.isUserInProjectOrDemoProject(ctx, 2)
					return err
				},
				func() error {
					_, err := r.isUserInProject(ctx, 1)
					return err
				},
				func() error {
					_, err := r.isUserInProject(ctx, 2)
					return err
				},
				func() error {
					_, err := r.isUserWorkspaceAdmin(ctx, 1)
					return err
				},
				func() error {
					_, err := r.isUserInWorkspace(ctx, 1)
					return err
				},
				func() error {
					_, err := r.isUserInWorkspaceReadOnly(ctx, 1)
					return err
				},
			},
			erroring: []func() error{
				func() error {
					_, err := r.isUserInProjectOrDemoProject(ctx, 3)
					return err
				},
				func() error {
					_, err := r.isUserInProject(ctx, 3)
					return err
				},
				func() error {
					_, err := r.isUserWorkspaceAdmin(ctx, 2)
					return err
				},
				func() error {
					_, err := r.isUserInWorkspace(ctx, 2)
					return err
				},
				func() error {
					_, err := r.isUserInWorkspaceReadOnly(ctx, 2)
					return err
				},
			},
		},
		"workspace member": {
			role:       "MEMBER",
			projectIds: nil,
			passing: []func() error{
				func() error {
					_, err := r.isUserInProjectOrDemoProject(ctx, 0)
					return err
				},
				func() error {
					_, err := r.isUserInProjectOrDemoProject(ctx, 1)
					return err
				},
				func() error {
					_, err := r.isUserInProjectOrDemoProject(ctx, 2)
					return err
				},
				func() error {
					_, err := r.isUserInProject(ctx, 1)
					return err
				},
				func() error {
					_, err := r.isUserInProject(ctx, 2)
					return err
				},
				func() error {
					_, err := r.isUserInWorkspace(ctx, 1)
					return err
				},
				func() error {
					_, err := r.isUserInWorkspaceReadOnly(ctx, 1)
					return err
				},
			},
			erroring: []func() error{
				func() error {
					_, err := r.isUserWorkspaceAdmin(ctx, 1)
					return err
				},
				func() error {
					_, err := r.isUserInProjectOrDemoProject(ctx, 3)
					return err
				},
				func() error {
					_, err := r.isUserInProject(ctx, 3)
					return err
				},
				func() error {
					_, err := r.isUserWorkspaceAdmin(ctx, 2)
					return err
				},
				func() error {
					_, err := r.isUserInWorkspace(ctx, 2)
					return err
				},
				func() error {
					_, err := r.isUserInWorkspaceReadOnly(ctx, 2)
					return err
				},
			},
		},
		"project member": {
			role:       "MEMBER",
			projectIds: pq.Int32Array{1},
			passing: []func() error{
				func() error {
					_, err := r.isUserInProjectOrDemoProject(ctx, 0)
					return err
				},
				func() error {
					_, err := r.isUserInProjectOrDemoProject(ctx, 1)
					return err
				},
				func() error {
					_, err := r.isUserInProject(ctx, 1)
					return err
				},
				func() error {
					_, err := r.isUserInWorkspaceReadOnly(ctx, 1)
					return err
				},
			},
			erroring: []func() error{
				func() error {
					_, err := r.isUserInProjectOrDemoProject(ctx, 2)
					return err
				},
				func() error {
					_, err := r.isUserInProject(ctx, 2)
					return err
				},
				func() error {
					_, err := r.isUserWorkspaceAdmin(ctx, 1)
					return err
				},
				func() error {
					_, err := r.isUserInWorkspace(ctx, 1)
					return err
				},
				func() error {
					_, err := r.isUserInProjectOrDemoProject(ctx, 3)
					return err
				},
				func() error {
					_, err := r.isUserInProject(ctx, 3)
					return err
				},
				func() error {
					_, err := r.isUserWorkspaceAdmin(ctx, 2)
					return err
				},
				func() error {
					_, err := r.isUserInWorkspace(ctx, 2)
					return err
				},
				func() error {
					_, err := r.isUserInWorkspaceReadOnly(ctx, 2)
					return err
				},
			},
		},
	}
	for _, v := range tests {
		util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
			env.Config.DemoProjectID = "0"

			r.Resolver = &Resolver{DB: DB}
			if err := DB.Create(&model.Workspace{Model: model.Model{ID: 1}}).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating workspace 1"))
			}

			if err := DB.Create(&model.Workspace{Model: model.Model{ID: 2}}).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating workspace 2"))
			}

			if err := DB.Exec(`insert into projects (id, workspace_id) values (0, 0)`).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating project 0"))
			}

			if err := DB.Create(&model.Project{Model: model.Model{ID: 1}, WorkspaceID: 1}).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating project 1"))
			}

			if err := DB.Create(&model.Project{Model: model.Model{ID: 2}, WorkspaceID: 1}).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating project 2"))
			}

			if err := DB.Create(&model.Project{Model: model.Model{ID: 3}, WorkspaceID: 2}).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating project 2"))
			}

			admin := model.Admin{
				Model:         model.Model{ID: 1},
				UID:           ptr.String("a1b2c3"),
				EmailVerified: ptr.Bool(true),
			}
			if err := DB.Create(&admin).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating admin"))
			}

			workspaceAdmin := model.WorkspaceAdmin{
				AdminID:     admin.ID,
				WorkspaceID: 1,
				Role:        &v.role,
				ProjectIds:  v.projectIds,
			}
			if err := DB.Create(&workspaceAdmin).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating workspace admin"))
			}

			for _, p := range v.passing {
				assert.NoError(t, p())
			}

			for _, p := range v.erroring {
				assert.Error(t, p())
			}
		})
	}
}

func TestResolver_ProjectAccess(t *testing.T) {
	ctx := context.WithValue(context.Background(), model.ContextKeys.UID, "a1b2c3")
	r := &queryResolver{}

	tests := map[string]struct {
		role               string
		projectIds         pq.Int32Array
		expectedProjectIds []int
	}{
		"admin": {
			role:               "ADMIN",
			projectIds:         nil,
			expectedProjectIds: []int{1, 2},
		},
		"workspace member": {
			role:               "MEMBER",
			projectIds:         nil,
			expectedProjectIds: []int{1, 2},
		},
		"project member": {
			role:               "MEMBER",
			projectIds:         pq.Int32Array{1},
			expectedProjectIds: []int{1},
		},
	}
	for _, v := range tests {
		util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
			r.Resolver = &Resolver{DB: DB}
			if err := DB.Create(&model.Workspace{Model: model.Model{ID: 1}}).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating workspace 1"))
			}

			if err := DB.Create(&model.Workspace{Model: model.Model{ID: 2}}).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating workspace 2"))
			}

			if err := DB.Exec(`insert into projects (id, workspace_id) values (0, 0)`).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating project 0"))
			}

			if err := DB.Create(&model.Project{Model: model.Model{ID: 1}, WorkspaceID: 1}).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating project 1"))
			}

			if err := DB.Create(&model.Project{Model: model.Model{ID: 2}, WorkspaceID: 1}).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating project 2"))
			}

			if err := DB.Create(&model.Project{Model: model.Model{ID: 3}, WorkspaceID: 2}).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating project 2"))
			}

			admin := model.Admin{
				Model:         model.Model{ID: 1},
				UID:           ptr.String("a1b2c3"),
				EmailVerified: ptr.Bool(true),
			}
			if err := DB.Create(&admin).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating admin"))
			}

			workspaceAdmin := model.WorkspaceAdmin{
				AdminID:     admin.ID,
				WorkspaceID: 1,
				Role:        &v.role,
				ProjectIds:  v.projectIds,
			}
			if err := DB.Create(&workspaceAdmin).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating workspace admin"))
			}

			projects, err := r.Projects(ctx)
			assert.NoError(t, err)
			ids := lo.Map(projects, func(p *model.Project, _ int) int {
				return p.ID
			})
			assert.Equal(t, v.expectedProjectIds, ids)
		})
	}
}

func TestGetSlackChannelsFromSlack(t *testing.T) {
	token := env.Config.SlackTestAccessToken
	if token == "" {
		t.Skip("TEST_SLACK_ACCESS_TOKEN is not set")
	}
	util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
		w := model.Workspace{SlackAccessToken: pointy.String(token)}
		if err := DB.Create(&w).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting workspace"))
		}

		r := &queryResolver{Resolver: &Resolver{DB: DB, Redis: redis.NewClient()}}
		channels, count, err := r.GetSlackChannelsFromSlack(context.Background(), w.ID)
		assert.NoError(t, err)
		assert.NotNil(t, channels)
		assert.Greater(t, count, 0)
		assert.Greater(t, len(*channels), 0)
	})
}

func TestCreateAllModels(t *testing.T) {
	util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
		for _, dbModel := range model.Models {
			switch typ := dbModel.(type) {
			// OAuthClientStore has a not-null constraint on Domains
			case *model.OAuthClientStore:
				typ.Domains = pq.StringArray{}
			}
			assert.NoError(t, DB.Create(dbModel).Error)
		}
	})
}

func TestAdminEmailAddresses(t *testing.T) {
	util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
		w1 := model.Workspace{}
		if err := DB.Create(&w1).Error; err != nil {
			t.Fatal(e.Wrap(err, "error creating workspace w1"))
		}

		w2 := model.Workspace{}
		if err := DB.Create(&w2).Error; err != nil {
			t.Fatal(e.Wrap(err, "error creating workspace w2"))
		}

		for _, info := range []struct {
			AdminID     int
			WorkspaceID int
			Email       string
			Role        string
		}{
			{1, w1.ID, "admin@example.com", "ADMIN"},
			{2, w1.ID, "member@example.com", "MEMBER"},
			{3, w2.ID, "admin2@example.com", "ADMIN"},
			{4, w2.ID, "member2@example.com", "MEMBER"},
		} {
			admin := model.Admin{
				Model: model.Model{ID: info.AdminID},
				Email: &info.Email,
			}

			if err := DB.Create(&admin).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating admin"))
			}

			workspaceAdmin := model.WorkspaceAdmin{
				AdminID:     info.AdminID,
				WorkspaceID: info.WorkspaceID,
				Role:        &info.Role,
			}

			if err := DB.Create(&workspaceAdmin).Error; err != nil {
				t.Fatal(e.Wrap(err, "error creating workspace admin"))
			}
		}

		addrs, err := w1.AdminEmailAddresses(DB)
		assert.NoError(t, err)
		assert.Len(t, addrs, 1)
		if len(addrs) > 0 {
			assert.Equal(t, addrs[0].AdminID, 1)
			assert.Equal(t, addrs[0].Email, "admin@example.com")
		}

		addrs, err = w2.AdminEmailAddresses(DB)
		assert.NoError(t, err)
		assert.Len(t, addrs, 1)
		if len(addrs) > 0 {
			assert.Equal(t, addrs[0].AdminID, 3)
			assert.Equal(t, addrs[0].Email, "admin2@example.com")
		}
	})
}

func TestUpdateSessionIsPublic(t *testing.T) {
	util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
		admin := model.Admin{UID: ptr.String("a1b2c3")}
		if err := DB.Create(&admin).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting admin"))
		}

		workspace := model.Workspace{
			Name: ptr.String("test1"),
		}
		if err := DB.Create(&workspace).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting workspace"))
		}

		if err := DB.Create(&model.WorkspaceAdmin{
			WorkspaceID: workspace.ID, AdminID: admin.ID,
		}).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting workspace"))
		}

		settings := model.AllWorkspaceSettings{
			WorkspaceID:           workspace.ID,
			EnableUnlistedSharing: true,
		}
		if err := DB.Create(&settings).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting workspace settings"))
		}

		project := model.Project{
			Name:        ptr.String("p1"),
			WorkspaceID: workspace.ID,
		}
		if err := DB.Create(&project).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting project"))
		}

		session := model.Session{ProjectID: project.ID, SecureID: "abc123"}
		if err := DB.Create(&session).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting sessions"))
		}
		assert.False(t, session.IsPublic)

		// test logic
		ctx := context.Background()
		ctx = context.WithValue(ctx, model.ContextKeys.UID, *admin.UID)
		assert.NoError(t, redis.NewClient().FlushDB(ctx))

		r := &mutationResolver{Resolver: &Resolver{DB: DB, Store: Store}}
		_ = r.Store.Redis.FlushDB(ctx)

		s, err := r.UpdateSessionIsPublic(ctx, session.SecureID, true)
		assert.NoError(t, err)
		assert.True(t, s.IsPublic)

		if err := DB.Model(&model.Session{}).Where(&model.Session{SecureID: "abc123"}).Take(&session).Error; err != nil {
			t.Fatal(e.Wrap(err, "error reading sessions"))
		}
		assert.True(t, session.IsPublic)

		s, err = r.UpdateSessionIsPublic(ctx, session.SecureID, false)
		assert.NoError(t, err)
		assert.False(t, s.IsPublic)

		if err := DB.Model(&model.Session{}).Where(&model.Session{SecureID: "abc123"}).Take(&session).Error; err != nil {
			t.Fatal(e.Wrap(err, "error reading sessions"))
		}
		assert.False(t, session.IsPublic)
	})
}

// ensure that invite link email is checked case-insensitively with admin email
func TestQueryResolver_updateBillingDetails(t *testing.T) {
	util.RunTestWithDBWipe(t, DB, func(t *testing.T) {
		start := time.Now().AddDate(0, 0, 1)
		end := start.AddDate(0, 1, 0)
		workspace := model.Workspace{
			Name:               ptr.String("test1"),
			BillingPeriodStart: &start,
			BillingPeriodEnd:   &end,
			NextInvoiceDate:    &end,
		}
		if err := DB.Create(&workspace).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting workspace"))
		}

		hs := model.BillingEmailHistory{
			Active: true, WorkspaceID: workspace.ID,
			Type: email.BillingTracesUsage80Percent,
		}
		if err := DB.Create(&hs).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting BillingEmailHistory"))
		}

		hs2 := model.BillingEmailHistory{
			Active: true, WorkspaceID: workspace.ID,
			Type: email.BillingSessionOverage,
		}
		if err := DB.Create(&hs2).Error; err != nil {
			t.Fatal(e.Wrap(err, "error inserting BillingEmailHistory"))
		}

		// test logic
		ctx := context.Background()
		r := &queryResolver{Resolver: &Resolver{DB: DB, Redis: redis.NewClient()}}

		err := r.updateBillingDetails(ctx, workspace.ID, &planDetails{
			modelInputs.PlanTypeEnterprise, true, &start, &end, &end,
		})
		assert.NoError(t, err)

		hs = model.BillingEmailHistory{}
		if err := DB.Model(&model.BillingEmailHistory{}).Where(&model.BillingEmailHistory{Type: email.BillingTracesUsage80Percent}).Take(&hs).Error; err != nil {
			t.Fatal(e.Wrap(err, "error querying BillingEmailHistory"))
		}
		assert.False(t, hs.Active)

		hs = model.BillingEmailHistory{}
		if err := DB.Model(&model.BillingEmailHistory{}).Where(&model.BillingEmailHistory{Type: email.BillingSessionOverage}).Take(&hs).Error; err != nil {
			t.Fatal(e.Wrap(err, "error querying BillingEmailHistory"))
		}
		assert.True(t, hs.Active)
	})
}
