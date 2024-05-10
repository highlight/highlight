package graph

import (
	"context"
	"fmt"
	"github.com/99designs/gqlgen/graphql"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	"go.opentelemetry.io/otel/trace"
	"sync"
	"time"
)

type OAuthValidator interface {
	graphql.HandlerExtension
	graphql.FieldInterceptor
}

type Tracer struct {
	store               *store.Store
	clientRequests      map[string]uint64
	clientRequestsMutex sync.RWMutex
}

func NewGraphqlOAuthValidator(store *store.Store) OAuthValidator {
	tracer := Tracer{
		store:          store,
		clientRequests: make(map[string]uint64),
	}
	go tracer.flushClientRequests()
	return &tracer
}

func (t *Tracer) flushClientRequests() {
	ctx := context.Background()
	for {
		t.clientRequestsMutex.RLock()
		for clientID, requests := range t.clientRequests {
			span, _ := util.StartSpanFromContext(ctx, "private.oauth.count", util.WithSpanKind(trace.SpanKindServer), util.Tag("client_id", clientID), util.Tag("requests", requests))
			span.Finish()
		}
		t.clientRequestsMutex.RUnlock()

		t.clientRequestsMutex.Lock()
		t.clientRequests = make(map[string]uint64)
		t.clientRequestsMutex.Unlock()
		time.Sleep(5 * time.Second)
	}
}

func (t *Tracer) ExtensionName() string {
	return "HighlightOAuthValidator"
}

func (t *Tracer) Validate(graphql.ExecutableSchema) error {
	return nil
}

func (t *Tracer) InterceptField(ctx context.Context, next graphql.Resolver) (interface{}, error) {
	clientID, _ := ctx.Value(model.ContextKeys.OAuthClientID).(string)
	if clientID == "" {
		return next(ctx)
	}

	span, ctx := util.StartSpanFromContext(ctx, "private.oauth.field", util.Tag("client_id", clientID))
	defer span.Finish()

	t.clientRequestsMutex.Lock()
	if _, ok := t.clientRequests[clientID]; !ok {
		t.clientRequests[clientID] = 0
	}
	t.clientRequests[clientID]++
	t.clientRequestsMutex.Unlock()

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
	span.SetAttribute("field_name", fieldName)
	// TODO(vkorolik) rate limit based on opConfig
	_, found := lo.Find(client.Operations, func(item *model.OAuthOperation) bool {
		return item.AuthorizedGraphQLOperation == fieldName
	})

	if !found {
		return nil, e.New(fmt.Sprintf("403 - AuthorizationError: %s", fieldName))
	}

	return next(ctx)
}
