package graph

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jinzhu/gorm"
	"github.com/sendgrid/sendgrid-go"

	b64 "encoding/base64"

	e "github.com/pkg/errors"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

var (
	WhitelistedUID = "GoDjf1dw7GVLJQrCHht03NsCdWb2"
	Salt           = b64.StdEncoding.EncodeToString([]byte("afdl;vmq32938lwdfkasdfjslacj23j423fujdsa1240a7euavjnsdqo3rjjfsduf"))
	Seperator      = "+++"
)

type Resolver struct {
	DB         *gorm.DB
	MailClient *sendgrid.Client
}

// These are authentication methods used to make sure that data is secured.
// This'll probably get expensive at some point; they can probably be cached.
func (r *Resolver) isAdminInOrganization(ctx context.Context, org_id int) (*model.Organization, error) {
	uid := fmt.Sprintf("%v", ctx.Value("uid"))
	// If the user is me (jaykhatrimail@gmail.com) or is the getmosaic.io account, whitelist.
	if uid == WhitelistedUID || org_id == 15 {
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

func encode(i int) string {
	return reverse(b64.StdEncoding.EncodeToString([]byte(strconv.Itoa(i))))
}

func decode(s string) (int, error) {
	decoded, err := b64.StdEncoding.DecodeString(reverse(s))
	if err != nil {
		return -1, e.Wrap(err, "error decoding invite string")
	}
	i, err := strconv.Atoi(string(decoded))
	if err != nil {
		return -1, e.Wrap(err, "error converting string org id")
	}
	return i, nil
}

func reverse(s string) (ret string) {
	for _, v := range s {
		defer func(r rune) { ret += string(r) }(v)
	}
	return
}
