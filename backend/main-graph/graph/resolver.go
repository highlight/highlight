package graph

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jinzhu/gorm"
	"github.com/k0kubun/pp"
	"github.com/sendgrid/sendgrid-go"
	"github.com/stripe/stripe-go/client"

	e "github.com/pkg/errors"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

var (
	WhitelistedUID = "GoDjf1dw7GVLJQrCHht03NsCdWb2"
	DemoSession    = os.Getenv("DEMO_SESSION")
)

type Resolver struct {
	DB           *gorm.DB
	MailClient   *sendgrid.Client
	StripeClient *client.API
}

// Prints time since 'time' and msg, fid.
// return time.Now() to reset the clock.
func profile(msg string, fid int, t time.Time) time.Time {
	pp.Printf("%v => "+msg+" took: %s \n", fid, fmt.Sprintf("%s", time.Since(t)))
	return time.Now()
}

// These are authentication methods used to make sure that data is secured.
// This'll probably get expensive at some point; they can probably be cached.
func (r *Resolver) isAdminInOrganization(ctx context.Context, org_id int) (*model.Organization, error) {
	uid := fmt.Sprintf("%v", ctx.Value("uid"))
	// If the user is me (jaykhatrimail@gmail.com) or is the getmosaic.io account, whitelist.
	if uid == WhitelistedUID {
		org := &model.Organization{}
		res := r.DB.Where(&model.Organization{Model: model.Model{ID: org_id}}).First(&org)
		if err := res.Error; err != nil || res.RecordNotFound() {
			return nil, e.Wrap(err, "error querying org")
		}
		return org, nil
	}
	orgs, err := r.Query().Organizations(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error querying orgs")
	}
	for _, o := range orgs {
		if o.ID == org_id {
			return o, nil
		}
	}
	return nil, e.New("admin doesn't exist in organization")
}

func (r *Resolver) isAdminSessionOwner(ctx context.Context, session_id int) (*model.Session, error) {
	session := &model.Session{}
	res := r.DB.Where(&model.Session{Model: model.Model{ID: session_id}}).First(&session)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "error querying session")
	}
	// This returns true if its the Whitelisted Session.
	if strconv.Itoa(session_id) == DemoSession {
		return session, nil
	}
	_, err := r.isAdminInOrganization(ctx, session.OrganizationID)
	if err != nil {
		return nil, e.Wrap(err, "error validating admin in organization")
	}
	return session, nil
}

func toDuration(duration string) (time.Duration, error) {
	d, err := strconv.ParseInt(duration, 10, 64)
	if err != nil || d <= 0 {
		return time.Duration(0), e.Wrap(err, "error parsing duration integer")
	}
	return time.Duration(int64(time.Millisecond) * d), nil
}
