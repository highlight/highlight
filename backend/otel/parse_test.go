package otel

import (
	"encoding/json"
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func FuzzFormatStructureStackTrace(f *testing.F) {
	f.Fuzz(func(t *testing.T, stackTrace string) {
		formatStructureStackTrace(stackTrace)
	})
}

func TestFormatStructureStackTrace(t *testing.T) {
	var inputs = []struct {
		language           string
		stacktrace         string
		expectedFrameError string
	}{
		{language: "trpc", stacktrace: "Error: oh no!\n    at Procedure.resolve [as resolver] (webpack-internal:///(api)/./src/server/routers/name.ts:18:19)\n    at Array.<anonymous> (/Users/vkorolik/work/web-test/trpc-nextjs-demo-internal/node_modules/@trpc/server/dist/router-ee876044.cjs.dev.js:101:36)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\n    at async callRecursive (/Users/vkorolik/work/web-test/trpc-nextjs-demo-internal/node_modules/@trpc/server/dist/router-ee876044.cjs.dev.js:119:24)\n    at async Procedure.call (/Users/vkorolik/work/web-test/trpc-nextjs-demo-internal/node_modules/@trpc/server/dist/router-ee876044.cjs.dev.js:144:20)\n    at async eval (webpack-internal:///(api)/./node_modules/@trpc/server/dist/resolveHTTPResponse-ab01e4b9.cjs.dev.js:205:24)\n    at async Promise.all (index 0)\n    at async Object.resolveHTTPResponse (webpack-internal:///(api)/./node_modules/@trpc/server/dist/resolveHTTPResponse-ab01e4b9.cjs.dev.js:201:24)\n    at async Object.nodeHTTPRequestHandler (webpack-internal:///(api)/./node_modules/@trpc/server/dist/nodeHTTPRequestHandler-9a93c255.cjs.dev.js:68:18)\n    at async eval (webpack-internal:///(api)/./node_modules/@trpc/server/adapters/next/dist/trpc-server-adapters-next.cjs.dev.js:48:5)", expectedFrameError: "Error: oh no!"},
		{language: "python", stacktrace: "Traceback (most recent call last):\n  File \"/Users/vkorolik/Library/Caches/pypoetry/virtualenvs/highlight-io-T_znYNk9-py3.10/lib/python3.10/site-packages/flask/app.py\", line 2525, in wsgi_app\n    response = self.full_dispatch_request()\n  File \"/Users/vkorolik/Library/Caches/pypoetry/virtualenvs/highlight-io-T_znYNk9-py3.10/lib/python3.10/site-packages/flask/app.py\", line 1822, in full_dispatch_request\n    rv = self.handle_user_exception(e)\n  File \"/Users/vkorolik/Library/Caches/pypoetry/virtualenvs/highlight-io-T_znYNk9-py3.10/lib/python3.10/site-packages/flask/app.py\", line 1820, in full_dispatch_request\n    rv = self.dispatch_request()\n  File \"/Users/vkorolik/Library/Caches/pypoetry/virtualenvs/highlight-io-T_znYNk9-py3.10/lib/python3.10/site-packages/flask/app.py\", line 1796, in dispatch_request\n    return self.ensure_sync(self.view_functions[rule.endpoint])(**view_args)\n  File \"/Users/vkorolik/work/highlight/sdk/highlight-py/examples/app.py\", line 25, in hello\n    raise Exception(f\"random error! {idx}\")\nException: random error! 106\n", expectedFrameError: "Exception: random error! 106"},
		{language: "golang", stacktrace: "\ngithub.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin\n\t/build/backend/private-graph/graph/schema.resolvers.go:6081\ngithub.com/highlight-run/highlight/backend/private-graph/graph/generated.(*executionContext)._Query_admin.func2\n\t/build/backend/private-graph/graph/generated/generated.go:39227\ngithub.com/99designs/gqlgen/graphql/executor.processExtensions.func4\n\t/go/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go:72\ngithub.com/99designs/gqlgen/graphql/executor.processExtensions.func8.1\n\t/go/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go:110\ngithub.com/highlight/highlight/sdk/highlight-go.Tracer.InterceptField\n\t/build/sdk/highlight-go/tracer.go:47\ngithub.com/99designs/gqlgen/graphql/executor.processExtensions.func8\n\t/go/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go:109\ngithub.com/99designs/gqlgen/graphql/executor.processExtensions.func8.1\n\t/go/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go:110\ngithub.com/highlight-run/highlight/backend/util.Tracer.InterceptField\n\t/build/backend/util/tracer.go:45\ngithub.com/99designs/gqlgen/graphql/executor.processExtensions.func8\n\t/go/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go:109\ngithub.com/highlight-run/highlight/backend/private-graph/graph/generated.(*executionContext)._Query_admin\n\t/build/backend/private-graph/graph/generated/generated.go:39225\ngithub.com/highlight-run/highlight/backend/private-graph/graph/generated.(*executionContext)._Query.func280\n\t/build/backend/private-graph/graph/generated/generated.go:59279\ngithub.com/99designs/gqlgen/graphql/executor.processExtensions.func3\n\t/go/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/executor/extensions.go:69\ngithub.com/highlight-run/highlight/backend/private-graph/graph/generated.(*executionContext)._Query.func281\n\t/build/backend/private-graph/graph/generated/generated.go:59284\ngithub.com/highlight-run/highlight/backend/private-graph/graph/generated.(*executionContext)._Query.func282\n\t/build/backend/private-graph/graph/generated/generated.go:59288\ngithub.com/99designs/gqlgen/graphql.(*FieldSet).Dispatch.func1\n\t/go/pkg/mod/github.com/99designs/gqlgen@v0.17.24/graphql/fieldset.go:42\nruntime.goexit\n\t/usr/local/go/src/runtime/asm_arm64.s:1172", expectedFrameError: "github.com/highlight-run/highlight/backend/private-graph/graph.(*queryResolver).Admin"},
		{language: "golang-panic", stacktrace: "\npanic: yo [recovered]\n\tpanic: yo\n\ngoroutine 22 [running]:\ntesting.tRunner.func1.2({0x103bc2120, 0x103de83a0})\n\t/usr/local/go/src/testing/testing.go:1396 +0x1c8\ntesting.tRunner.func1()\n\t/usr/local/go/src/testing/testing.go:1399 +0x378\npanic({0x103bc2120, 0x103de83a0})\n\t/usr/local/go/src/runtime/panic.go:884 +0x204\ngithub.com/highlight-run/highlight/backend/otel.structureStackTrace({0x10386edd2, 0x4d3})\n\t/Users/vkorolik/work/highlight/backend/otel/parse.go:48 +0x270\ngithub.com/highlight-run/highlight/backend/otel.TestFormatStructureStackTrace.func1(0x0?)\n\t/Users/vkorolik/work/highlight/backend/otel/parse_test.go:27 +0x38\ntesting.tRunner(0x14000a4e000, 0x14000a205b0)\n\t/usr/local/go/src/testing/testing.go:1446 +0x10c\ncreated by testing.(*T).Run\n\t/usr/local/go/src/testing/testing.go:1493 +0x300\n", expectedFrameError: "panic: yo [recovered]"},
		{language: "next.js-backend", stacktrace: "Error: GraphQL Error (Code: 401): {\"response\":{\"error\":\"{\\\"errors\\\":[{\\\"message\\\":\\\"token verification failed: token contains an invalid number of segments\\\"}],\\\"data\\\":null}\",\"status\":401,\"headers\":{}},\"request\":{\"query\":\"\\n      query GetPosts() {\\n        posts(orderBy: publishedAt_DESC) {\\n          slug\\n        }\\n      }\\n    \"}}\n    at /Users/jaykhatri/projects/highlight.io/node_modules/graphql-request/dist/index.js:416:31\n    at step (/Users/jaykhatri/projects/highlight.io/node_modules/graphql-request/dist/index.js:67:23)\n    at Object.next (/Users/jaykhatri/projects/highlight.io/node_modules/graphql-request/dist/index.js:48:53)\n    at fulfilled (/Users/jaykhatri/projects/highlight.io/node_modules/graphql-request/dist/index.js:39:58)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)", expectedFrameError: "Error: GraphQL Error (Code: 401): {\"response\":{\"error\":\"{\\\"errors\\\":[{\\\"message\\\":\\\"token verification failed: token contains an invalid number of segments\\\"}],\\\"data\\\":null}\",\"status\":401,\"headers\":{}},\"request\":{\"query\":\"\\n      query GetPosts() {\\n        posts(orderBy: publishedAt_DESC) {\\n          slug\\n        }\\n      }\\n    \"}}"},
	}
	for _, input := range inputs {
		t.Run(input.language, func(t *testing.T) {
			frames, err := structureStackTrace(input.stacktrace)
			str, _ := json.MarshalIndent(frames, "", "\t")
			fmt.Printf("%s\n", str)
			assert.NoErrorf(t, err, "unexpected error")
			for _, frame := range frames {
				assert.NotNil(t, frame)
				assert.NotNil(t, frame.FileName)
				assert.GreaterOrEqual(t, len(*frame.FileName), 1)
				assert.Equal(t, input.expectedFrameError, *frame.Error)
			}
		})
	}
}
