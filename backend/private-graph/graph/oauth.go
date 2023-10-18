package graph

import (
	"context"
	"fmt"
	"github.com/99designs/gqlgen/graphql"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/store"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
)

type OAuthValidator interface {
	graphql.HandlerExtension
	graphql.FieldInterceptor
}

type Tracer struct {
	store *store.Store
}

func NewGraphqlOAuthValidator(store *store.Store) OAuthValidator {
	return Tracer{store: store}
}

func (t Tracer) ExtensionName() string {
	return "HighlightOAuthValidator"
}

func (t Tracer) Validate(graphql.ExecutableSchema) error {
	return nil
}

func (t Tracer) InterceptField(ctx context.Context, next graphql.Resolver) (interface{}, error) {
	clientID, _ := ctx.Value(model.ContextKeys.OAuthClientID).(string)
	if clientID == "" {
		return next(ctx)
	}

	if !graphql.HasOperationContext(ctx) {
		return next(ctx)
	}

	client, err := t.store.GetOAuth(ctx, clientID)
	if err != nil {
		return nil, AuthorizationError
	}

	fc := graphql.GetFieldContext(ctx)
	if fc == nil || (fc.Object != "Query" && fc.Object != "Mutation") {
		return next(ctx)
	}

	fieldName := fc.Field.Name
	// TODO(vkorolik) rate limit based on opConfig
	_, found := lo.Find(client.Operations, func(item *model.OAuthOperation) bool {
		return item.AuthorizedGraphQLOperation == fieldName
	})

	if !found {
		return nil, e.New(fmt.Sprintf("403 - AuthorizationError: %s", fieldName))
	}

	return next(ctx)
}
