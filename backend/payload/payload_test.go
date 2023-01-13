package payload

import (
	"io"
	"os"
	"testing"
)

func TestPayloadReader(t *testing.T) {
	f, err := os.Open("./test-one.events.txt")
	if err != nil {
		t.Fatalf("error creating file: %v", err)
	}

	r := NewPayloadReadWriter(f)
	reader := r.Reader()
	s, err := reader.Next()
	if err != nil {
		t.Errorf("error not nil: %v", err)
	}
	if s != nil && len(*s) != 5964255 {
		t.Error("first event not the right length :hmm:")
	}
	s, err = reader.Next()
	if err != nil {
		t.Errorf("error not nil: %v", err)
	}
	if s != nil && len(*s) != 355572 {
		t.Error("second event not the right length :hmm:")
	}
	s, err = reader.Next()
	if err != nil {
		t.Errorf("error not nil: %v", err)
	}
	if s != nil && len(*s) != 73227 {
		t.Error("third event not the right length :hmm:")
	}
	s, err = reader.Next()
	if s != nil && len(*s) != 0 {
		t.Error("fourth event not the right length :hmm:")
	}
	if err != io.EOF {
		t.Error("err not EOF")
	}
}
