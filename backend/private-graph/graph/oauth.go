package graph

import (
	"context"
	"github.com/99designs/gqlgen/graphql"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/samber/lo"
)

type OAuthValidator interface {
	graphql.HandlerExtension
	graphql.OperationInterceptor
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

// InterceptOperation is called for each incoming query
func (t Tracer) InterceptOperation(ctx context.Context, next graphql.OperationHandler) graphql.ResponseHandler {
	clientID, _ := ctx.Value(model.ContextKeys.OAuthClientID).(string)
	if clientID == "" {
		return next(ctx)
	}

	if !graphql.HasOperationContext(ctx) {
		return next(ctx)
	}

	client, err := t.store.GetOAuth(ctx, clientID)
	if err != nil {
		return func(ctx context.Context) *graphql.Response {
			return graphql.ErrorResponse(ctx, "unauthorized")
		}
	}

	operation := graphql.GetOperationContext(ctx).OperationName
	// TODO(vkorolik) rate limit based on opConfig
	_, found := lo.Find(client.Operations, func(item *model.OAuthOperation) bool {
		return item.AuthorizedGraphQLOperation == operation
	})

	if !found {
		return func(ctx context.Context) *graphql.Response {
			return graphql.ErrorResponse(ctx, "unauthorized to perform operation %s", operation)
		}
	}

	return next(ctx)
}
