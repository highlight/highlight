package util

import (
	"context"
	"github.com/99designs/gqlgen/graphql"
	log "github.com/sirupsen/logrus"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func GraphQLErrorPresenter(service string) func(ctx context.Context, e error) *gqlerror.Error {
	return func(ctx context.Context, e error) *gqlerror.Error {
		log.WithContext(ctx).WithFields(log.Fields{
			"error": e,
			"path":  graphql.GetPath(ctx),
		}).Warnf("%s graphql request failed", service)

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
