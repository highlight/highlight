package hlog

import (
	"encoding/json"
	e "github.com/pkg/errors"
	"strconv"
)

type Trace struct {
	ColumnNumber int    `json:"columnNumber"`
	LineNumber   int    `json:"lineNumber"`
	FileName     string `json:"fileName"`
	FunctionName string `json:"functionName,omitempty"`
	Source       string `json:"source"`
}

type Message struct {
	Type  string   `json:"type"`
	Trace []Trace  `json:"trace"`
	Value []string `json:"value"`
	Time  int64    `json:"time"`
}

type Messages struct {
	Messages []Message `json:"messages"`
}

func ParseConsoleMessages(messages string) ([]*Message, error) {
	messagesParsed := Messages{}
	if err := json.Unmarshal([]byte(messages), &messagesParsed); err != nil {
		return nil, e.Wrap(err, "error decoding message data")
	}

	var rows []*Message
	for _, message := range messagesParsed.Messages {
		var messageValue []string
		for _, v := range message.Value {
			unquotedMessage, err := strconv.Unquote(v)
			if err != nil {
				messageValue = append(messageValue, v)
			} else {
				messageValue = append(messageValue, unquotedMessage)
			}
		}
		rows = append(rows, &Message{
			Type:  message.Type,
			Trace: message.Trace,
			Value: messageValue,
			Time:  message.Time,
		})
	}
	return rows, nil
}
