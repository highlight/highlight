package graph

import (
	"context"
	"encoding/json"
	"os"
	"reflect"
	"strconv"
	"testing"
	"time"

	"github.com/highlight-run/highlight/backend/redis"

	"github.com/aws/smithy-go/ptr"
	"github.com/go-test/deep"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/pricing"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/highlight-run/highlight/backend/timeseries"
	"github.com/openlyinc/pointy"
	"github.com/stretchr/testify/assert"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	_ "gorm.io/driver/postgres"

	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	publicModel "github.com/highlight-run/highlight/backend/public-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
)

var resolver *Resolver

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	dbName := "highlight_testing_db"
	testLogger := log.WithContext(context.TODO()).WithFields(log.Fields{"DB_HOST": os.Getenv("PSQL_HOST"), "DB_NAME": dbName})
	var err error
	db, err := util.CreateAndMigrateTestDB("highlight_testing_db")
	if err != nil {
		testLogger.Error(e.Wrap(err, "error creating testdb"))
	}

	redisClient := redis.NewClient()

	resolver = &Resolver{
		DB:    db,
		TDB:   timeseries.New(context.TODO()),
		Store: store.NewStore(db, &opensearch.Client{}, redisClient),
		Redis: redisClient,
	}
	code := m.Run()
	os.Exit(code)
}

func TestProcessBackendPayloadImpl(t *testing.T) {
	trpcTraceStr := "[{\"columnNumber\":11,\"lineNumber\":80,\"fileName\":\"/workspace/src/trpc/instance.ts\",\"source\":\"    at /workspace/src/trpc/instance.ts:80:11\",\"lineContent\":\"    throw new TRPCError({\\n\",\"linesBefore\":\"        organizationId,\\n        supabaseAccessToken,\\n      },\\n    });\\n  } catch (error) {\\n\",\"linesAfter\":\"      code: \\\"UNAUTHORIZED\\\",\\n    });\\n  }\\n});\\n\\n\"},{\"columnNumber\":38,\"lineNumber\":421,\"fileName\":\"/workspace/node_modules/@trpc/server/dist/index.js\",\"functionName\":\"callRecursive\",\"source\":\"    at callRecursive (/workspace/node_modules/@trpc/server/dist/index.js:421:38)\",\"lineContent\":\"                const result = await middleware({\\n\",\"linesBefore\":\"            ctx: opts.ctx\\n        })=\u003e{\\n            try {\\n                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion\\n                const middleware = _def.middlewares[callOpts.index];\\n\",\"linesAfter\":\"                    ctx: callOpts.ctx,\\n                    type: opts.type,\\n                    path: opts.path,\\n                    rawInput: opts.rawInput,\\n                    meta: _def.meta,\\n\"},{\"columnNumber\":30,\"lineNumber\":449,\"fileName\":\"/workspace/node_modules/@trpc/server/dist/index.js\",\"functionName\":\"resolve\",\"source\":\"    at resolve (/workspace/node_modules/@trpc/server/dist/index.js:449:30)\",\"lineContent\":\"        const result = await callRecursive();\\n\",\"linesBefore\":\"                    marker: middlewareMarker\\n                };\\n            }\\n        };\\n        // there's always at least one \\\"next\\\" since we wrap this.resolver in a middleware\\n\",\"linesAfter\":\"        if (!result) {\\n            throw new TRPCError.TRPCError({\\n                code: 'INTERNAL_SERVER_ERROR',\\n                message: 'No result from middlewares - did you forget to `return next()`?'\\n            });\\n\"},{\"columnNumber\":12,\"lineNumber\":228,\"fileName\":\"/workspace/node_modules/@trpc/server/dist/config-7b65d7da.js\",\"functionName\":\"Object.callProcedure\",\"source\":\"    at Object.callProcedure (/workspace/node_modules/@trpc/server/dist/config-7b65d7da.js:228:12)\",\"lineContent\":\"    return procedure(opts);\\n\",\"linesBefore\":\"            code: 'NOT_FOUND',\\n            message: `No \\\"${type}\\\"-procedure on path \\\"${path}\\\"`\\n        });\\n    }\\n    const procedure = opts.procedures[path];\\n\",\"linesAfter\":\"}\\n\\n/**\\n * The default check to see if we're in a server\\n */ const isServerDefault = typeof window === 'undefined' || 'Deno' in window || globalThis.process?.env?.NODE_ENV === 'test' || !!globalThis.process?.env?.JEST_WORKER_ID;\\n\"},{\"columnNumber\":45,\"lineNumber\":125,\"fileName\":\"/workspace/node_modules/@trpc/server/dist/resolveHTTPResponse-83d9b5ff.js\",\"source\":\"    at /workspace/node_modules/@trpc/server/dist/resolveHTTPResponse-83d9b5ff.js:125:45\",\"lineContent\":\"                const output = await config.callProcedure({\\n\",\"linesBefore\":\"        };\\n        const inputs = getInputs();\\n        const rawResults = await Promise.all(paths.map(async (path, index)=\u003e{\\n            const input = inputs[index];\\n            try {\\n\",\"linesAfter\":\"                    procedures: router._def.procedures,\\n                    path,\\n                    rawInput: input,\\n                    ctx,\\n                    type\\n\"},{\"columnNumber\":52,\"lineNumber\":122,\"fileName\":\"/workspace/node_modules/@trpc/server/dist/resolveHTTPResponse-83d9b5ff.js\",\"functionName\":\"Object.resolveHTTPResponse\",\"source\":\"    at Object.resolveHTTPResponse (/workspace/node_modules/@trpc/server/dist/resolveHTTPResponse-83d9b5ff.js:122:52)\",\"lineContent\":\"        const rawResults = await Promise.all(paths.map(async (path, index)=\u003e{\\n\",\"linesBefore\":\"                input[k] = value;\\n            }\\n            return input;\\n        };\\n        const inputs = getInputs();\\n\",\"linesAfter\":\"            const input = inputs[index];\\n            try {\\n                const output = await config.callProcedure({\\n                    procedures: router._def.procedures,\\n                    path,\\n\"},{\"columnNumber\":5,\"lineNumber\":96,\"fileName\":\"node:internal/process/task_queues\",\"functionName\":\"processTicksAndRejections\",\"source\":\"    at processTicksAndRejections (node:internal/process/task_queues:96:5)\"},{\"columnNumber\":20,\"lineNumber\":53,\"fileName\":\"/workspace/node_modules/@trpc/server/dist/nodeHTTPRequestHandler-e6a535cb.js\",\"functionName\":\"Object.nodeHTTPRequestHandler\",\"source\":\"    at Object.nodeHTTPRequestHandler (/workspace/node_modules/@trpc/server/dist/nodeHTTPRequestHandler-e6a535cb.js:53:20)\",\"lineContent\":\"    const result = await resolveHTTPResponse.resolveHTTPResponse({\\n\",\"linesBefore\":\"        method: opts.req.method,\\n        headers: opts.req.headers,\\n        query,\\n        body: bodyResult.ok ? bodyResult.data : undefined\\n    };\\n\",\"linesAfter\":\"        batching: opts.batching,\\n        responseMeta: opts.responseMeta,\\n        path,\\n        createContext,\\n        router,\\n\"}]"
	util.RunTestWithDBWipe(t, resolver.DB, func(t *testing.T) {
		workspace := model.Workspace{}
		resolver.DB.Create(&workspace)

		project := model.Project{WorkspaceID: workspace.ID}
		resolver.DB.Create(&project)

		resolver.ProcessBackendPayloadImpl(context.Background(), nil, ptr.String(project.VerboseID()), []*publicModel.BackendErrorObjectInput{{
			SessionSecureID: nil,
			RequestID:       nil,
			TraceID:         nil,
			SpanID:          nil,
			LogCursor:       new(string),
			Event:           "dummy event",
			Type:            "",
			URL:             "",
			Source:          "",
			StackTrace:      trpcTraceStr,
			Timestamp:       time.Time{},
			Payload:         nil,
			Service: &publicModel.ServiceInput{
				Name:    "my-app",
				Version: "abc123",
			},
		}})

		var result *model.ErrorObject
		err := resolver.DB.Model(&model.ErrorObject{
			ProjectID: project.ID,
		}).Where(&model.ErrorObject{Event: "dummy event"}).Take(&result).Error
		assert.NoError(t, err)

		if *result.StackTrace != trpcTraceStr {
			t.Fatal("stacktrace changed after processing")
		}

		assert.Equal(t, "my-app", result.ServiceName)
		assert.Equal(t, "abc123", result.ServiceVersion)
	})
}

func TestHandleErrorAndGroup(t *testing.T) {
	projectID := 1

	// construct table of sub-tests to run
	longTraceStr := `[{"functionName":"is","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null},{"functionName":"longer","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null},{"functionName":"trace","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null}]`
	shortTraceStr := `[{"functionName":"a","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null},{"functionName":"short","args":null,"fileName":null,"lineNumber":null,"columnNumber":null,"isEval":null,"isNative":null,"source":null}]`
	tests := map[string]struct {
		errorsToInsert      []model.ErrorObject
		expectedErrorGroups []model.ErrorGroup
	}{
		"test two errors with same environment but different case": {
			errorsToInsert: []model.ErrorObject{
				{
					Event:       "error",
					ProjectID:   projectID,
					Environment: "dev",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
					StackTrace:  &shortTraceStr,
				},
				{
					Event:       "error",
					ProjectID:   projectID,
					Environment: "dEv",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
					StackTrace:  &shortTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:        "error",
					ProjectID:    projectID,
					State:        privateModel.ErrorStateOpen,
					Environments: `{"dev":2}`,
				},
			},
		},
		"test two errors with different environment": {
			errorsToInsert: []model.ErrorObject{
				{
					Event:       "error",
					ProjectID:   projectID,
					Environment: "dev",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
					StackTrace:  &shortTraceStr,
				},
				{
					Event:       "error",
					ProjectID:   projectID,
					Environment: "prod",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
					StackTrace:  &shortTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:        "error",
					ProjectID:    projectID,
					State:        privateModel.ErrorStateOpen,
					Environments: `{"dev":1,"prod":1}`,
				},
			},
		},
		"two errors, one with empty environment": {
			errorsToInsert: []model.ErrorObject{
				{
					ProjectID:   projectID,
					Environment: "dev",
					Model:       model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
					Event:       "error",
					StackTrace:  &shortTraceStr,
				},
				{
					Event:      "error",
					ProjectID:  projectID,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
					StackTrace: &shortTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:        "error",
					ProjectID:    projectID,
					State:        privateModel.ErrorStateOpen,
					Environments: `{"dev":1}`,
				},
			},
		},
		"test longer error stack first": {
			errorsToInsert: []model.ErrorObject{
				{
					Event:      "error",
					ProjectID:  projectID,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
					StackTrace: &longTraceStr,
				},
				{
					Event:      "error",
					ProjectID:  projectID,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
					StackTrace: &shortTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:        "error",
					ProjectID:    projectID,
					StackTrace:   shortTraceStr,
					State:        privateModel.ErrorStateOpen,
					Environments: `{}`,
				},
			},
		},
		"test shorter error stack first": {
			errorsToInsert: []model.ErrorObject{
				{
					Event:      "error",
					ProjectID:  projectID,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 1},
					StackTrace: &shortTraceStr,
				},
				{
					Event:      "error",
					ProjectID:  projectID,
					Model:      model.Model{CreatedAt: time.Date(2000, 8, 1, 0, 0, 0, 0, time.UTC), ID: 2},
					StackTrace: &longTraceStr,
				},
			},
			expectedErrorGroups: []model.ErrorGroup{
				{
					Event:        "error",
					ProjectID:    projectID,
					StackTrace:   longTraceStr,
					Environments: `{}`,
					State:        privateModel.ErrorStateOpen,
				},
			},
		},
	}
	//run tests
	for _, tc := range tests {
		util.RunTestWithDBWipe(t, resolver.DB, func(t *testing.T) {
			project := model.Project{Model: model.Model{ID: projectID}}
			resolver.DB.Create(&project)

			receivedErrorGroups := make(map[string]model.ErrorGroup)
			for _, errorObj := range tc.errorsToInsert {
				var frames []*publicModel.StackFrameInput
				if errorObj.StackTrace != nil && *errorObj.StackTrace != "" {
					if err := json.Unmarshal([]byte(*errorObj.StackTrace), &frames); err != nil {
						t.Fatal(e.Wrap(err, "error unmarshalling error stack trace frames"))
					}
				}

				_, structuredStackTrace, err := resolver.getMappedStackTraceString(context.Background(), frames, 1, &errorObj)
				if err != nil {
					t.Fatal(e.Wrap(err, "error making mapped stacktrace"))
				}

				errorGroup, err := resolver.HandleErrorAndGroup(context.TODO(), &errorObj, structuredStackTrace, nil, 1, nil)
				if err != nil {
					t.Fatal(e.Wrap(err, "error handling error and group"))
				}
				if errorGroup != nil {
					id := strconv.Itoa(errorGroup.ID)
					receivedErrorGroups[id] = *errorGroup
				}
			}
			var i int
			for _, errorGroup := range receivedErrorGroups {
				isEqual, diff, err := areErrorGroupsEqual(&errorGroup, &tc.expectedErrorGroups[i])
				if err != nil {
					t.Fatal(e.Wrap(err, "error comparing two error groups"))
				}
				if !isEqual {
					t.Fatalf("received error group not equal to expected error group. diff: %+v", diff)
				}
				i++
			}
		})
	}
}

func TestMatchErrorsWithSameTracesDifferentBodies(t *testing.T) {
	stacktrace := `[{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/schema.resolvers.go","lineNumber":6517,"functionName":"Admin","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/resolver.go","lineNumber":216,"functionName":"getCurrentAdmin","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/schema.resolvers.go","lineNumber":6609,"functionName":"AdminRoleByProject","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":44838,"functionName":"func2","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":72,"functionName":"func4","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":110,"functionName":"1","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/sdk/highlight-go/tracer.go","lineNumber":59,"functionName":"InterceptField","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":109,"functionName":"func8","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":110,"functionName":"1","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/util/tracer.go","lineNumber":45,"functionName":"InterceptField","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":109,"functionName":"func8","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":44836,"functionName":"_Query_admin_role_by_project","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":66748,"functionName":"func316","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":69,"functionName":"func3","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":66753,"functionName":"func317","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null}]`

	var structuredStackTrace []*privateModel.ErrorTrace
	err := json.Unmarshal([]byte(stacktrace), &structuredStackTrace)
	if err != nil {
		t.Fatal("failed to generate structured stacktrace")
	}

	util.RunTestWithDBWipe(t, resolver.DB, func(t *testing.T) {
		project := model.Project{}
		resolver.DB.Create(&project)

		errorObject := model.ErrorObject{
			Event:      "error 1",
			ProjectID:  project.ID,
			StackTrace: &stacktrace,
		}

		errorGroup1, err := resolver.HandleErrorAndGroup(context.TODO(), &errorObject, structuredStackTrace, nil, project.ID, nil)
		assert.NoError(t, err)

		errorObject = model.ErrorObject{
			Event:      "error 2",
			ProjectID:  project.ID,
			StackTrace: &stacktrace,
		}

		errorGroup2, err := resolver.HandleErrorAndGroup(context.TODO(), &errorObject, structuredStackTrace, nil, project.ID, nil)
		assert.NoError(t, err)

		assert.Equal(t, errorGroup1.ID, errorGroup2.ID, "should return the same error group id")
	})
}

func TestUpdatingErrorState(t *testing.T) {
	ctx := context.TODO()

	stacktrace := `[{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/schema.resolvers.go","lineNumber":6517,"functionName":"Admin","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/resolver.go","lineNumber":216,"functionName":"getCurrentAdmin","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/schema.resolvers.go","lineNumber":6609,"functionName":"AdminRoleByProject","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":44838,"functionName":"func2","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":72,"functionName":"func4","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":110,"functionName":"1","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/sdk/highlight-go/tracer.go","lineNumber":59,"functionName":"InterceptField","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":109,"functionName":"func8","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":110,"functionName":"1","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/util/tracer.go","lineNumber":45,"functionName":"InterceptField","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":109,"functionName":"func8","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":44836,"functionName":"_Query_admin_role_by_project","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":66748,"functionName":"func316","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/go-workspace/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go","lineNumber":69,"functionName":"func3","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null},{"fileName":"/Users/ericthomas/code/highlight/backend/private-graph/graph/generated/generated.go","lineNumber":66753,"functionName":"func317","columnNumber":null,"error":"github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin","sourceMappingErrorMetadata":null,"lineContent":null,"linesBefore":null,"linesAfter":null}]`

	var structuredStackTrace []*privateModel.ErrorTrace
	err := json.Unmarshal([]byte(stacktrace), &structuredStackTrace)
	if err != nil {
		t.Fatal("failed to generate structured stacktrace")
	}

	util.RunTestWithDBWipe(t, resolver.DB, func(t *testing.T) {
		project := model.Project{}
		resolver.DB.Create(&project)

		errorObject1 := model.ErrorObject{
			Event:      "error",
			ProjectID:  project.ID,
			StackTrace: &stacktrace,
		}

		errorGroup, err := resolver.HandleErrorAndGroup(ctx, &errorObject1, structuredStackTrace, nil, project.ID, nil)
		assert.NoError(t, err)
		assert.Equal(t, errorGroup.State, privateModel.ErrorStateOpen)

		// Resolve
		_, err = resolver.Store.UpdateErrorGroupStateBySystem(ctx, store.UpdateErrorGroupParams{
			ID:    errorGroup.ID,
			State: privateModel.ErrorStateResolved,
		})
		assert.NoError(t, err)

		errorObject2 := model.ErrorObject{
			Event:      "error",
			ProjectID:  project.ID,
			StackTrace: &stacktrace,
		}

		errorGroup, err = resolver.HandleErrorAndGroup(ctx, &errorObject2, structuredStackTrace, nil, project.ID, nil)
		assert.NoError(t, err)
		assert.Equal(t, errorGroup.State, privateModel.ErrorStateOpen)

		// Ignore
		_, err = resolver.Store.UpdateErrorGroupStateBySystem(ctx, store.UpdateErrorGroupParams{
			ID:    errorGroup.ID,
			State: privateModel.ErrorStateIgnored,
		})
		assert.NoError(t, err)

		errorObject3 := model.ErrorObject{
			Event:      "error",
			ProjectID:  project.ID,
			StackTrace: &stacktrace,
		}

		errorGroup, err = resolver.HandleErrorAndGroup(ctx, &errorObject3, structuredStackTrace, nil, project.ID, nil)
		assert.NoError(t, err)
		assert.Equal(t, errorGroup.State, privateModel.ErrorStateIgnored) // Should stay ignored

	})
}

func TestResolver_isExcludedError(t *testing.T) {
	assert.False(t, isExcludedError(context.Background(), []string{}, "", 1))
	assert.True(t, isExcludedError(context.Background(), []string{}, "[{}]", 2))
	assert.True(t, isExcludedError(context.Background(), []string{".*a+.*"}, "foo bar baz", 3))
	assert.False(t, isExcludedError(context.Background(), []string{"("}, "foo bar baz", 4))
}

// areErrorGroupsEqual compares two error objects while ignoring the Model and SecureID field
// a and b MUST be pointers, otherwise this won't work
func areErrorGroupsEqual(a *model.ErrorGroup, b *model.ErrorGroup) (bool, []string, error) {
	if reflect.TypeOf(a) != reflect.TypeOf(b) {
		return false, nil, e.New("interfaces to compare aren't the same time")
	}

	aReflection := reflect.ValueOf(a)
	// Check if the passed interface is a pointer
	if aReflection.Type().Kind() != reflect.Ptr {
		return false, nil, e.New("`a` is not a pointer")
	}
	// 'dereference' with Elem() and get the field by name
	aModelField := aReflection.Elem().FieldByName("Model")
	aSecureIDField := aReflection.Elem().FieldByName("SecureID")
	aStackTraceField := aReflection.Elem().FieldByName("StackTrace")

	bReflection := reflect.ValueOf(b)
	// Check if the passed interface is a pointer
	if bReflection.Type().Kind() != reflect.Ptr {
		return false, nil, e.New("`b` is not a pointer")
	}
	// 'dereference' with Elem() and get the field by name
	bModelField := bReflection.Elem().FieldByName("Model")
	bSecureIDField := bReflection.Elem().FieldByName("SecureID")
	bStackTraceField := bReflection.Elem().FieldByName("StackTrace")

	if aModelField.IsValid() && bModelField.IsValid() {
		// override Model on b with a's model
		bModelField.Set(aModelField)
	} else if aModelField.IsValid() || bModelField.IsValid() {
		// return error if one has a model and the other doesn't
		return false, nil, e.New("one interface has a model and the other doesn't")
	}

	if aSecureIDField.IsValid() && bSecureIDField.IsValid() {
		// override SecureID on b with a's SecureID
		bSecureIDField.Set(aSecureIDField)
	} else if aSecureIDField.IsValid() || bSecureIDField.IsValid() {
		// return error if one has a SecureID and the other doesn't
		return false, nil, e.New("one interface has a SecureID and the other doesn't")
	}

	if aStackTraceField.IsValid() && bStackTraceField.IsValid() {
		// override StackTrace on b with a's StackTrace
		bStackTraceField.Set(aStackTraceField)
	} else if aStackTraceField.IsValid() || bStackTraceField.IsValid() {
		// return error if one has a StackTrace and the other doesn't
		return false, nil, e.New("one interface has a StackTrace and the other doesn't")
	}

	// get diff
	diff := deep.Equal(aReflection.Interface(), bReflection.Interface())
	isEqual := len(diff) == 0

	return isEqual, diff, nil
}

func Test_WithinQuota_CommittedPricing(t *testing.T) {
	ctx := context.TODO()

	util.RunTestWithDBWipe(t, resolver.DB, func(t *testing.T) {
		resolver.DB.Create(&model.Project{
			Model: model.Model{
				ID: 1,
			},
			WorkspaceID: 1,
		})
		resolver.DB.Create(&model.Project{
			Model: model.Model{
				ID: 2,
			},
			WorkspaceID: 2,
		})

		jan1 := time.Date(2023, time.January, 1, 0, 0, 0, 0, time.UTC)
		feb1 := jan1.AddDate(0, 1, 0)
		workspaceBasic := model.Workspace{
			Model: model.Model{
				ID: 1,
			},
			PlanTier:           privateModel.PlanTypeBasic.String(),
			SessionsMaxCents:   pointy.Int(500),
			BillingPeriodStart: &jan1,
			BillingPeriodEnd:   &feb1,
		}
		resolver.DB.Create(&workspaceBasic)

		workspaceUsageBased := model.Workspace{
			Model: model.Model{
				ID: 2,
			},
			PlanTier:           privateModel.PlanTypeUsageBased.String(),
			SessionsMaxCents:   pointy.Int(500),
			BillingPeriodStart: &jan1,
			BillingPeriodEnd:   &feb1,
		}
		resolver.DB.Create(&workspaceUsageBased)

		// workspace 1: basic (10k included), 1k overage, $5 = 1k sessions until limit. within limit.
		// workspace 2: usage based (500 included), 500 overage, $5 = 250 sessions until limit. not within limit.
		resolver.DB.Exec(`drop materialized view daily_session_counts_view`)
		resolver.DB.Exec(`
			select * into daily_session_counts_view 
			from (
				select 1 as project_id, '2023-01-01'::date as date, 11000 as count
				union all select 1, '2023-01-02'::date, 0
				union all select 2, '2023-01-01'::date, 1000
				union all select 2, '2023-01-02'::date, 0) a
		`)

		basicWithinBillingQuota, _ := resolver.IsWithinQuota(ctx, pricing.ProductTypeSessions, &workspaceBasic, time.Now())
		assert.True(t, basicWithinBillingQuota)

		usageBasedWithinBillingQuota, _ := resolver.IsWithinQuota(ctx, pricing.ProductTypeSessions, &workspaceUsageBased, time.Now())
		assert.False(t, usageBasedWithinBillingQuota)
	})
}
