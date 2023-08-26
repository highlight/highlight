package graph

import (
	"context"
	"os"
	"strconv"
	"testing"

	"github.com/highlight-run/highlight/backend/integrations"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/storage"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/stretchr/testify/assert"

	pointy "github.com/openlyinc/pointy"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/workerpool"
	"github.com/leonelquinteros/hubspot"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	_ "gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/util"
)

var DB *gorm.DB

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO()).WithFields(log.Fields{"DB_HOST": os.Getenv("PSQL_HOST"), "DB_NAME": dbName})
	var err error
	DB, err = util.CreateAndMigrateTestDB(dbName)
	SetupAuthClient(context.Background(), Simple, nil, nil)
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

type HubspotMock struct{}

func (h *HubspotMock) CreateContactForAdmin(ctx context.Context, adminID int, email string, userDefinedRole, userDefinedPersona, userDefinedTeamSize string, first string, last string, phone string, referral string) error {
	return nil
}

func (h *HubspotMock) CreateContactCompanyAssociation(ctx context.Context, adminID int, workspaceID int) error {
	return nil
}

func (h *HubspotMock) CreateCompanyForWorkspace(ctx context.Context, workspaceID int, adminEmail string, name string) error {
	return nil
}

func (h *HubspotMock) UpdateContactProperty(ctx context.Context, adminID int, properties []hubspot.Property) error {
	return nil

}

func (h *HubspotMock) UpdateCompanyProperty(ctx context.Context, workspaceID int, properties []hubspot.Property) error {
	return nil

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
			r := &mutationResolver{Resolver: &Resolver{DB: DB, HubspotApi: &HubspotMock{}, PrivateWorkerPool: workerpool.New(1)}}

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
			r := &mutationResolver{Resolver: &Resolver{DB: DB, HubspotApi: &HubspotMock{}, PrivateWorkerPool: workerpool.New(1)}}

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
			r := &mutationResolver{Resolver: &Resolver{DB: DB, HubspotApi: &HubspotMock{}, PrivateWorkerPool: workerpool.New(1)}}

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
			ctx := context.Background()
			if err := redisClient.Cache.Delete(ctx, "session-secure-abc123"); err != nil {
				t.Fatal(err)
			}
			r := &queryResolver{Resolver: &Resolver{DB: DB, Store: store.NewStore(DB, &opensearch.Client{}, redisClient, integrations.NewIntegrationsClient(DB), &storage.FilesystemClient{})}}

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
				_ = os.Setenv("DEMO_PROJECT_ID", strconv.Itoa(p.ID))
			} else {
				_ = os.Setenv("DEMO_PROJECT_ID", "0")
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
			ctx := context.Background()
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
			pr, err := r.isAdminInProjectOrDemoProject(ctx, id)
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

func TestGetSlackChannelsFromSlack(t *testing.T) {
	token := os.Getenv("TEST_SLACK_ACCESS_TOKEN")
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
