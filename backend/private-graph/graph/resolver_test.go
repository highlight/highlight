package graph

import (
	"context"
	"os"
	"testing"

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
	util.RunTestWithDBWipe(t, "Test Chunk", DB, func(t *testing.T) {
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

func (h *HubspotMock) CreateContactForAdmin(ctx context.Context, adminID int, email string, userDefinedRole string, userDefinedPersona string, first string, last string, phone string, referral string) error {
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
		util.RunTestWithDBWipe(t, "Test AddAdminToWorkspace", DB, func(t *testing.T) {
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
