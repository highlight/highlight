package projectpath

import (
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
	if _, err := os.Stat("/build"); err == nil {
		return "/build"
	}
	return Root
}
