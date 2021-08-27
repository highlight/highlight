package util

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/k0kubun/pp"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

type stackTracer interface {
	StackTrace() errors.StackTrace
}

func GraphQLErrorPresenter(service string) func(ctx context.Context, e error) *gqlerror.Error {
	return func(ctx context.Context, e error) *gqlerror.Error {
		if stackTraceError, ok := e.(stackTracer); ok {
			pp.Println("here's an error: ")
			for _, f := range stackTraceError.StackTrace() {
				pp.Printf("%+s:%d\n", f, f)
			}
		} else {
			pp.Println("nope")
		}

		log.WithFields(log.Fields{
			"error": e,
			"path":  graphql.GetPath(ctx),
		}).Errorf("%s graphql request faileddd", service)
		err := gqlerror.Errorf(e.Error())
		return err
	}
}

func GraphQLRecoverFunc() func(ctx context.Context, err interface{}) error {
	return func(ctx context.Context, err interface{}) error {
		return errors.Errorf("panic {error: %+v}", err)
	}
}
