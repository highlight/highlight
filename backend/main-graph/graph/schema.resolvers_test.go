package graph

import (
	"testing"

	"github.com/99designs/gqlgen/client"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/jay-khatri/fullstory/backend/main-graph/graph/generated"
	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jay-khatri/fullstory/mocks"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc/resolver"
)

func TestSessionsBeta(t *testing.T) {
	t.Run("should return a list of sessions", func(t *testing.T) {
		testDB := new(mocks.MockedGormDB)
		resolvers := resolver.Resolver{DB: testDB}
		c := client.New(handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &resolvers})))
		ue := model.Session{OrganizationID: 0}
		//testUserService.On("ValidateAccessToken", mock.AnythingOfType("string")).Return(&ue)
		var resp struct {
			SessionResults struct{ Sessions, TotalCount int }
		}
		q := `
      mutation { 
        sessionsBETA(organizationID: "0") { 
		  sessions,
		  totalCount, 
        } 
      }
    `
		c.MustPost(q, &resp)
		testDB.AssertExpectations(t)
		require.Equal(t, 1, len(resp.SessionResults.Sessions))
	})
}
