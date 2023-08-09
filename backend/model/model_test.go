package model

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func Test_FromVerboseID(t *testing.T) {
	id, _ := FromVerboseID("1jdkoe52")
	assert.Equal(t, 1, id)
}
