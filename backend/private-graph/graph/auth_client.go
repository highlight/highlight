package graph

import (
	"context"
	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"fmt"
	"github.com/go-ldap/ldap/v3"
	"github.com/golang-jwt/jwt/v4"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
	saml2 "github.com/russellhaering/gosaml2"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
	"strings"
	"time"
)

type Client interface {
	updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error)
	GetUser(ctx context.Context, uid string) (*auth.UserRecord, error)
	PerformLogin(ctx context.Context, credentials LoginCredentials) (map[string]interface{}, error)
}

type SimpleAuthClient struct{}

type PasswordAuthClient struct{}

type FirebaseAuthClient struct {
	AuthClient *auth.Client
}

type LDAPAuthClient struct {
	LDAPClient ldap.Client
}

// TODO(vkorolik) use oauth2 instead
type SAMLAuthClient struct {
	SAMClient *saml2.SAMLServiceProvider
}

func (c *PasswordAuthClient) GetUser(_ context.Context, uid string) (*auth.UserRecord, error) {
	return &auth.UserRecord{
		UserInfo:      GetPasswordAuthUser(uid),
		EmailVerified: true,
	}, nil
}

func (c *PasswordAuthClient) PerformLogin(ctx context.Context, credentials LoginCredentials) (map[string]interface{}, error) {
	if AdminPassword == "" {
		return nil, e.New("Password auth mode not properly configured.")
	}
	if AdminPassword != credentials.Password {
		return nil, e.New(LoginError)
	}

	user := GetPasswordAuthUser(credentials.Email)

	atClaims := jwt.MapClaims{}
	atClaims["authorized"] = true
	atClaims["exp"] = time.Now().Add(AdminPasswordTokenDuration).Unix()
	atClaims["email"] = user.Email
	atClaims["uid"] = user.Email
	at := jwt.NewWithClaims(jwt.SigningMethodHS256, atClaims)

	token, err := at.SignedString([]byte(JwtAccessSecret))
	if err != nil {
		return nil, err
	}

	response := make(map[string]interface{})
	response["token"] = token
	response["user"] = user
	return response, nil
}

func (c *PasswordAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error) {
	return updateContextWithJWTToken(ctx, token)
}

func (c *SimpleAuthClient) GetUser(_ context.Context, uid string) (*auth.UserRecord, error) {
	return &auth.UserRecord{
		UserInfo:      GetPasswordAuthUser(uid),
		EmailVerified: true,
	}, nil
}

func (c *SimpleAuthClient) PerformLogin(_ context.Context, _ LoginCredentials) (map[string]interface{}, error) {
	// SimpleAuthClient does not support login
	return nil, e.New(LoginFlowError)
}

func (c *SimpleAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error) {
	ctx = context.WithValue(ctx, model.ContextKeys.UID, "demo@example.com")
	ctx = context.WithValue(ctx, model.ContextKeys.Email, "demo@example.com")
	return ctx, nil
}

func (c *FirebaseAuthClient) GetUser(ctx context.Context, uid string) (*auth.UserRecord, error) {
	return c.AuthClient.GetUser(ctx, uid)
}

func (c *FirebaseAuthClient) PerformLogin(_ context.Context, _ LoginCredentials) (map[string]interface{}, error) {
	// FirebaseAuthClient does not support login as the login flow happens client-side
	return nil, e.New(LoginFlowError)
}

func (c *FirebaseAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error) {
	var uid string
	email := ""
	if token != "" {
		t, err := c.AuthClient.VerifyIDToken(context.Background(), token)
		if err != nil {
			return ctx, e.Wrap(err, "invalid id token")
		}
		uid = t.UID
		if userRecord, err := c.AuthClient.GetUser(context.Background(), uid); err == nil {
			email = userRecord.Email

			// This is to prevent attackers from impersonating Highlight staff.
			_, isAdmin := lo.Find(HighlightAdminEmailDomains, func(domain string) bool { return strings.Contains(email, domain) })
			if isAdmin && !userRecord.EmailVerified {
				email = ""
			}
		}
	}
	ctx = context.WithValue(ctx, model.ContextKeys.UID, uid)
	ctx = context.WithValue(ctx, model.ContextKeys.Email, email)
	return ctx, nil
}

func (c *LDAPAuthClient) GetUser(_ context.Context, uid string) (*auth.UserRecord, error) {
	searchRequest := ldap.NewSearchRequest(
		"dc=example,dc=com", // The base dn to search
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		"(&(objectClass=organizationalPerson))", // The filter to apply
		[]string{"dn", "cn"},                    // A list attributes to retrieve
		nil,
	)

	sr, err := c.LDAPClient.Search(searchRequest)
	if err != nil {
		log.Fatal(err)
	}

	for _, entry := range sr.Entries {
		fmt.Printf("%s: %v\n", entry.DN, entry.GetAttributeValue("cn"))
	}

	// TODO(vkorolik)

	atClaims := jwt.MapClaims{}
	atClaims["authorized"] = true
	atClaims["exp"] = time.Now().Add(AdminPasswordTokenDuration).Unix()
	atClaims["email"] = user.Email
	atClaims["uid"] = user.Email
	at := jwt.NewWithClaims(jwt.SigningMethodHS256, atClaims)

	token, err := at.SignedString([]byte(JwtAccessSecret))
	if err != nil {
		return nil, err
	}

	response := make(map[string]interface{})
	response["token"] = token
	response["user"] = user
	return response, nil
}

func (c *LDAPAuthClient) PerformLogin(_ context.Context, _ LoginCredentials) (map[string]interface{}, error) {
	// FirebaseAuthClient does not support login as the login flow happens client-side
	return nil, e.New(LoginFlowError)
}

func (c *LDAPAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error) {
	return updateContextWithJWTToken(ctx, token)
}

func (c *SAMLAuthClient) GetUser(_ context.Context, uid string) (*auth.UserRecord, error) {
	// TODO(vkorolik)
	return &auth.UserRecord{
		UserInfo:      GetPasswordAuthUser(uid),
		EmailVerified: true,
	}, nil
}

func (c *SAMLAuthClient) updateContextWithAuthenticatedUser(ctx context.Context, token string) (context.Context, error) {
	return updateContextWithJWTToken(ctx, token)
}

func NewFirebaseClient(ctx context.Context) *FirebaseAuthClient {
	secret := env.Config.AuthFirebaseSecret
	creds, err := google.CredentialsFromJSON(context.Background(), []byte(secret),
		"https://www.googleapis.com/auth/firebase",
		"https://www.googleapis.com/auth/identitytoolkit",
		"https://www.googleapis.com/auth/userinfo.email")
	if err != nil {
		log.WithContext(ctx).Errorf("error converting credentials from json: %v", err)
		return nil
	}
	app, err := firebase.NewApp(context.Background(), nil, option.WithCredentials(creds))
	if err != nil {
		log.WithContext(ctx).Errorf("error initializing firebase app: %v", err)
		return nil
	}
	// create a client to communicate with firebase project
	var client *auth.Client
	if client, err = app.Auth(context.Background()); err != nil {
		log.WithContext(ctx).Errorf("error creating firebase client: %v", err)
		return nil
	}
	return &FirebaseAuthClient{AuthClient: client}
}

func NewLDAPClient(ctx context.Context) *LDAPAuthClient {
	l, err := ldap.DialURL(fmt.Sprintf("%s:%d", "ldap.example.com", 389))
	if err != nil {
		log.WithContext(ctx).WithError(err).Fatalf("failed to connect to ldap server")
	}
	defer l.Close()

	return &LDAPAuthClient{
		LDAPClient: l,
	}
}

func NewSAMLClient(ctx context.Context) *SAMLAuthClient {
	return &SAMLAuthClient{}
}

func authenticateToken(tokenString string) (jwt.MapClaims, error) {
	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(JwtAccessSecret), nil
	})
	if err != nil {
		return claims, e.Wrap(err, "invalid id token")
	}

	exp, ok := claims["exp"]
	if !ok {
		return claims, e.Wrap(err, "invalid exp claim")
	}

	expClaim := int64(exp.(float64))
	if time.Now().After(time.Unix(expClaim, 0)) {
		return claims, e.Wrap(err, "token expired")
	}

	return claims, nil
}

func updateContextWithJWTToken(ctx context.Context, token string) (context.Context, error) {
	var uid string
	email := ""

	if token != "" {
		claims, err := authenticateToken(token)
		if err != nil {
			return ctx, err
		}

		email = claims["email"].(string)
		uid = claims["uid"].(string)
	}

	ctx = context.WithValue(ctx, model.ContextKeys.UID, uid)
	ctx = context.WithValue(ctx, model.ContextKeys.Email, email)
	return ctx, nil
}
