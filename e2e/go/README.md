## Getting Started

This Go app randomly throws an error.

`go run fiber.go`
`open http://localhost:3456`

Receive either `Hello, World!` if there is no error or `random error from go fiber!` if an error is thrown to Highlight.

Currently, the app cannot be killed. Use `kill -9 $(lsof -t -i:3456)` to kill it manually.