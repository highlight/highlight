package util

import (
	"context"

	"github.com/highlight-run/highlight-go"

	"github.com/99designs/gqlgen/graphql"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func GraphQLErrorPresenter(service string) func(ctx context.Context, e error) *gqlerror.Error {
	return func(ctx context.Context, e error) *gqlerror.Error {
		log.WithFields(log.Fields{
			"error": e,
			"path":  graphql.GetPath(ctx),
		}).Errorf("%s graphql request failed", service)
		err := highlight.ConsumeError(ctx, e)
		if err != nil {
			log.WithError(err).Error("[highlight-go] error consuming error")
		}
		gqlerr := gqlerror.Errorf(e.Error())
		return gqlerr
	}
}

func GraphQLRecoverFunc() func(ctx context.Context, err interface{}) error {
	return func(ctx context.Context, err interface{}) error {
		return errors.Errorf("panic {error: %+v}", err)
	}
}
