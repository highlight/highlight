package projectpath

import (
	"github.com/highlight-run/highlight/backend/util"
	"os"
	"path/filepath"
	"runtime"
)

var (
	_, b, _, _ = runtime.Caller(0)

	// Root folder of the `backend` directory
	// Returns ~/path/to/highlight/backend
	Root = filepath.Join(filepath.Dir(b), "..")
)

func GetRoot() string {
	if util.IsBackendInDocker() {
		if _, err := os.Stat(Root); os.IsNotExist(err) {
			return "/build"
		}
	}
	return Root
}
