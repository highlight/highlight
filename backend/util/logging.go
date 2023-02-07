package util

import (
	"context"
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"

	"github.com/99designs/gqlgen/graphql"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func GraphQLErrorPresenter(service string) func(ctx context.Context, e error) *gqlerror.Error {
	return func(ctx context.Context, e error) *gqlerror.Error {
		log.WithContext(ctx).WithFields(log.Fields{
			"error": e,
			"path":  graphql.GetPath(ctx),
		}).Errorf("%s graphql request failed", service)

		var gqlerr *gqlerror.Error
		switch t := e.(type) {
		case *gqlerror.Error:
			gqlerr = t
			_ = gqlerr.Unwrap()
		default:
			gqlerr = gqlerror.Errorf(e.Error())
		}

		return gqlerr
	}
}

func GraphQLRecoverFunc() func(ctx context.Context, err interface{}) error {
	return func(ctx context.Context, err interface{}) error {
		err2 := errors.Errorf("panic {error: %+v}", err)
		highlight.RecordError(ctx, err2, attribute.String("Source", "GraphQLRecoverFunc"))
		return err2
	}
}
