package util

import (
	"context"

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
		err := gqlerror.Errorf(e.Error())
		return err
	}
}

func GraphQLRecoverFunc() func(ctx context.Context, err interface{}) error {
	return func(ctx context.Context, err interface{}) error {
		return errors.Errorf("panic {error: %+v}", err)
	}
}
