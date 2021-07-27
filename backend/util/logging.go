package util

import (
	"context"

	log "github.com/sirupsen/logrus"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func GraphQLErrorPresenter(service string) func(ctx context.Context, e error) *gqlerror.Error {
	return func(ctx context.Context, e error) *gqlerror.Error {
		log.WithFields(log.Fields{
			"error": e,
		}).Errorf("%s graphql request failed", service)
		err := gqlerror.Errorf(e.Error())
		return err
	}
}
