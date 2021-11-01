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

		var gqlerr *gqlerror.Error
		switch t := e.(type) {
		case *gqlerror.Error:
			gqlerr = t
			e = gqlerr.Unwrap()
		}

		err := highlight.ConsumeError(ctx, e)
		if err != nil &&
			err.Error() != "context does not contain highlightSessionSecureID; context must have injected values from highlight.InterceptRequest" &&
			err.Error() != "context does not contain highlightRequestSecureID; context must have injected values from highlight.InterceptRequest" {
			log.WithError(err).Error("[highlight-go] error consuming error")
		}
		return gqlerr
	}
}

func GraphQLRecoverFunc() func(ctx context.Context, err interface{}) error {
	return func(ctx context.Context, err interface{}) error {
		return errors.Errorf("panic {error: %+v}", err)
	}
}
