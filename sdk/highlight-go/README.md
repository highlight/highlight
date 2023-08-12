[![Go Report Card](https://goreportcard.com/badge/github.com/highlight/highlight/sdk/highlight-go)](https://goreportcard.com/report/github.com/highlight/highlight/sdk/highlight-go)
[![GoDoc](https://godoc.org/github.com/highlight/highlight/sdk/highlight-go?status.svg)](https://godoc.org/github.com/highlight/highlight/sdk/highlight-go)

# highlight-go

Official implementation of the Highlight backend client in Go.

## Usage

First, import the package

```
go get -u github.com/highlight/highlight/sdk/highlight-go
```

Then, add the following lines to your applications main function:

```go
import (
	"github.com/highlight/highlight/sdk/highlight-go"
)

func main() {
	//...application logic...
	highlight.Start()
	defer highlight.Stop()
	//...application logic...
}
```

Then, use a highlight middleware in your apps router:

if you're using `go-chi/chi`:

```go
import (
	highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
)

func main() {
	//...
	r := chi.NewMux()
	r.Use(highlightChi.Middleware)
	//...
}
```

if you're using `gin-gonic/gin`:

```go
import (
	highlightGin "github.com/highlight/highlight/sdk/highlight-go/middleware/gin"
)

func main() {
	//...
	r := gin.New()
	r.Use(highlightGin.Middleware())
	//...
}
```

Finally, it's time to consume errors. Add the following line to your error handling:

```go
func someEndpoint() {
	err := someFuntionCall()
	if err != nil {
		highlight.ConsumeError(err)
		// including optional tags:
		highlight.ConsumeError(err, "environment:dev", "important")
	}
}
```
