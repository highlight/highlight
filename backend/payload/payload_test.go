package payload

import (
	"os"
	"testing"

	"log"
)

func TestPayloadReader(t *testing.T) {
	f, err := os.Open("/tmp/15289.events.txt")
	if err != nil {
		t.Fatalf("error creating file: %v", err)
	}

	r := NewPayloadReadWriter(f)
	reader := r.Reader()
	s, err := reader.Next()
	if s != nil {
		log.Println("one", len(*s))
	}
	log.Printf("err: %v\n", err)
	s, err = reader.Next()
	if s != nil {
		log.Println("two", len(*s))
	}
	log.Printf("err: %v\n", err)
	s, err = reader.Next()
	if s != nil {
		log.Println("three", len(*s))
	}
	log.Printf("err: %v\n", err)
	s, err = reader.Next()
	if s != nil {
		log.Println("four", len(*s))
	}
	log.Printf("err: %v\n", err)
}
