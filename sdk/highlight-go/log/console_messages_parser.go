package hlog

import (
	"encoding/json"
	e "github.com/pkg/errors"
	"strconv"
)

type MessageTrace struct {
	ColumnNumber any    `json:"columnNumber"`
	LineNumber   any    `json:"lineNumber"`
	FileName     string `json:"fileName"`
	FunctionName string `json:"functionName,omitempty"`
	Source       string `json:"source"`
}

type Message struct {
	Type       string         `json:"type"`
	Trace      []MessageTrace `json:"trace"`
	Value      []string       `json:"value"`
	Attributes map[string]any `json:"attributes"`
	Time       int64          `json:"time"`
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
		msg := &Message{
			Type:       message.Type,
			Trace:      message.Trace,
			Time:       message.Time,
			Attributes: message.Attributes,
		}
		if msg.Attributes == nil {
			msg.Attributes = map[string]any{}
		}
		var messageValue []string
		for _, v := range message.Value {
			value, err := strconv.Unquote(v)
			if err != nil {
				value = v
			}
			attrs := map[string]any{}
			if err := json.Unmarshal([]byte(value), &attrs); err == nil {
				for k, v := range attrs {
					msg.Attributes[k] = v
				}
			}
			messageValue = append(messageValue, value)
		}
		msg.Value = messageValue
		rows = append(rows, msg)
	}
	return rows, nil
}
