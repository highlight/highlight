package github

import (
	"context"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestGetTree(t *testing.T) {
	ctx := context.Background()
	// the highlight app installation - this is not a secret (the private key is)
	client, err := NewClient(ctx, "41782426", nil)
	if err != nil {
		t.Fatal(err)
	}
	_, dir, _, err := client.GetRepoContent(ctx, "highlight/highlight", "enterprise", "")
	if err != nil {
		t.Fatal(err)
	}
	for _, x := range dir {
		t.Logf("%+v", *x.Name)
	}
	assert.Greaterf(t, len(dir), 0, "expected files to exist")
}
