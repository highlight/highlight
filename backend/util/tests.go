package util

import (
	"encoding/json"
	"testing"

	e "github.com/pkg/errors"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
)

func RunTest(t *testing.T, name string, db *gorm.DB, f func(t *testing.T)) {
	defer func(db *gorm.DB) {
		err := model.ClearTablesInDB(db)
		if err != nil {
			t.Fatal(e.Wrap(err, "error clearing database"))
		}
	}(db)
	t.Run(name, f)
}

func MakeIntPointer(v int) *int {
	return &v
}

func MakeStringPointer(v string) *string {
	return &v
}

func MakeStringPointerFromInterface(v interface{}) *string {
	exampleErrorTraceBytes, _ := json.Marshal(&v)
	exampleErrorTraceString := string(exampleErrorTraceBytes)
	return &exampleErrorTraceString
}
