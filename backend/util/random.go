package util

import (
	"math/rand"
)

// letters contains alphanumeric characters used for random string generation
const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// GenerateRandomString creates a random string of the specified length
// using alphanumeric characters. This is typically used for generating
// unique identifiers, tokens, or test data.
func GenerateRandomString(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
